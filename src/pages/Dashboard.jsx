import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaCalendarAlt, 
  FaUsers, 
  FaDownload,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import AttendanceChart from '../components/AttendanceChart';
import RecentActivity from '../components/RecentActivity';

function Dashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate data fetch
    const fetchData = async () => {
      try {
        // Replace with actual API call
        const mockData = [
          { id: 1, name: 'John Doe', status: 'present', date: '2023-05-15', course: 'Mathematics' },
          { id: 2, name: 'Jane Smith', status: 'absent', date: '2023-05-15', course: 'Science' },
          { id: 3, name: 'Alex Johnson', status: 'present', date: '2023-05-14', course: 'History' },
          { id: 4, name: 'Sarah Williams', status: 'late', date: '2023-05-14', course: 'Mathematics' },
          { id: 5, name: 'Michael Brown', status: 'present', date: '2023-05-13', course: 'Science' },
        ];
        setAttendanceData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const filteredData = attendanceData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    present: attendanceData.filter(item => item.status === 'present').length,
    absent: attendanceData.filter(item => item.status === 'absent').length,
    late: attendanceData.filter(item => item.status === 'late').length,
    total: attendanceData.length
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><FaChartBar className="header-icon" /> Attendance Dashboard</h1>
        <div className="controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="time-filter">
            <FaFilter className="filter-icon" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Records</h3>
          <p>{stats.total}</p>
          <FaUsers className="stat-icon" />
        </div>
        <div className="stat-card present">
          <h3>Present</h3>
          <p>{stats.present}</p>
          <span>{attendanceData.length > 0 ? Math.round((stats.present / attendanceData.length) * 100) : 0}%</span>
        </div>
        <div className="stat-card absent">
          <h3>Absent</h3>
          <p>{stats.absent}</p>
          <span>{attendanceData.length > 0 ? Math.round((stats.absent / attendanceData.length) * 100) : 0}%</span>
        </div>
        <div className="stat-card late">
          <h3>Late</h3>
          <p>{stats.late}</p>
          <span>{attendanceData.length > 0 ? Math.round((stats.late / attendanceData.length) * 100) : 0}%</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="chart-section">
          <div className="section-header">
            <h2><FaCalendarAlt className="section-icon" /> Attendance Overview</h2>
            <select>
              <option>By Day</option>
              <option>By Week</option>
              <option>By Month</option>
            </select>
          </div>
          <AttendanceChart data={attendanceData} />
        </div>

        <div className="recent-activity">
          <div className="section-header">
            <h2>Recent Attendance</h2>
            <button className="export-btn">
              <FaDownload /> Export
            </button>
          </div>
          <RecentActivity data={filteredData} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;