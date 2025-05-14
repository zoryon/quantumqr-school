-- DBs AND TABLES' SQL SCRIPT
DROP DATABASE IF EXISTS quantumqr;
CREATE DATABASE quantumqr;
USE quantumqr;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('user', 'admin') DEFAULT 'user',
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    hasAllowedEmails BOOLEAN DEFAULT FALSE,
    isEmailConfirmed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE banned_users (
    userId INT PRIMARY KEY,
    bannerAdminId INT NULL,
    endsAt TIMESTAMP NULL,
    startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bannerAdminId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE promotion_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE NOT NULL,
    requestReason TEXT,
    reviewerAdminId INT,
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewedAt TIMESTAMP NULL,
    rejectedAt TIMESTAMP NULL,
    acceptedAt TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(reviewerAdminId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE card_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL -- ('Visa', 'Mastercard')
);

CREATE TABLE tiers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL, -- ('Free', 'Basic', 'Pro', 'Enterprise')
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    maxQRCodes INT DEFAULT 10,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cardTypeId INT NOT NULL,
    iban VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY(cardTypeId) REFERENCES card_types(id) ON DELETE CASCADE
);

CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    tierId INT NOT NULL,
    paymentMethodId INT ,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    canceledAt TIMESTAMP NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(tierId) REFERENCES tiers(id) ON DELETE CASCADE,
    FOREIGN KEY(paymentMethodId) REFERENCES payment_methods(id) ON DELETE CASCADE
);

CREATE TABLE qr_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    url TEXT NOT NULL,
    scans INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uniqueUserIdName UNIQUE (userId, name)
);

CREATE TABLE classic_qr_codes (
    qrCodeId INT PRIMARY KEY,
    targetUrl VARCHAR(255),
    FOREIGN KEY(qrCodeId) REFERENCES qr_codes(id) ON DELETE CASCADE
);

CREATE TABLE vcard_qr_codes (
    qrCodeId INT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    websiteUrl VARCHAR(255),
    address VARCHAR(255),
    FOREIGN KEY(qrCodeId) REFERENCES qr_codes(id) ON DELETE CASCADE
);

-- Non-banned verified users
CREATE VIEW active_users AS
SELECT u.*
FROM users AS u
LEFT JOIN banned_users bu ON u.id = bu.userId AND (bu.endsAt IS NULL OR bu.endsAt > CURRENT_TIMESTAMP)
WHERE bu.userId IS NULL
AND u.isEmailConfirmed = true;

-- Add default server variables
-- Tiers
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Free", 0, "Free plan which is automatically set for any person who registers.", 10);
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Basic", 4.99, "Basic plan for people who don't need many qr codes, but still get value from them.", 30);
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Pro", 9.99, "Pro plan for people who get quite a lot of value from them.", 50);
INSERT INTO tiers (name, price, description, maxQRCodes) VALUES ("Enterprise", 24.99, "Enterprise plan for organizations which use qr codes often.", 200);

-- Cardtypes
INSERT INTO card_types (name) VALUES ("Visa");
INSERT INTO card_types (name) VALUES ("Master Card");

-- 20 normal users
INSERT INTO users (role, email, username, password, isEmailConfirmed) VALUES 
('user', 'user1@example.com', 'user1', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user2@example.com', 'user2', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user3@example.com', 'user3', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user4@example.com', 'user4', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user5@example.com', 'user5', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user6@example.com', 'user6', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user7@example.com', 'user7', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user8@example.com', 'user8', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user9@example.com', 'user9', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('user', 'user10@example.com', 'user10', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true);

-- 20 admin users
INSERT INTO users (role, email, username, password, isEmailConfirmed) VALUES 
('admin', 'admin1@example.com', 'admin1', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin2@example.com', 'admin2', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin3@example.com', 'admin3', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin4@example.com', 'admin4', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin5@example.com', 'admin5', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin6@example.com', 'admin6', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin7@example.com', 'admin7', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin8@example.com', 'admin8', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin9@example.com', 'admin9', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true),
('admin', 'admin10@example.com', 'admin10', '$2y$10$mBAzIjSZ8qHLtnyqM0saweFkOe9ISpsVG5awpmqIBUfOXOgQ2MqHO', true);

-- 20 subscriptions for users (Free tier, no payment method)
INSERT INTO subscriptions (userId, tierId)
VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1);


-- 20 subscriptions for admins (Pro tier)
INSERT INTO subscriptions (userId, tierId)
VALUES
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1);











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
