CREATE TABLE product_sales_summary AS 
SELECT 
    p.product_id,
    p.name AS product_name,
    SUM(oi.quantity * p.price) AS total_sales
FROM products p 
JOIN order_items oi ON p.product_id = oi.product_id 
GROUP BY p.product_id, p.name