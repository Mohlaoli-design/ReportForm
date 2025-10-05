-- database_setup.sql
CREATE DATABASE IF NOT EXISTS luct_reporting_system;
USE luct_reporting_system;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer', 'principal_lecturer', 'program_leader') NOT NULL,
    faculty VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    faculty VARCHAR(100) NOT NULL,
    lecturer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Reports table
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    week_of_reporting VARCHAR(50) NOT NULL,
    date_of_lecture DATE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    lecturer_name VARCHAR(100) NOT NULL,
    actual_students_present INT NOT NULL,
    total_registered_students INT NOT NULL,
    venue VARCHAR(100) NOT NULL,
    scheduled_lecture_time TIME NOT NULL,
    topic_taught TEXT NOT NULL,
    learning_outcomes TEXT NOT NULL,
    lecturer_recommendations TEXT,
    prl_feedback TEXT,
    feedback_date TIMESTAMP NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (report_id, user_id)
);

-- Insert sample data
INSERT INTO users (username, email, password, role, faculty) VALUES
('admin_pl', 'pl@luct.ac.ls', '$2a$10$hashedpassword', 'program_leader', 'ICT'),
('john_lecturer', 'john@luct.ac.ls', '$2a$10$hashedpassword', 'lecturer', 'ICT'),
('mary_prl', 'mary@luct.ac.ls', '$2a$10$hashedpassword', 'principal_lecturer', 'ICT'),
('student1', 'student1@luct.ac.ls', '$2a$10$hashedpassword', 'student', 'ICT');

INSERT INTO courses (course_name, course_code, faculty, lecturer_id) VALUES
('Web Application Development', 'DIWA2110', 'ICT', 2),
('Database Management', 'DBMS2101', 'ICT', 2),
('Business Information Systems', 'BIS2101', 'ICT', 2);