import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './ReportForm.css';

const ReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    facultyName: user.faculty || '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: '',
    courseName: '',
    courseCode: '',
    lecturerName: user.username || '',
    actualStudentsPresent: '',
    totalRegisteredStudents: localStorage.getItem('totalRegisteredStudents') || '',
    venue: '',
    scheduledLectureTime: '',
    topicTaught: '',
    learningOutcomes: '',
    lecturerRecommendations: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const courseOptions = [
    { name: 'Diploma in Information Technology', code: 'DIT' },
    { name: 'Diploma in Business Information Technology', code: 'DBIT' },
    { name: 'Bsc Degree in Business Information Technology', code: 'BBIT' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'totalRegisteredStudents') {
      localStorage.setItem('totalRegisteredStudents', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (parseInt(formData.actualStudentsPresent) > parseInt(formData.totalRegisteredStudents)) {
      setError('Actual students present cannot exceed total registered students');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/reports', formData);
      setSuccess('Report submitted successfully!');
      // Reset form except totalRegisteredStudents
      setFormData({
        ...formData,
        className: '',
        weekOfReporting: '',
        dateOfLecture: '',
        courseName: '',
        courseCode: '',
        actualStudentsPresent: '',
        venue: '',
        scheduledLectureTime: '',
        topicTaught: '',
        learningOutcomes: '',
        lecturerRecommendations: ''
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit report');
    }
  };

  if (user.role !== 'lecturer' && user.role !== 'student') {
    return <div className="access-denied">Access denied. Only lecturers and students can submit reports.</div>;
  }

  return (
    <div className="report-form-container">
      <h2>Lecturer Reporting Form</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="facultyName">Faculty Name:</label>
            <input
              type="text"
              id="facultyName"
              name="facultyName"
              value={formData.facultyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="className">Class Name:</label>
            <input
              type="text"
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weekOfReporting">Week of Reporting:</label>
            <input
              type="text"
              id="weekOfReporting"
              name="weekOfReporting"
              value={formData.weekOfReporting}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfLecture">Date of Lecture:</label>
            <input
              type="date"
              id="dateOfLecture"
              name="dateOfLecture"
              value={formData.dateOfLecture}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="courseName">Course Name:</label>
            <select
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              {courseOptions.map(course => (
                <option key={course.code} value={course.name}>{course.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="courseCode">Course Code:</label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lecturerName">Lecturer's Name:</label>
            <input
              type="text"
              id="lecturerName"
              name="lecturerName"
              value={formData.lecturerName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="actualStudentsPresent">Actual Number of Students Present:</label>
            <input
              type="number"
              id="actualStudentsPresent"
              name="actualStudentsPresent"
              value={formData.actualStudentsPresent}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="totalRegisteredStudents">Total Number of Registered Students:</label>
            <input
              type="number"
              id="totalRegisteredStudents"
              name="totalRegisteredStudents"
              value={formData.totalRegisteredStudents}
              onChange={handleChange}
              min="0"
              required
            />
            <small>This value is saved for future reports.</small>
          </div>
          <div className="form-group">
            <label htmlFor="venue">Venue of the Class:</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduledLectureTime">Scheduled Lecture Time:</label>
            <input
              type="time"
              id="scheduledLectureTime"
              name="scheduledLectureTime"
              value={formData.scheduledLectureTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="topicTaught">Topic Taught:</label>
          <textarea
            id="topicTaught"
            name="topicTaught"
            value={formData.topicTaught}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="learningOutcomes">Learning Outcomes of the Topic:</label>
          <textarea
            id="learningOutcomes"
            name="learningOutcomes"
            value={formData.learningOutcomes}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lecturerRecommendations">Lecturer's Recommendations:</label>
          <textarea
            id="lecturerRecommendations"
            name="lecturerRecommendations"
            value={formData.lecturerRecommendations}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="submit-btn">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;
