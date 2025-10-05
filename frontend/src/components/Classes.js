import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);

  useEffect(() => {
    // Fetch classes based on role
    const mockClasses = [
      { id: 1, name: 'DIT Semester 1', lecturer: 'John Doe' },
      { id: 2, name: 'DBIT Semester 2', lecturer: 'Jane Smith' },
      { id: 3, name: 'BBIT Semester 3', lecturer: 'Alice Johnson' }
    ];
    setClasses(mockClasses);
    setFilteredClasses(mockClasses);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.lecturer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classes);
    }
  }, [searchQuery, classes]);

  if (!user || !['lecturer', 'principal_lecturer', 'program_leader'].includes(user.role)) {
    return <div>Access denied</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Classes</h2>
      <div className="search-bar mb-3">
        <input
          type="text"
          placeholder="Search by class name or lecturer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="row">
        {filteredClasses.map(cls => (
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
