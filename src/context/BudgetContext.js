// src/context/BudgetContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // To link budgets to the logged-in user

const BudgetContext = createContext(null);

export const useBudgets = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load budgets from localStorage when user changes or on initial load
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user?.email) {
      const storedBudgets = localStorage.getItem(`budgets_${user.email}`);
      if (storedBudgets) {
        try {
          setBudgets(JSON.parse(storedBudgets));
        } catch (e) {
          console.error("Failed to parse budgets from localStorage:", e);
          setBudgets([]);
        }
      } else {
        setBudgets([]);
      }
    } else {
      setBudgets([]); // Clear budgets if not authenticated
    }
    setLoading(false);
  }, [isAuthenticated, user, authLoading]);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user?.email && !loading) {
      localStorage.setItem(`budgets_${user.email}`, JSON.stringify(budgets));
    }
  }, [budgets, isAuthenticated, user, loading]);

  // Add a new budget
  const addBudget = useCallback((budget) => {
    const newBudget = {
      id: Date.now(), // Simple unique ID
      ...budget,
    };
    setBudgets(prev => [...prev, newBudget]);
  }, []);

  // Update an existing budget
  const updateBudget = useCallback((updatedBudget) => {
    setBudgets(prev =>
      prev.map(b => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  }, []);

  // Delete a budget
  const deleteBudget = useCallback((id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const value = {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
