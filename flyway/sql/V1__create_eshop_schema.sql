-- Schema copied from backend/database.js; original constraints preserved.

CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        );

CREATE TABLE coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE,
            type TEXT DEFAULT 'percent',
            discount_value INTEGER,
            min_order_amount INTEGER DEFAULT 0,
            expired_at DATETIME,
            is_active INTEGER DEFAULT 1,
            max_uses_per_user INTEGER DEFAULT 1
        );

CREATE TABLE coupon_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coupon_id INTEGER,
            user_id INTEGER,
            used_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            password TEXT,
            role TEXT DEFAULT 'user',
            login_attempts INTEGER DEFAULT 0,
            locked_until DATETIME,
            reset_token TEXT,
            shipping_address TEXT,
            phone TEXT
        );

CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            description TEXT,
            imageUrl TEXT,
            category_id INTEGER
        );

CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount INTEGER,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
