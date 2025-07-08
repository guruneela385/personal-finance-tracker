// src/components/ProtectedRoute/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import our AuthContext hook

// A component that wraps routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Get authentication status and loading state

  // If still loading auth state, render nothing or a loading spinner
  if (loading) {
    return <div>Loading authentication...</div>; // Or a more sophisticated loading component
  }

  // If authenticated, render the children components (the protected page)
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, redirect to the login page
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
