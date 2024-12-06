-- 订单状态枚举
CREATE TYPE order_status AS ENUM (
    'pending',    -- 待处理
    'processing', -- 处理中
    'completed',  -- 已完成
    'cancelled'   -- 已取消
);

-- 订单主表
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,  -- 订单编号
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status order_status NOT NULL DEFAULT 'pending',
    remarks TEXT,  -- 订单备注
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 订单项表
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 订单历史记录表
CREATE TABLE order_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    remarks TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为订单表添加更新时间触发器
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 添加索引
CREATE INDEX idx_orders_company_id ON orders(company_id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_history_order_id ON order_history(order_id);