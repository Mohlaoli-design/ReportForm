import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Lectures = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLectures, setFilteredLectures] = useState([]);

  useEffect(() => {
    // Fetch lectures
    const mockLectures = [
      { id: 1, name: 'Introduction to IT', lecturer: 'John Doe', course: 'DIT' },
      { id: 2, name: 'Business Systems', lecturer: 'Jane Smith', course: 'DBIT' },
      { id: 3, name: 'Advanced Programming', lecturer: 'Alice Johnson', course: 'BBIT' }
    ];
    setLectures(mockLectures);
    setFilteredLectures(mockLectures);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = lectures.filter(lecture =>
        lecture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecture.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lecture.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLectures(filtered);
    } else {
      setFilteredLectures(lectures);
    }
  }, [searchQuery, lectures]);

  if (!user || user.role !== 'program_leader') {
    return <div>Access denied</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Lectures</h2>
      <div className="search-bar mb-3">
        <input
          type="text"
          placeholder="Search by lecture name, lecturer, or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="row">
        {filteredLectures.map(lecture => (
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
