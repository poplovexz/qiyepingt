-- 删除已存在的表和触发器（按照依赖关系顺序删除）
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 先删除依赖表
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;