import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Lectures = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    // Fetch lectures
    setLectures([
      { id: 1, name: 'Introduction to IT', lecturer: 'John Doe', course: 'DIT' },
      { id: 2, name: 'Business Systems', lecturer: 'Jane Smith', course: 'DBIT' }
    ]);
  }, []);

  if (!user || user.role !== 'program_leader') {
    return <div>Access denied</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Lectures</h2>
      <div className="row">
        {lectures.map(lecture => (
          <div key={lecture.id} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{lecture.name}</h5>
                <p className="card-text">Lecturer: {lecture.lecturer}</p>
                <p className="card-text">Course: {lecture.course}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lectures;
