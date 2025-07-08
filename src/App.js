// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css'; // General App layout styles

// Context Providers - These use NAMED exports, so they are imported with {}
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';
import { CategoryProvider } from './context/CategoryContext';

// Page Components - These use DEFAULT exports, so they are imported WITHOUT {}
import LoginPage from './pages/LoginPage/LoginPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import TransactionsPage from './pages/TransactionsPage/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage/BudgetsPage';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

// Other Components - These use DEFAULT exports, so they are imported WITHOUT {}
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    // Wrap the entire application with AuthProvider to make auth context available everywhere
    <AuthProvider>
      {/* Wrap with other providers to make their contexts available */}
      <TransactionProvider>
        <BudgetProvider>
          <CategoryProvider>
            <div className="app-container">
              {/* Navbar is always visible */}
              <Navbar />

              {/* Main content area where routes are rendered */}
              <main className="app-main">
                <Routes>
                  {/* Public Routes (accessible without login) */}
                  <Route path="/" element={<LoginPage />} /> {/* Default route */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />

                  {/* Protected Routes (require login) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <TransactionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/budgets"
                    element={
                      <ProtectedRoute>
                        <BudgetsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <CategoriesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all route for 404 Not Found */}
                  <Route path="*" element={<div className="not-found"><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p></div>} />
                </Routes>
              </main>
            </div>
          </CategoryProvider>
        </BudgetProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
