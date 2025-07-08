// src/pages/SettingsPage/SettingsPage.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';

function SettingsPage() {
  const { user, logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    logout(); // Calls the logout function from AuthContext
    setShowConfirmLogout(false);
    // Redirection is handled by AuthContext and ProtectedRoute
  };

  return (
    <div className="page-container settings-page">
      <h1>Settings</h1>
      <p className="settings-intro">Manage your account and application preferences.</p>

      <div className="settings-section card">
        <h2>Account Information</h2>
        <div className="user-details">
          <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          {/* In a real app, you might have options to change password, email, etc. */}
          {/* For frontend-only, we'll keep it simple */}
        </div>
        {/* <button className="settings-button primary-button">Edit Profile</button> */}
      </div>

      <div className="settings-section card">
        <h2>Data Management</h2>
        <p>Options to manage your local data (transactions, budgets, categories).</p>
        <div className="data-management-options">
          {/* <button className="settings-button secondary-button">Export Data</button> */}
          {/* <button className="settings-button danger-button">Clear All Data</button> */}
          <p className="data-management-hint">
            (Note: Clearing data will remove all transactions, budgets, and custom categories stored locally for this user.)
          </p>
        </div>
      </div>

      <div className="settings-section card logout-section">
        <h2>Logout</h2>
        <p>Securely log out of your finance tracker.</p>
        <button onClick={handleLogoutClick} className="settings-button logout-button">
          Logout
        </button>

        {showConfirmLogout && (
          <div className="confirm-modal">
            <div className="modal-content">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to log out?</p>
              <div className="modal-actions">
                <button onClick={confirmLogout} className="action-button logout-button">
                  Yes, Logout
                </button>
                <button onClick={() => setShowConfirmLogout(false)} className="action-button secondary-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
