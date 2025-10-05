import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import './ReportsList.css';

const ReportsList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports');
        setReports(response.data);
        setFilteredReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = reports.filter(report =>
        report.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.lecturer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.topic_taught.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.class_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [searchQuery, reports]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await axios.get(`http://localhost:5000/api/reports/search/${searchQuery}`);
        setFilteredReports(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  return (
    <div className="reports-list">
      <h2>Lecture Reports</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by course, lecturer, topic, or class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="reports-grid">
        {filteredReports.map(report => (
          <div key={report.id} className="report-card">
            <h3>{report.course_name} ({report.course_code})</h3>
            <p><strong>Lecturer:</strong> {report.lecturer_name}</p>
            <p><strong>Class:</strong> {report.class_name}</p>
            <p><strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}</p>
            <p><strong>Topic:</strong> {report.topic_taught}</p>
            <p><strong>Students Present:</strong> {report.actual_students_present} / {report.total_registered_students}</p>
            <p><strong>Venue:</strong> {report.venue}</p>
            <p><strong>Learning Outcomes:</strong> {report.learning_outcomes}</p>
            {report.lecturer_recommendations && (
              <p><strong>Recommendations:</strong> {report.lecturer_recommendations}</p>
            )}
            {report.prl_feedback && (
              <p><strong>PRL Feedback:</strong> {report.prl_feedback}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsList;
