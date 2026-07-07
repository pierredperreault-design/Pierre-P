-- Church Attendance Management System
-- Database Schema

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    postalCode VARCHAR(10),
    joinDate DATE NOT NULL,
    status ENUM('active', 'inactive', 'deceased') DEFAULT 'active',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lastName (lastName),
    INDEX idx_status (status)
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roleName VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_roleName (roleName)
);

-- Member Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS member_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    memberId INT NOT NULL,
    roleId INT NOT NULL,
    assignedDate DATE NOT NULL DEFAULT CURDATE(),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member_role (memberId, roleId),
    INDEX idx_memberId (memberId),
    INDEX idx_roleId (roleId)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eventName VARCHAR(150) NOT NULL,
    eventType ENUM('service', 'meeting', 'prayer_group', 'class', 'special_event') NOT NULL,
    eventDate DATE NOT NULL,
    startTime TIME,
    endTime TIME,
    location VARCHAR(255),
    description TEXT,
    capacity INT,
    createdBy INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_eventDate (eventDate),
    INDEX idx_eventType (eventType)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    memberId INT NOT NULL,
    eventId INT NOT NULL,
    attendanceStatus ENUM('present', 'absent', 'late', 'excused', 'virtual') DEFAULT 'absent',
    checkinTime TIME,
    checkoutTime TIME,
    notes TEXT,
    recordedBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (memberId, eventId),
    INDEX idx_memberId (memberId),
    INDEX idx_eventId (eventId),
    INDEX idx_attendanceStatus (attendanceStatus),
    INDEX idx_createdAt (createdAt)
);

-- Families Table (Optional - for family grouping)
CREATE TABLE IF NOT EXISTS families (
    id INT PRIMARY KEY AUTO_INCREMENT,
    familyName VARCHAR(100) NOT NULL,
    headOfHousehold INT,
    address VARCHAR(255),
    phone VARCHAR(20),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (headOfHousehold) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_familyName (familyName)
);

-- Add family_id to members (optional)
ALTER TABLE members ADD COLUMN familyId INT AFTER joinDate;
ALTER TABLE members ADD FOREIGN KEY (familyId) REFERENCES families(id) ON DELETE SET NULL;

-- Statistics View
CREATE OR REPLACE VIEW attendance_statistics AS
SELECT 
    e.id as eventId,
    e.eventName,
    e.eventDate,
    COUNT(DISTINCT a.memberId) as totalAttendance,
    SUM(CASE WHEN a.attendanceStatus = 'present' THEN 1 ELSE 0 END) as presentCount,
    SUM(CASE WHEN a.attendanceStatus = 'absent' THEN 1 ELSE 0 END) as absentCount,
    SUM(CASE WHEN a.attendanceStatus = 'late' THEN 1 ELSE 0 END) as lateCount,
    SUM(CASE WHEN a.attendanceStatus = 'excused' THEN 1 ELSE 0 END) as excusedCount,
    SUM(CASE WHEN a.attendanceStatus = 'virtual' THEN 1 ELSE 0 END) as virtualCount
FROM events e
LEFT JOIN attendance a ON e.id = a.eventId
GROUP BY e.id, e.eventName, e.eventDate;

-- Member Attendance History View
CREATE OR REPLACE VIEW member_attendance_history AS
SELECT 
    m.id as memberId,
    CONCAT(m.firstName, ' ', m.lastName) as fullName,
    e.eventName,
    e.eventDate,
    a.attendanceStatus,
    a.checkinTime,
    a.checkoutTime
FROM members m
LEFT JOIN attendance a ON m.id = a.memberId
LEFT JOIN events e ON a.eventId = e.id
ORDER BY m.lastName, m.firstName, e.eventDate DESC;