import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const Monitoring = () => {
  const { user } = useAuth();
  const [monitoringData, setMonitoringData] = useState([]);

  useEffect(() => {
    // Fetch monitoring data based on role
    setMonitoringData([
      { id: 1, description: 'Report 1', status: 'Reviewed' },
      { id: 2, description: 'Report 2', status: 'Pending' }
    ]);
  }, []);

  if (!user) return <div>Please login</div>;

  return (
    <div className="container mt-4">
      <h2>Monitoring</h2>
      <ul className="list-group">
        {monitoringData.map(item => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            {item.description}
            <span className={`badge ${item.status === 'Reviewed' ? 'bg-success' : 'bg-warning'}`}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Monitoring;
