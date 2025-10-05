import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { useAuth } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import Navbar from './components/Navbar';
import RegisterForm from './components/RegisterForm';
import ReportForm from './components/ReportForm';
import ReportsList from './components/ReportsList';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <RegisterForm /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/report" element={user ? <ReportForm /> : <Navigate to="/login" />} />
            <Route path="/reports" element={user ? <ReportsList /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
