// src/components/Navbar/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import './Navbar.css'; // Component-specific styles

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth(); // Get auth state and logout function
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Handle logout action
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-logo">
          💰 Finance Tracker
        </Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated ? (
          <>
            {/* Links for authenticated users */}
            <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
            <li><Link to="/transactions" className="nav-link">Transactions</Link></li>
            <li><Link to="/budgets" className="nav-link">Budgets</Link></li>
            <li><Link to="/categories" className="nav-link">Categories</Link></li>
            <li><Link to="/settings" className="nav-link">Settings</Link></li>
            <li className="user-info">Hello, {user?.username || user?.email}!</li>
            <li>
              <button onClick={handleLogout} className="nav-button logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            {/* Links for unauthenticated users */}
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/signup" className="nav-link">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
