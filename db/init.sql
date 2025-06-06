CREATE DATABASE IF NOT EXISTS sales_crm 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sales_crm;

-- Справочник товаров
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    UNIQUE KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Справочник марок авто
CREATE TABLE IF NOT EXISTS car_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    UNIQUE KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Справочник контрагентов (клиентов)
CREATE TABLE IF NOT EXISTS counterparties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    UNIQUE KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Справочник гос. номеров
CREATE TABLE IF NOT EXISTS car_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL,
    UNIQUE KEY (number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Категории расходов
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    UNIQUE KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Наличные продажи
CREATE TABLE IF NOT EXISTS cash_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    car_brand VARCHAR(50) NOT NULL,
    car_number VARCHAR(20) NOT NULL,
    product VARCHAR(50) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (date),
    INDEX (car_brand),
    INDEX (car_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Клиентские продажи
CREATE TABLE IF NOT EXISTS client_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    counterparty VARCHAR(100) NOT NULL,
    car_brand VARCHAR(50) NOT NULL,
    car_number VARCHAR(20) NOT NULL,
    product VARCHAR(50) NOT NULL,
    volume DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (date),
    INDEX (counterparty),
    INDEX (car_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Расходы
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (date),
    INDEX (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Начальные данные
INSERT IGNORE INTO expense_categories (name) VALUES 
('Солярка'), ('849'), ('Ойлик пули'), ('Темур'), ('Фазлиддин');

INSERT IGNORE INTO products (name) VALUES 
('Клинец'), ('Щебень'), ('Компот'), ('Песок'), ('Отход'), ('Другие');

INSERT IGNORE INTO counterparties (name) VALUES 
('Light print service MCHJ'), ('Oazis mega construkctions');
