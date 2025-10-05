import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch courses based on role
    // For now, mock data
    setCourses([
      { id: 1, name: 'Diploma in Information Technology', code: 'DIT' },
      { id: 2, name: 'Diploma in Business Information Technology', code: 'DBIT' },
      { id: 3, name: 'Bsc Degree in Business Information Technology', code: 'BBIT' }
    ]);
  }, []);

  if (!user) return <div>Please login</div>;

  return (
    <div className="container mt-4">
      <h2>Courses</h2>
      {user.role === 'program_leader' && <button className="btn btn-primary mb-3">Add Course</button>}
      <div className="row">
        {courses.map(course => (
          <div key={course.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{course.name}</h5>
                <p className="card-text">Code: {course.code}</p>
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
