// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center mt-8">
      <h1 className="text-2xl mb-4">Attendance System</h1>
      <div className="flex gap-4 justify-center">
        <Link to="/register" className="btn btn-primary">Register</Link>
        <Link to="/login" className="btn btn-secondary">Login</Link>
      </div>
    </div>
  );
}

export default Home;