// server.js - Main backend server file
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs'); // For Excel export
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'itmohlaoli',
    database: process.env.DB_NAME || 'luct_reporting_system',
    connectionLimit: 10
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'luct-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

// ========== AUTHENTICATION ROUTES ========== //

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, role, faculty } = req.body;

    try {
        // Check if user already exists
        const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
        db.execute(checkQuery, [email, username], async (err, results) => {
            if (err) {
                console.error('Database error during user existence check:', err);
                return res.status(500).json({ error: 'Database error during user existence check' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = 'INSERT INTO users (username, email, password, role, faculty) VALUES (?, ?, ?, ?, ?)';
            
            db.execute(insertQuery, [username, email, hashedPassword, role, faculty], (err, result) => {
                if (err) {
                    console.error('Database error during user insertion:', err);
                    return res.status(500).json({ error: 'User registration failed: ' + err.message });
                }
                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: result.insertId 
                });
            });
        });
    } catch (error) {
        console.error('Unexpected server error during registration:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.execute(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role, 
                faculty: user.faculty 
            },
            process.env.JWT_SECRET || 'luct-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                faculty: user.faculty
            }
        });
    });
});

// ========== LECTURER REPORT ROUTES ========== //

// Submit Lecturer Report
app.post('/api/reports', authenticateToken, authorizeRoles('lecturer', 'student'), (req, res) => {
    const {
        facultyName,
        className,
        weekOfReporting,
        dateOfLecture,
        courseName,
        courseCode,
        lecturerName,
        actualStudentsPresent,
        totalRegisteredStudents,
        venue,
        scheduledLectureTime,
        topicTaught,
        learningOutcomes,
        lecturerRecommendations
    } = req.body;

    // Basic validation
    if (!facultyName || !className || !weekOfReporting || !dateOfLecture || !courseName || !courseCode ||
        !lecturerName || actualStudentsPresent == null || totalRegisteredStudents == null || !venue ||
        !scheduledLectureTime || !topicTaught || !learningOutcomes) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (actualStudentsPresent < 0 || totalRegisteredStudents < 0) {
        return res.status(400).json({ error: 'Student counts cannot be negative' });
    }

    const query = `
        INSERT INTO reports (
            faculty_name, class_name, week_of_reporting, date_of_lecture, course_name,
            course_code, lecturer_name, actual_students_present, total_registered_students,
            venue, scheduled_lecture_time, topic_taught, learning_outcomes, lecturer_recommendations, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        facultyName,
        className,
        weekOfReporting,
        dateOfLecture,
        courseName,
        courseCode,
        lecturerName,
        actualStudentsPresent,
        totalRegisteredStudents,
        venue,
        scheduledLectureTime,
        topicTaught,
        learningOutcomes,
        lecturerRecommendations,
        req.user.id
    ];

    db.execute(query, values, (err, result) => {
        if (err) {
            console.error('Report submission error:', err);
            return res.status(500).json({ error: 'Failed to submit report' });
        }
        res.status(201).json({
            message: 'Report submitted successfully',
            reportId: result.insertId
        });
    });
});

// Get All Reports (with role-based filtering)
app.get('/api/reports', authenticateToken, (req, res) => {
    let query = `
        SELECT r.*, u.username, u.role 
        FROM reports r 
        JOIN users u ON r.user_id = u.id 
        WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'lecturer') {
        query += ' AND r.user_id = ?';
        params.push(req.user.id);
    } else if (req.user.role === 'principal_lecturer') {
        query += ' AND r.faculty_name = ?';
        params.push(req.user.faculty);
    } else if (req.user.role === 'student') {
        query += ' AND r.faculty_name = ?';
        params.push(req.user.faculty);
    }
    // Program Leader can see all reports

    query += ' ORDER BY r.created_at DESC';

    db.execute(query, params, (err, results) => {
        if (err) {
            console.error('Fetch reports error:', err);
            return res.status(500).json({ error: 'Failed to fetch reports' });
        }
        res.json(results);
    });
});

// Get Single Report
app.get('/api/reports/:id', authenticateToken, (req, res) => {
    const reportId = req.params.id;
    
    const query = `
        SELECT r.*, u.username, u.role 
        FROM reports r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.id = ?
    `;

    db.execute(query, [reportId], (err, results) => {
        if (err) {
            console.error('Fetch report error:', err);
            return res.status(500).json({ error: 'Failed to fetch report' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(results[0]);
    });
});

// ========== SEARCH FUNCTIONALITY ========== //

// Search Reports
app.get('/api/reports/search/:query', authenticateToken, (req, res) => {
    const searchQuery = req.params.query;
    
    let baseQuery = `
        SELECT r.*, u.username 
        FROM reports r 
        JOIN users u ON r.user_id = u.id 
        WHERE (r.course_name LIKE ? OR r.lecturer_name LIKE ? OR r.topic_taught LIKE ? OR r.class_name LIKE ?)
    `;
    const params = [
        `%${searchQuery}%`,
        `%${searchQuery}%`, 
        `%${searchQuery}%`,
        `%${searchQuery}%`
    ];

    // Role-based filtering for search
    if (req.user.role === 'lecturer') {
        baseQuery += ' AND r.user_id = ?';
        params.push(req.user.id);
    } else if (req.user.role === 'principal_lecturer') {
        baseQuery += ' AND r.faculty_name = ?';
        params.push(req.user.faculty);
    } else if (req.user.role === 'student') {
        baseQuery += ' AND r.faculty_name = ?';
        params.push(req.user.faculty);
    }

    baseQuery += ' ORDER BY r.date_of_lecture DESC';

    db.execute(baseQuery, params, (err, results) => {
        if (err) {
            console.error('Search error:', err);
            return res.status(500).json({ error: 'Search failed' });
        }
        res.json(results);
    });
});

// ========== PRINCIPAL LECTURER ROUTES ========== //

// Add Feedback to Report (Principal Lecturer only)
app.post('/api/reports/:id/feedback', authenticateToken, authorizeRoles('principal_lecturer'), (req, res) => {
    const { feedback } = req.body;
    const reportId = req.params.id;

    const query = 'UPDATE reports SET prl_feedback = ?, feedback_date = NOW() WHERE id = ?';
    db.execute(query, [feedback, reportId], (err, result) => {
        if (err) {
            console.error('Feedback error:', err);
            return res.status(500).json({ error: 'Failed to add feedback' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: 'Feedback added successfully' });
    });
});

// ========== PROGRAM LEADER ROUTES ========== //

// Get All Courses (Program Leader only)
app.get('/api/courses', authenticateToken, authorizeRoles('program_leader'), (req, res) => {
    const query = `
        SELECT c.*, u.username as lecturer_name 
        FROM courses c 
        LEFT JOIN users u ON c.lecturer_id = u.id 
        WHERE c.faculty = ?
    `;
    
    db.execute(query, [req.user.faculty], (err, results) => {
        if (err) {
            console.error('Fetch courses error:', err);
            return res.status(500).json({ error: 'Failed to fetch courses' });
        }
        res.json(results);
    });
});

// Add New Course (Program Leader only)
app.post('/api/courses', authenticateToken, authorizeRoles('program_leader'), (req, res) => {
    const { courseName, courseCode, lecturerId } = req.body;

    const query = 'INSERT INTO courses (course_name, course_code, faculty, lecturer_id) VALUES (?, ?, ?, ?)';
    db.execute(query, [courseName, courseCode, req.user.faculty, lecturerId], (err, result) => {
        if (err) {
            console.error('Add course error:', err);
            return res.status(500).json({ error: 'Failed to add course' });
        }
        res.status(201).json({ 
            message: 'Course added successfully',
            courseId: result.insertId 
        });
    });
});

// Assign Lecturer to Course (Program Leader only)
app.put('/api/courses/:id/assign', authenticateToken, authorizeRoles('program_leader'), (req, res) => {
    const courseId = req.params.id;
    const { lecturerId } = req.body;

    const query = 'UPDATE courses SET lecturer_id = ? WHERE id = ? AND faculty = ?';
    db.execute(query, [lecturerId, courseId, req.user.faculty], (err, result) => {
        if (err) {
            console.error('Assign lecturer error:', err);
            return res.status(500).json({ error: 'Failed to assign lecturer' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Lecturer assigned successfully' });
    });
});

// ========== RATING SYSTEM ========== //

// Submit Rating
app.post('/api/ratings', authenticateToken, (req, res) => {
    const { reportId, rating, comment } = req.body;

    const query = `
        INSERT INTO ratings (report_id, user_id, rating, comment) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ?, comment = ?
    `;

    db.execute(query, [reportId, req.user.id, rating, comment, rating, comment], (err, result) => {
        if (err) {
            console.error('Rating error:', err);
            return res.status(500).json({ error: 'Failed to submit rating' });
        }
        res.json({ message: 'Rating submitted successfully' });
    });
});

// Get Ratings for Report
app.get('/api/reports/:id/ratings', authenticateToken, (req, res) => {
    const reportId = req.params.id;

    const query = `
        SELECT r.rating, r.comment, r.created_at, u.username 
        FROM ratings r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.report_id = ?
    `;

    db.execute(query, [reportId], (err, results) => {
        if (err) {
            console.error('Fetch ratings error:', err);
            return res.status(500).json({ error: 'Failed to fetch ratings' });
        }
        res.json(results);
    });
});

// ========== EXCEL REPORT GENERATION ========== //

// Generate Excel Report (Extra Credit)
app.get('/api/reports/export/excel', authenticateToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM reports WHERE 1=1';
        const params = [];

        // Role-based filtering
        if (req.user.role === 'lecturer') {
            query += ' AND user_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'principal_lecturer') {
            query += ' AND faculty_name = ?';
            params.push(req.user.faculty);
        } else if (req.user.role === 'student') {
            query += ' AND faculty_name = ?';
            params.push(req.user.faculty);
        }

        query += ' ORDER BY date_of_lecture DESC';

        db.execute(query, params, async (err, results) => {
            if (err) {
                console.error('Export error:', err);
                return res.status(500).json({ error: 'Failed to generate report' });
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Lecture Reports');

            // Add headers
            worksheet.columns = [
                { header: 'Faculty', key: 'faculty_name', width: 20 },
                { header: 'Class', key: 'class_name', width: 15 },
                { header: 'Week', key: 'week_of_reporting', width: 15 },
                { header: 'Date', key: 'date_of_lecture', width: 15 },
                { header: 'Course', key: 'course_name', width: 25 },
                { header: 'Course Code', key: 'course_code', width: 15 },
                { header: 'Lecturer', key: 'lecturer_name', width: 20 },
                { header: 'Students Present', key: 'actual_students_present', width: 15 },
                { header: 'Total Students', key: 'total_registered_students', width: 15 },
                { header: 'Venue', key: 'venue', width: 15 },
                { header: 'Topic', key: 'topic_taught', width: 30 }
            ];

            // Add data
            results.forEach(report => {
                worksheet.addRow(report);
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=lecture-reports.xlsx');

            // Write to response
            await workbook.xlsx.write(res);
            res.end();
        });
    } catch (error) {
        console.error('Excel generation error:', error);
        res.status(500).json({ error: 'Failed to generate Excel report' });
    }
});

// ========== USER MANAGEMENT ========== //

// Get Users by Role (for Program Leader)
app.get('/api/users/:role', authenticateToken, authorizeRoles('program_leader'), (req, res) => {
    const role = req.params.role;

    const query = 'SELECT id, username, email, faculty FROM users WHERE role = ? AND faculty = ?';
    db.execute(query, [role, req.user.faculty], (err, results) => {
        if (err) {
            console.error('Fetch users error:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(results);
    });
});

// ========== DASHBOARD STATISTICS ========== //

// Get Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    let reportQuery = 'SELECT COUNT(*) as totalReports FROM reports';
    let courseQuery = 'SELECT COUNT(*) as totalCourses FROM courses WHERE faculty = ?';
    const params = [req.user.faculty];

    if (req.user.role === 'lecturer') {
        reportQuery += ' WHERE user_id = ?';
        params.unshift(req.user.id);
    } else if (req.user.role === 'principal_lecturer') {
        reportQuery += ' WHERE faculty_name = ?';
        params.unshift(req.user.faculty);
    }

    // Execute both queries
    db.execute(reportQuery, req.user.role !== 'program_leader' ? [params[0]] : [], (err, reportResults) => {
        if (err) {
            console.error('Stats error:', err);
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }

        db.execute(courseQuery, [req.user.faculty], (err, courseResults) => {
            if (err) {
                console.error('Stats error:', err);
                return res.status(500).json({ error: 'Failed to fetch statistics' });
            }

            res.json({
                totalReports: reportResults[0].totalReports,
                totalCourses: courseResults[0].totalCourses
            });
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'LUCT Reporting System Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`LUCT Reporting System Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});