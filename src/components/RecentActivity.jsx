import React from 'react';

function RecentActivity({ data, loading }) {
  if (loading) {
    return <div className="loading">Loading attendance data...</div>;
  }

  return (
    <div className="activity-table">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Date</th>
            <th>Course</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{item.course}</td>
              <td>
                <span className={`status-badge ${item.status}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="no-data">No attendance records found</div>
      )}
    </div>
  );
}

export default RecentActivity;