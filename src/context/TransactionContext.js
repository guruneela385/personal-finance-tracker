// src/context/TransactionContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // To link transactions to the logged-in user

const TransactionContext = createContext(null);

export const useTransactions = () => {
  return useContext(TransactionContext);
};

export const TransactionProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load transactions from localStorage when user changes or on initial load
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (isAuthenticated && user?.email) {
      const storedTransactions = localStorage.getItem(`transactions_${user.email}`);
      if (storedTransactions) {
        try {
          // Parse and ensure dates are Date objects for easier manipulation
          const parsedTransactions = JSON.parse(storedTransactions).map(t => ({
            ...t,
            date: new Date(t.date) // Convert date string back to Date object
          }));
          setTransactions(parsedTransactions);
        } catch (e) {
          console.error("Failed to parse transactions from localStorage:", e);
          setTransactions([]); // Reset if data is corrupt
        }
      } else {
        setTransactions([]);
      }
    } else {
      setTransactions([]); // Clear transactions if not authenticated
    }
    setLoading(false);
  }, [isAuthenticated, user, authLoading]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user?.email && !loading) {
      // Store dates as ISO strings to preserve them
      const serializableTransactions = transactions.map(t => ({
        ...t,
        date: t.date.toISOString() // Convert Date object to ISO string for storage
      }));
      localStorage.setItem(`transactions_${user.email}`, JSON.stringify(serializableTransactions));
    }
  }, [transactions, isAuthenticated, user, loading]);

  // Add a new transaction
  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      id: Date.now(), // Simple unique ID
      ...transaction,
      date: new Date(transaction.date) // Ensure it's a Date object
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  // Update an existing transaction
  const updateTransaction = useCallback((updatedTransaction) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === updatedTransaction.id ? { ...updatedTransaction, date: new Date(updatedTransaction.date) } : t
      )
    );
  }, []);

  // Delete a transaction
  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Calculate total income
  const getTotalIncome = useCallback(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [transactions]);

  // Calculate total expenses
  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [transactions]);

  // Calculate current balance
  const getCurrentBalance = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);


  const value = {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getCurrentBalance,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
