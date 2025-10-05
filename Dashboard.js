import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalReports: 0, totalCourses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case 'student':
        return (
          <div className="role-content">
            <h3>Student Dashboard</h3>
            <p>Monitor your course reports and provide ratings.</p>
            <div className="stats">
              <div className="stat-card">
                <h4>Total Reports</h4>
                <p>{stats.totalReports}</p>
              </div>
            </div>
          </div>
        );
      case 'lecturer':
        return (
          <div className="role-content">
            <h3>Lecturer Dashboard</h3>
            <p>Submit lecture reports and view your submissions.</p>
            <div className="stats">
              <div className="stat-card">
                <h4>Your Reports</h4>
                <p>{stats.totalReports}</p>
              </div>
            </div>
          </div>
        );
      case 'principal_lecturer':
        return (
          <div className="role-content">
            <h3>Principal Lecturer Dashboard</h3>
            <p>Review reports from your faculty and provide feedback.</p>
            <div className="stats">
              <div className="stat-card">
                <h4>Reports in Faculty</h4>
                <p>{stats.totalReports}</p>
              </div>
            </div>
          </div>
        );
      case 'program_leader':
        return (
          <div className="role-content">
            <h3>Program Leader Dashboard</h3>
            <p>Manage courses, assign lecturers, and oversee reports.</p>
            <div className="stats">
              <div className="stat-card">
                <h4>Total Reports</h4>
                <p>{stats.totalReports}</p>
              </div>
              <div className="stat-card">
                <h4>Total Courses</h4>
                <p>{stats.totalCourses}</p>
              </div>
            </div>
          </div>
        );
      default:
        return <p>Unknown role</p>;
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {renderRoleSpecificContent()}
    </div>
  );
};

export default Dashboard;
