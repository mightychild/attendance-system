// src/components/Auth/StudentRegister.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function StudentRegister() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    studentId: '',
    department: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/qrcode', { state: { qrCode: res.data.qrCode } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Student Registration</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input 
            type="text" 
            required
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input 
            type="text" 
            required
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>Student ID</label>
          <input 
            type="text" 
            required
            value={formData.studentId}
            onChange={(e) => setFormData({...formData, studentId: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input 
            type="text" 
            required
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
          />
        </div>

        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login" className="text-primary">Login</Link>
      </p>
    </div>
  );
}

export default StudentRegister;