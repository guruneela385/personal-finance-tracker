// src/pages/TransactionsPage/TransactionsPage.js
import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useCategories } from '../../context/CategoryContext';
import './TransactionsPage.css';

// Helper component for adding/editing a transaction
const TransactionForm = ({ transactionToEdit, onSave, onCancel }) => {
  const { categories } = useCategories();
  const [type, setType] = useState(transactionToEdit?.type || 'expense');
  const [amount, setAmount] = useState(transactionToEdit?.amount || '');
  const [category, setCategory] = useState(transactionToEdit?.category || '');
  const [date, setDate] = useState(transactionToEdit?.date ? transactionToEdit.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(transactionToEdit?.description || '');
  const [error, setError] = useState('');

  // Filter categories based on selected type
  const filteredCategories = categories.filter(cat => cat.type === type);

  // Set default category when type changes or on initial load if no category is set
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some(cat => cat.name === category)) {
      setCategory(filteredCategories[0].name);
    } else if (filteredCategories.length === 0) {
      setCategory(''); // No categories for this type
    }
  }, [type, filteredCategories, category]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !category || !date || !description) {
      setError('Please fill in all fields.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    const newTransaction = {
      id: transactionToEdit?.id || Date.now(), // Use existing ID if editing
      type,
      amount: parseFloat(amount),
      category,
      date: new Date(date), // Store as Date object
      description,
    };

    onSave(newTransaction);
    // Reset form after saving if it's a new transaction
    if (!transactionToEdit) {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      // Keep type and category as they might be preferred defaults
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form card">
      <h3>{transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}</h3>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="type">Type:</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
          aria-label="Amount"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))
          ) : (
            <option value="">No categories available. Add some in Settings!</option>
          )}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          aria-label="Date"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          required
          aria-label="Description"
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {transactionToEdit ? 'Update Transaction' : 'Add Transaction'}
        </button>
        {transactionToEdit && (
          <button type="button" onClick={onCancel} className="secondary-button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Main TransactionsPage component
function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useTransactions();
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'amount-high', 'amount-low'
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const { categories } = useCategories();

  const handleSaveTransaction = (transaction) => {
    if (transactionToEdit) {
      updateTransaction(transaction);
      setTransactionToEdit(null); // Exit edit mode
    } else {
      addTransaction(transaction);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
  };

  const handleCancelEdit = () => {
    setTransactionToEdit(null);
  };

  // Filtered and sorted transactions
  const filteredAndSortedTransactions = transactions
    .filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchesSearch = searchTerm === '' ||
                            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.date.getTime() - a.date.getTime();
      } else if (sortOrder === 'oldest') {
        return a.date.getTime() - b.date.getTime();
      } else if (sortOrder === 'amount-high') {
        return b.amount - a.amount;
      } else if (sortOrder === 'amount-low') {
        return a.amount - b.amount;
      }
      return 0;
    });

  // Get unique categories for filtering
  const uniqueCategories = [...new Set(categories.map(cat => cat.name))];

  if (loading) {
    return (
      <div className="page-container transactions-page">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="page-container transactions-page">
      <h1>Your Transactions</h1>

      <TransactionForm
        transactionToEdit={transactionToEdit}
        onSave={handleSaveTransaction}
        onCancel={handleCancelEdit}
      />

      <div className="transactions-list-section card">
        <h2>All Transactions</h2>
        <div className="filters-sort-bar">
          <div className="filter-group">
            <label htmlFor="filterType">Type:</label>
            <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterCategory">Category:</label>
            <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortOrder">Sort By:</label>
            <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount (High to Low)</option>
              <option value="amount-low">Amount (Low to High)</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <label htmlFor="searchTerm">Search:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search transactions"
            />
          </div>
        </div>

        {filteredAndSortedTransactions.length > 0 ? (
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTransactions.map(t => (
                  <tr key={t.id} className={t.type === 'income' ? 'income-row' : 'expense-row'}>
                    <td>{t.date.toLocaleDateString()}</td>
                    <td>{t.description}</td>
                    <td>{t.category}</td>
                    <td>
                      <span className={`transaction-type-badge ${t.type}`}>
                        {t.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td>${t.amount.toFixed(2)}</td>
                    <td className="transaction-actions">
                      <button onClick={() => handleEdit(t)} className="action-button edit-button">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="action-button delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-transactions">No transactions found. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default TransactionsPage;
