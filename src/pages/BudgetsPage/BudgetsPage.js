// src/pages/BudgetsPage/BudgetsPage.js
import React, { useState, useEffect } from 'react';
import { useBudgets } from '../../context/BudgetContext';
import { useCategories } from '../../context/CategoryContext';
import { useTransactions } from '../../context/TransactionContext'; // To calculate spent amount
import './BudgetsPage.css';

// Component for adding/editing a budget
const BudgetForm = ({ budgetToEdit, onSave, onCancel }) => {
  const { categories } = useCategories();
  const [category, setCategory] = useState(budgetToEdit?.category || '');
  const [limit, setLimit] = useState(budgetToEdit?.limit || '');
  const [error, setError] = useState('');

  // Filter for expense categories only, as budgets are typically for expenses
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  // Set default category for new budget if none is selected
  useEffect(() => {
    if (!budgetToEdit && expenseCategories.length > 0 && !category) {
      setCategory(expenseCategories[0].name);
    }
  }, [budgetToEdit, expenseCategories, category]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!category || !limit) {
      setError('Please select a category and enter a limit.');
      return;
    }
    if (isNaN(parseFloat(limit)) || parseFloat(limit) <= 0) {
      setError('Limit must be a positive number.');
      return;
    }

    const newBudget = {
      id: budgetToEdit?.id || Date.now(),
      category,
      limit: parseFloat(limit),
    };

    onSave(newBudget);
    if (!budgetToEdit) {
      setLimit('');
      // Keep category selected for quick successive additions
    }
  };

  return (
    <form onSubmit={handleSubmit} className="budget-form card">
      <h3>{budgetToEdit ? 'Edit Budget' : 'Set New Budget'}</h3>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={!!budgetToEdit} // Disable category selection when editing existing budget
          aria-label="Budget Category"
        >
          {expenseCategories.length > 0 ? (
            expenseCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))
          ) : (
            <option value="">No expense categories available. Add some in Categories!</option>
          )}
        </select>
        {budgetToEdit && <p className="form-hint">Category cannot be changed for existing budgets.</p>}
      </div>

      <div className="form-group">
        <label htmlFor="limit">Budget Limit ($):</label>
        <input
          type="number"
          id="limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          min="0.01"
          step="0.01"
          required
          aria-label="Budget Limit"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {budgetToEdit ? 'Update Budget' : 'Set Budget'}
        </button>
        {budgetToEdit && (
          <button type="button" onClick={onCancel} className="secondary-button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Main BudgetsPage component
function BudgetsPage() {
  const { budgets, addBudget, updateBudget, deleteBudget, loading: budgetsLoading } = useBudgets();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [budgetToEdit, setBudgetToEdit] = useState(null);

  const handleSaveBudget = (budget) => {
    if (budgetToEdit) {
      updateBudget(budget);
      setBudgetToEdit(null); // Exit edit mode
    } else {
      addBudget(budget);
    }
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  const handleEditBudget = (budget) => {
    setBudgetToEdit(budget);
  };

  // FIX: Define handleCancelEdit function here
  const handleCancelEdit = () => {
    setBudgetToEdit(null);
  };

  // Calculate spent amount for each budget
  const calculateBudgetProgress = (budget) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const remaining = Math.max(0, budget.limit - spent);
    const percentage = (spent / budget.limit) * 100;
    return { spent, remaining, percentage };
  };

  if (budgetsLoading || transactionsLoading) {
    return (
      <div className="page-container budgets-page">
        <div className="loading-spinner"></div>
        <p>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="page-container budgets-page">
      <h1>Your Budgets</h1>

      <BudgetForm
        budgetToEdit={budgetToEdit}
        onSave={handleSaveBudget}
        onCancel={handleCancelEdit} // Now correctly referenced
      />

      <div className="budgets-overview-section card">
        <h2>Current Budgets</h2>
        {budgets.length > 0 ? (
          <div className="budgets-grid">
            {budgets.map(budget => {
              const { spent, remaining, percentage } = calculateBudgetProgress(budget);
              const isOverBudget = percentage > 100;

              return (
                <div key={budget.id} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                  <h3>{budget.category}</h3>
                  <p>Limit: <span className="budget-value">${budget.limit.toFixed(2)}</span></p>
                  <p>Spent: <span className={`budget-value ${isOverBudget ? 'text-danger' : 'text-success'}`}>${spent.toFixed(2)}</span></p>
                  <p>Remaining: <span className="budget-value">${remaining.toFixed(2)}</span></p>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, percentage).toFixed(0)}%`,
                        backgroundColor: isOverBudget ? 'var(--danger-color)' : 'var(--success-color)',
                      }}
                    ></div>
                  </div>
                  <span className={`progress-text ${isOverBudget ? 'text-danger' : ''}`}>
                    {percentage.toFixed(0)}% spent
                    {isOverBudget && ' (Over Budget!)'}
                  </span>
                  <div className="budget-actions">
                    <button onClick={() => handleEditBudget(budget)} className="action-button edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteBudget(budget.id)} className="action-button delete-button">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-budgets">No budgets set yet. Use the form above to set your first budget!</p>
        )}
      </div>
    </div>
  );
}

export default BudgetsPage;
