CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    signup_date DATE
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    amount DECIMAL(10, 2),
    discount DECIMAL(10, 2),
    tax DECIMAL(10, 2)
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2),
    manufacturing_cost DECIMAL(10, 2)
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT
);

CREATE TABLE active_customers AS
SELECT 
    customer_id,
    name,
    email
FROM 
    customers
WHERE 
    signup_date >= DATEADD(YEAR, -1, GETDATE());

CREATE TABLE customer_order_summary AS
SELECT 
    o.customer_id,
    COUNT(o.order_id) AS total_orders,
    SUM(o.amount) AS total_amount_spent,
    SUM(o.discount) AS total_discount_given,
    SUM(o.tax) AS total_tax_collected,
    -- Calculate net revenue for each customer
    SUM(o.amount - o.discount + o.tax) AS net_revenue
FROM 
    orders o
GROUP BY 
    o.customer_id;

CREATE TABLE product_sales_summary AS
SELECT 
    p.product_id,
    p.name AS product_name,
    SUM(oi.quantity * p.price) AS total_sales,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.quantity * p.price) / NULLIF(SUM(oi.quantity), 0) AS avg_revenue_per_unit,
    SUM(oi.quantity * (p.price - p.manufacturing_cost)) AS total_profit,
    CASE 
        WHEN SUM(oi.quantity * p.price) > 0 
        THEN SUM(oi.quantity * (p.price - p.manufacturing_cost)) / SUM(oi.quantity * p.price)
        ELSE 0
    END AS profit_margin
FROM 
    products p
JOIN 
    order_items oi ON p.product_id = oi.product_id
GROUP BY 
    p.product_id, p.name;

CREATE TABLE customer_full_data AS
SELECT 
    ac.customer_id,
    ac.name AS customer_name,
    ac.email,
    cos.total_orders,
    cos.total_amount_spent,
    cos.total_discount_given,
    cos.total_tax_collected,
    cos.net_revenue,
    CASE 
        WHEN cos.total_orders > 0 
        THEN cos.total_amount_spent / cos.total_orders
        ELSE 0
    END AS avg_order_value
FROM 
    active_customers ac
LEFT JOIN 
    customer_order_summary cos ON ac.customer_id = cos.customer_id;

CREATE TABLE customer_enriched_data AS
SELECT 
    cfd.customer_id,
    cfd.customer_name,
    cfd.email,
    cfd.total_orders,
    cfd.total_amount_spent,
    cfd.net_revenue,
    cfd.avg_order_value,
    cfd.total_tax_collected,
    pc.category AS favorite_category,
    pc.total_quantity AS favorite_category_quantity,
    pc.total_sales AS favorite_category_sales,
    CASE 
        WHEN pc.total_quantity > 0 
        THEN pc.total_sales / pc.total_quantity
        ELSE 0
    END AS avg_spent_per_item_in_favorite_category
FROM 
    customer_full_data cfd
LEFT JOIN (
    SELECT 
        oi.customer_id,
        p.category,
        COUNT(*) AS category_count,
        SUM(oi.quantity) AS total_quantity,
        SUM(oi.quantity * p.price) AS total_sales
    FROM 
        order_items oi
    JOIN 
        products p ON oi.product_id = p.product_id
    GROUP BY 
        oi.customer_id, p.category
) pc ON cfd.customer_id = pc.customer_id;

CREATE TABLE customer_analytics_report AS
SELECT 
    ced.customer_id,
    ced.customer_name,
    ced.email,
    ced.total_orders,
    ced.total_amount_spent,
    ced.net_revenue,
    ced.avg_order_value,
    ced.favorite_category,
    ced.favorite_category_quantity,
    ced.favorite_category_sales,
    ced.avg_spent_per_item_in_favorite_category,
    ps.total_units_sold AS top_category_units_sold,
    ps.total_sales AS top_category_sales,
    ps.total_profit AS top_category_profit,
    ps.profit_margin AS top_category_profit_margin
FROM 
    customer_enriched_data ced
LEFT JOIN 
    product_sales_summary ps ON ced.favorite_category = ps.category;
