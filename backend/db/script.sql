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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE qrcodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    url TEXT NOT NULL,
    scans INT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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

CREATE TABLE qrcodepermissions (
    qrCodeId INT,
    userId INT,
    PRIMARY KEY (qrCodeId, userId), -- Composite primary key
    canEdit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (qrCodeId) REFERENCES qrcodes(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- FUNCTIONS AND PROCEDURES
-- Clean up unconfirmed users procedure
DELIMITER //
CREATE PROCEDURE DeleteUnconfirmedUsers()
BEGIN
    DELETE FROM users
    WHERE isEmailConfirmed = FALSE
    AND created_at < NOW() - INTERVAL 10 MINUTE;
END //
DELIMITER ;

-- Scheduler to clean up unconfirmed users
CREATE EVENT IF NOT EXISTS DeleteUnconfirmedUsersEvent
ON SCHEDULE EVERY 1 MINUTE
DO
    CALL DeleteUnconfirmedUsers();

-- Activate the event scheduler
SET GLOBAL event_scheduler = ON;