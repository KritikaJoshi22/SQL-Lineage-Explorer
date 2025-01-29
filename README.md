# **SQL Lineage and Metadata Extraction**

## **Project Overview**

This project automates the extraction of metadata from SQL queries, generates data lineage, and visualizes the flow of data within a database ecosystem. The project includes three primary tasks:

1. **Task 1: AI & ML** – Automated generation of descriptions for every column in SQL queries using AI.
2. **Task 2: Backend Development** – Implement APIs for storing SQL data and executing business logic.
3. **Task 3: Frontend Development** – Provide a UI to upload SQL files, process data, and visualize SQL lineage.

---

## **Setup Instructions**

### **Prerequisites**

- Node.js (>=16.x)
- npm or yarn
- Python (>=3.8)
- MongoDB (**Strictly Required** due to backend structure)

### **Installation**

1. **Clone the repository**:

   ```sh
   git clone https://github.com/KritikaJoshi22/ZingleAI-Task.git
   cd ZingleAI Task
   ```

2. **Backend Setup**:

   ```sh
   cd backend
   npm install
   ```

   - **Environment Variables:** Create a `.env` file inside the `backend` folder and add:

     ```sh
     MONGODB_URI=<Your MongoDB URI>
     PORT=5000
     ```

3. **Frontend Setup**:

   ```sh
   cd ../frontend
   npm install
   ```

4. **SQL Description Generator (AIML) Setup**:

   ```sh
   cd ../sql-description-generator
   pip install -r requirements.txt
   ```

   - **Environment Variables:** Create a `.env` file inside the `aiml` folder and add:

     ```sh
     HUGGINGFACE_API_KEY=<Your HuggingFace API Key>
     ```

---

## **Running the Project**

### **Start Backend**

```sh
cd backend
npm run dev
```

### **Start Frontend**

```sh
cd frontend
npm run dev
```

### **Run SQL Description Generator (AIML Component Independently)**

```sh
cd sql-description-generator
python generateDescriptions.py
```

---

## **API Endpoints**

### **1. Upload SQL File (POST)**

- **Endpoint:** `/api/sql/upload`
- **Description:** Accepts SQL files and stores queries in the database.
- **Payload:** File (text format)

### **2. Process SQL Queries & Generate Metadata (GET)**

- **Endpoint:** `/api/sql/analyze`
- **Description:** Reads stored SQL queries, extracts metadata, and generates column descriptions.

---

## **Frontend Features**

- **File Upload:** Users can upload SQL files.
- **"Create Lineage" Button:** Triggers the processing of stored SQL queries.
- **Interactive Graph:** Displays SQL lineage in an interactive visualization.
- **SQL Description Generator:** Uses AI to generate human-readable descriptions for SQL queries.

---

## **Technologies Used**

### **Backend**

- Node.js
- Express.js
- MongoDB

### **Frontend**

- TypeScript
- React.js
- Tailwind CSS
- React-Flow
- shadcn/ui (UI Library)

### **AI/ML (SQL Description Generator)**

- Python
- HuggingFace API

---

## **Upcoming Features**

- **Create Visualization Feature:** This will enhance data lineage visualization with additional insights.

---

## **Contributors**

- **Your Name** – [Kritika Joshi](https://www.linkedin.com/in/kritika-joshi-/)

---
