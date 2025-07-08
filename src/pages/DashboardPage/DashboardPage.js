// src/pages/DashboardPage/DashboardPage.js
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
import { useBudgets } from '../../context/BudgetContext';
// import { useCategories } from '../../context/CategoryContext'; // Removed as it was not directly used here
import './DashboardPage.css';

// Charting Library Imports (install these: npm install recharts)
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function DashboardPage() {
  const { user } = useAuth();
  const { transactions, loading: transactionsLoading, getTotalIncome, getTotalExpenses, getCurrentBalance } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const navigate = useNavigate();

  // Redirect to transactions page to add a new one
  const handleAddTransactionClick = () => {
    navigate('/transactions');
  };

  // Calculate spent amount for each budget using useCallback for memoization
  const calculateBudgetProgress = useCallback((budget) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const remaining = Math.max(0, budget.limit - spent);
    const percentage = (spent / budget.limit) * 100;
    return { spent, remaining, percentage };
  }, [transactions]); // Recalculate if transactions change


  // Prepare data for Expense Breakdown Pie Chart
  const expenseCategories = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseCategories[t.category] = (expenseCategories[t.category] || 0) + parseFloat(t.amount);
  });
  const pieChartData = Object.keys(expenseCategories).map(category => ({
    name: category,
    value: expenseCategories[category],
  }));

  // Colors for the pie chart slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF194F', '#19FFD1', '#FFD119'];

  // Prepare data for Spending Trends Line Chart (monthly)
  const monthlyData = {};
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyData[monthYear].income += parseFloat(t.amount);
    } else {
      monthlyData[monthYear].expense += parseFloat(t.amount);
    }
  });

  // Sort months chronologically
  const sortedMonthlyData = Object.keys(monthlyData)
    .sort()
    .map(monthYear => ({
      month: monthYear,
      ...monthlyData[monthYear],
    }));

  // FIX: Calculate budgetProgressData BEFORE the loading check
  // Calculate budget progress
  const budgetProgressData = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return {
      ...budget,
      spent: spent,
      remaining: Math.max(0, budget.limit - spent),
      percentage: (spent / budget.limit) * 100,
    };
  });


  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="page-container dashboard-page">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      <h1>Welcome, {user?.username || user?.email}!</h1>
      <p className="dashboard-intro">Here's a quick overview of your finances.</p>

      <div className="dashboard-summary-cards">
        <div className="summary-card income-card">
          <h3>Total Income</h3>
          <p className="amount">${getTotalIncome().toFixed(2)}</p>
        </div>
        <div className="summary-card expense-card">
          <h3>Total Expenses</h3>
          <p className="amount">${getTotalExpenses().toFixed(2)}</p>
        </div>
        <div className="summary-card balance-card">
          <h3>Current Balance</h3>
          <p className="amount">${getCurrentBalance().toFixed(2)}</p>
        </div>
      </div>

      <div className="dashboard-charts-section">
        <h2>Financial Overview</h2>

        {pieChartData.length > 0 ? (
          <div className="chart-wrapper">
            <h3>Expense Breakdown by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-placeholder">
            <p>No expense data to display for the pie chart.</p>
          </div>
        )}

        {sortedMonthlyData.length > 0 ? (
          <div className="chart-wrapper">
            <h3>Monthly Spending Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={sortedMonthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS[7]} />
                <XAxis dataKey="month" stroke={COLORS[6]} />
                <YAxis stroke={COLORS[6]} />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill={COLORS[1]} name="Income" />
                <Bar dataKey="expense" fill={COLORS[0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-placeholder">
            <p>No transaction data to display for spending trends.</p>
          </div>
        )}
      </div>

      <div className="dashboard-budgets-section">
        <h2>Budget Progress</h2>
        {budgetProgressData.length > 0 ? (
          <div className="budgets-list">
            {budgetProgressData.map(budget => {
              const { spent, remaining, percentage } = calculateBudgetProgress(budget);
              const isOverBudget = percentage > 100;

              return (
                <div key={budget.id} className={`budget-progress-card ${isOverBudget ? 'over-budget' : ''}`}>
                  <h3>{budget.category} Budget</h3>
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chart-placeholder">
            <p>No budgets set yet. Go to the Budgets page to set some!</p>
          </div>
        )}
      </div>

      <div className="dashboard-cta">
        <p>Ready to add your first transaction?</p>
        <button onClick={handleAddTransactionClick} className="cta-button">Add New Transaction</button>
      </div>
    </div>
  );
}

export default DashboardPage;
