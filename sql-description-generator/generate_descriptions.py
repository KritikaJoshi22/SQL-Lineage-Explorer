import os
import requests
import sqlparse
from sqllineage.runner import LineageRunner
import pandas as pd
from dotenv import load_dotenv
from typing import List, Tuple, Dict
import re
import json

# Load environment variables
load_dotenv()

# Hugging Face API settings
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/google/gemma-2-2b-it"
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

def query_huggingface(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 200,
            "temperature": 0.3,
            "return_full_text": False
        }
    }
    try:
        response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()[0]["generated_text"].strip()
    except Exception as e:
        print(f"Error querying Hugging Face API: {e}")
        return "Description generation failed."

def extract_table_info(sql_query: str) -> Dict:
    """Extract target and source tables from a SQL query."""
    # Detect CREATE TABLE
    create_match = re.search(r"CREATE TABLE\s+(\w+)", sql_query, re.IGNORECASE)
    target_table = create_match.group(1) if create_match else None

    # Detect FROM clause (source tables)
    from_matches = re.findall(r"FROM\s+(\w+)", sql_query, re.IGNORECASE)
    source_tables = from_matches if from_matches else []

    # If there's no CREATE TABLE but there's a FROM clause, assume the source table is also the target
    if not target_table and source_tables:
        target_table = source_tables[0]  # Assume the first FROM table is the result set's name

    return {
        "target_table": target_table if target_table else "unknown_table",
        "source_tables": source_tables
    }


def extract_columns_from_query(sql_query: str) -> List[Dict]:
    """Extracting all columns and their context from a SQL query."""
    parsed = sqlparse.parse(sql_query)[0]
    table_info = extract_table_info(sql_query)
    columns = []
    
    # Finding the SELECT statement
    select_found = False
    column_section = None
    
    for token in parsed.tokens:
        if token.is_keyword and token.value.upper() == 'SELECT':
            select_found = True
            continue
        if select_found and isinstance(token, (sqlparse.sql.IdentifierList, sqlparse.sql.Identifier)):
            column_section = token
            break
    
    if column_section:
        if isinstance(column_section, sqlparse.sql.IdentifierList):
            identifiers = column_section.get_identifiers()
        else:
            identifiers = [column_section]
            
        for identifier in identifiers:
            column_name = identifier.get_alias() or identifier.get_real_name()
            if column_name:
                source_col = str(identifier.tokens[0]) if identifier.tokens else column_name
                columns.append({
                    'table_name': table_info['target_table'],
                    'column_name': column_name,
                    'source_table': table_info['source_tables'][0] if table_info['source_tables'] else None,
                    'source_column': source_col,
                    'full_definition': str(identifier).strip(),
                    'has_transformation': str(identifier).strip() != column_name
                })
    
    return columns

def generate_column_description(column_info: Dict, sql_query: str) -> str:
    """Generating a concise but detailed description for a column."""
    context = f"""
    This column is part of the table '{column_info['table_name']}' and is sourced from '{column_info['source_table']}' if applicable.
    Original column definition: {column_info['full_definition']}
    Source column: {column_info['source_column']}
    Has transformation: {column_info['has_transformation']}
    """
    
    prompt = f"""
    Based on this SQL query:
    ```sql
    {sql_query}
    ```
    
    And this context:
    {context}
    
    Generate a technical description for the column '{column_info['table_name']}.{column_info['column_name']}' that includes:
    1. The business purpose of this column
    2. Where the data comes from (source table and column)
    3. Any transformations or filters applied, mention only if applied or else skip mentioning anything about tranformation
    4. Any relevant conditions or constraints, mention only if applied or else skipmentioning anything about conditions and constraints
    
    Format as a single paragraph without any markdown or prefixes. Focus on being precise and informative.
    """
    
    description = query_huggingface(prompt)
    return description.strip()

def process_sql_query(sql_content: str) -> Dict:
    """Process a single SQL query and return analysis results as a dictionary."""
    try:
        # Clean and validate SQL
        sql_content = sql_content.strip()
        if not sql_content or not re.search(r'CREATE|INSERT|SELECT', sql_content, re.IGNORECASE):
            return {"error": "Invalid or empty SQL query"}

        # Get all columns for this query
        columns = extract_columns_from_query(sql_content)
        if not columns:
            return {"error": "No columns found in query"}

        # Generate descriptions for all columns
        column_descriptions = []
        for col in columns:
            description = generate_column_description(col, sql_content)
            column_descriptions.append({
                'column_name': f"{col['table_name']}.{col['column_name']}",
                'table_name': col['table_name'],
                'source_table': col['source_table'],
                'source_column': col['source_column'],
                'has_transformation': col['has_transformation'],
                'description': description
            })

        return {
            'sql_query': sql_content,
            'columns': column_descriptions
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import sys
    
    # Check if input is provided via command line
    if len(sys.argv) > 1:
        # Get SQL content from command line argument
        sql_content = sys.argv[1]
    else:
        # Read from stdin for larger SQL content
        sql_content = sys.stdin.read()

    # Process the SQL and output JSON
    result = process_sql_query(sql_content)
    print(json.dumps(result))