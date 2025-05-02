import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentRegister from './components/Auth/StudentRegister';
import Scanner from './components/Scanner';
import QRCodePage from './components/QRCodePage';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/qrcode" element={<QRCodePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;