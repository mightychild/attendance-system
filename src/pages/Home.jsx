import React from 'react';
import { Link } from 'react-router-dom';
import { FaQrcode, FaChartLine, FaUserPlus } from 'react-icons/fa';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Attendance System</h1>
          <p className="hero-subtitle">
            Streamline your attendance tracking with our QR-based solution
          </p>
          <div className="hero-buttons">
            <Link to="/scanner" className="btn btn-primary btn-lg">
              <FaQrcode className="icon" /> Scan QR Code
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              <FaUserPlus className="icon" /> Register Now
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/attendance-hero.svg" alt="Attendance System Illustration" />
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaQrcode />
            </div>
            <h3>Quick Scanning</h3>
            <p>Mark attendance in seconds with our fast QR scanning technology</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Real-time Reports</h3>
            <p>Generate attendance reports instantly for any time period</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUserPlus />
            </div>
            <h3>Easy Registration</h3>
            <p>Students can register themselves or be added by administrators</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;