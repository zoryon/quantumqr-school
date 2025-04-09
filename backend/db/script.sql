-- DBs AND TABLES' SQL SCRIPT
CREATE DATABASE quantumqr;
USE quantumqr;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    hasAllowedEmails BOOLEAN DEFAULT FALSE,
    isEmailConfirmed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cardtypes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE tiers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,  -- ('Free', 'Basic', 'Pro', 'Enterprise')
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    maxQRCodes INT DEFAULT 10,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE paymentmethods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cardTypeId INT NOT NULL,
    iban VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (cardTypeId) REFERENCES cardtypes(id)
);

CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    tierId INT NOT NULL,
    paymentMethodId INT ,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    canceledAt TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (tierId) REFERENCES tiers(id),
    FOREIGN KEY (paymentMethodId) REFERENCES paymentmethods(id)
);

CREATE TABLE qrcodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    url TEXT NOT NULL,
    scans INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uniqueUserIdName UNIQUE (userId, name)
);

CREATE TABLE classicqrcodes (
    qrCodeId INT PRIMARY KEY,
    websiteUrl VARCHAR(255),
    FOREIGN KEY (qrCodeId) REFERENCES qrcodes(id) ON DELETE CASCADE
);

CREATE TABLE vcardqrcodes (
    qrCodeId INT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    websiteUrl VARCHAR(255),
    address VARCHAR(255),
    FOREIGN KEY (qrCodeId) REFERENCES qrcodes(id) ON DELETE CASCADE
);

-- Add default server variables
-- Tiers
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Free", 0, "Free plan which is automatically set for any person who registers.", 10);
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Basic", 4.99, "Basic plan for people who don't need many qr codes, but still get value from them.", 30);
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Pro", 9.99, "Pro plan for people who get quite a lot of value from them.", 50);
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Enterprise", 24.99, "Enterprise plan for organizations which use qr codes often.", 200);

-- Cardtypes
INSERT INTO cardtypes (name) VALUES ("Visa");
INSERT INTO cardtypes (name) VALUES ("Master Card");

-- HELPERS
-- UPDATE subscriptions SET tierId = 2 WHERE userId = 1;

-- FUNCTIONS AND PROCEDURES
-- Clean up unconfirmed users procedure
DELIMITER //
CREATE PROCEDURE DeleteUnconfirmedUsers()
BEGIN
    DELETE FROM users
    WHERE isEmailConfirmed = FALSE
    AND createdAt < NOW() - INTERVAL 10 MINUTE;
END //
DELIMITER ;

-- Scheduler to clean up unconfirmed users
CREATE EVENT IF NOT EXISTS DeleteUnconfirmedUsersEvent
ON SCHEDULE EVERY 1 MINUTE
DO
    CALL DeleteUnconfirmedUsers();

-- Activate the event scheduler
SET GLOBAL event_scheduler = ON;