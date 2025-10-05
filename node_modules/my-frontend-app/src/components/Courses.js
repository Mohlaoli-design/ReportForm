import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        // Fallback to mock data if API fails
        const mockCourses = [
          { id: 1, course_name: 'Diploma in Information Technology', course_code: 'DIT' },
          { id: 2, course_name: 'Diploma in Business Information Technology', course_code: 'DBIT' },
          { id: 3, course_name: 'Bsc Degree in Business Information Technology', course_code: 'BBIT' }
        ];
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
      }
    };
    if (user && user.role === 'program_leader') {
      fetchCourses();
    } else {
      // For other roles, show mock or empty
      const mockCourses = [
        { id: 1, course_name: 'Diploma in Information Technology', course_code: 'DIT' },
        { id: 2, course_name: 'Diploma in Business Information Technology', course_code: 'DBIT' },
        { id: 3, course_name: 'Bsc Degree in Business Information Technology', course_code: 'BBIT' }
      ];
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = courses.filter(course =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  if (!user) return <div>Please login</div>;

  return (
    <div className="container mt-4">
      <h2>Courses</h2>
      <div className="search-bar mb-3">
        <input
          type="text"
          placeholder="Search by course name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>
      {user.role === 'program_leader' && <button className="btn btn-primary mb-3">Add Course</button>}
      <div className="row">
        {filteredCourses.map(course => (
          <div key={course.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{course.course_name}</h5>
                <p className="card-text">Code: {course.course_code}</p>
                {course.lecturer_name && <p className="card-text">Lecturer: {course.lecturer_name}</p>}
                {user.role === 'program_leader' && <button className="btn btn-secondary">Assign Lecturer</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
