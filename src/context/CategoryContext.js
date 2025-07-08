// src/context/CategoryContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // To link categories to the logged-in user

const CategoryContext = createContext(null);

export const useCategories = () => {
  return useContext(CategoryContext);
};

export const CategoryProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  // Initial default categories
  const defaultCategories = [
    { id: 'food', name: 'Food', type: 'expense' },
    { id: 'transport', name: 'Transport', type: 'expense' },
    { id: 'housing', name: 'Housing', type: 'expense' },
    { id: 'salary', name: 'Salary', type: 'income' },
    { id: 'freelance', name: 'Freelance', type: 'income' },
    { id: 'utilities', name: 'Utilities', type: 'expense' },
    { id: 'entertainment', name: 'Entertainment', type: 'expense' },
    { id: 'health', name: 'Health', type: 'expense' },
    { id: 'education', name: 'Education', type: 'expense' },
    { id: 'investments', name: 'Investments', type: 'income' },
    { id: 'gifts', name: 'Gifts', type: 'income' },
  ];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load categories from localStorage or use defaults
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user?.email) {
      const storedCategories = localStorage.getItem(`categories_${user.email}`);
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          // Merge stored categories with defaults, prioritizing stored if IDs conflict
          const mergedCategories = [...defaultCategories, ...parsedCategories.filter(
            pc => !defaultCategories.some(dc => dc.id === pc.id)
          )];
          setCategories(mergedCategories);
        } catch (e) {
          console.error("Failed to parse categories from localStorage:", e);
          setCategories(defaultCategories); // Fallback to defaults
        }
      } else {
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories); // Show defaults even if not authenticated for consistency
    }
    setLoading(false);
  }, [isAuthenticated, user, authLoading]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user?.email && !loading) {
      // Only store user-added categories, not the defaults
      const userDefinedCategories = categories.filter(
        cat => !defaultCategories.some(defCat => defCat.id === cat.id)
      );
      localStorage.setItem(`categories_${user.email}`, JSON.stringify(userDefinedCategories));
    }
  }, [categories, isAuthenticated, user, loading, defaultCategories]);

  // Add a new category
  const addCategory = useCallback((category) => {
    const newCategory = {
      id: category.name.toLowerCase().replace(/\s/g, '-'), // Simple ID from name
      ...category,
    };
    setCategories(prev => {
      // Prevent duplicate names
      if (prev.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
        return prev;
      }
      return [...prev, newCategory];
    });
  }, []);

  // Update an existing category
  const updateCategory = useCallback((updatedCategory) => {
    setCategories(prev =>
      prev.map(c => (c.id === updatedCategory.id ? updatedCategory : c))
    );
  }, []);

  // Delete a category
  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const value = {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
