// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create a context for authentication
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to wrap the application
export const AuthProvider = ({ children }) => {
  // State to hold the current user (null if not logged in)
  const [user, setUser] = useState(null);
  // State to track if authentication is ready (e.g., after checking localStorage)
  const [loading, setLoading] = useState(true);

  // Function to simulate user login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    // In a real app, this would be an API call to your backend
    // For frontend-only, we simulate success/failure and store in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = storedUsers.find(u => u.email === email && u.password === password);

    if (foundUser) {
      // Simulate successful login
      const userData = { email: foundUser.email, username: foundUser.username };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData)); // Store current user
      setLoading(false);
      return { success: true, message: 'Login successful!' };
    } else {
      // Simulate failed login
      setLoading(false);
      return { success: false, message: 'Invalid credentials.' };
    }
  }, []);

  // Function to simulate user signup
  const signup = useCallback(async (username, email, password) => {
    setLoading(true);
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (storedUsers.some(u => u.email === email)) {
      setLoading(false);
      return { success: false, message: 'User with this email already exists.' };
    }

    // Simulate user creation
    const newUser = { username, email, password }; // Store password for simulation, in real app, it would be hashed
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Log in the new user automatically
    const userData = { email: newUser.email, username: newUser.username };
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setLoading(false);
    return { success: true, message: 'Account created and logged in successfully!' };
  }, []);

  // Function to simulate user logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser'); // Remove current user from localStorage
    localStorage.removeItem('transactions'); // Clear user-specific data on logout
    localStorage.removeItem('budgets');
    localStorage.removeItem('categories');
    // In a real app, you might also clear cookies or session storage
  }, []);

  // Effect to check for existing login on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('currentUser'); // Clear invalid data
      }
    }
    setLoading(false); // Authentication check is complete
  }, []);

  // Context value to be provided to children components
  const value = {
    user,
    isAuthenticated: !!user, // Convenience boolean
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when authentication check is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
