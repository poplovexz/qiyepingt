-- 插入管理员用户 (密码: admin123)
INSERT INTO users (
    username,
    password_hash,
    email,
    is_admin,
    is_active
) VALUES (
    'admin',
    '$2b$10$rJ7SzAVF0h.fX4fzT4ZzXOoYl4U2WF3QR8pOGMB7ZpkF4lk.R6Dre',
    'admin@example.com',
    true,
    true
);