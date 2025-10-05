import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // Fetch classes based on role
    setClasses([
      { id: 1, name: 'DIT Semester 1', lecturer: 'John Doe' },
      { id: 2, name: 'DBIT Semester 2', lecturer: 'Jane Smith' }
    ]);
  }, []);

  if (!user || !['lecturer', 'principal_lecturer', 'program_leader'].includes(user.role)) {
    return <div>Access denied</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Classes</h2>
      <div className="row">
        {classes.map(cls => (
          <div key={cls.id} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{cls.name}</h5>
                <p className="card-text">Lecturer: {cls.lecturer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;
