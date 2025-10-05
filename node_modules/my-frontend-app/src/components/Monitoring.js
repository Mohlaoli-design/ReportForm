import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Monitoring = () => {
  const { user } = useAuth();
  const [monitoringData, setMonitoringData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Fetch monitoring data based on role
    const mockData = [
      { id: 1, description: 'Report 1', status: 'Reviewed' },
      { id: 2, description: 'Report 2', status: 'Pending' },
      { id: 3, description: 'Report 3', status: 'Approved' }
    ];
    setMonitoringData(mockData);
    setFilteredData(mockData);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = monitoringData.filter(item =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(monitoringData);
    }
  }, [searchQuery, monitoringData]);

  if (!user) return <div>Please login</div>;

  return (
    <div className="container mt-4">
      <h2>Monitoring</h2>
      <div className="search-bar mb-3">
        <input
          type="text"
          placeholder="Search by description or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>
      <ul className="list-group">
        {filteredData.map(item => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            {item.description}
            <span className={`badge ${item.status === 'Reviewed' ? 'bg-success' : item.status === 'Approved' ? 'bg-primary' : 'bg-warning'}`}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Monitoring;
