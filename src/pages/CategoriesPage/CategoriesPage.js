// src/pages/CategoriesPage/CategoriesPage.js
import React, { useState } from 'react';
import { useCategories } from '../../context/CategoryContext';
import './CategoriesPage.css';

// Component for adding/editing a category
const CategoryForm = ({ categoryToEdit, onSave, onCancel }) => {
  const [name, setName] = useState(categoryToEdit?.name || '');
  const [type, setType] = useState(categoryToEdit?.type || 'expense');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !type) {
      setError('Please enter a name and select a type.');
      return;
    }

    const newCategory = {
      id: categoryToEdit?.id || name.toLowerCase().replace(/\s/g, '-'), // Use existing ID or generate from name
      name: name.trim(),
      type,
    };

    onSave(newCategory);
    if (!categoryToEdit) {
      setName(''); // Clear name field after adding new category
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form card">
      <h3>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</h3>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="categoryName">Category Name:</label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-label="Category Name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="categoryType">Type:</label>
        <select id="categoryType" value={type} onChange={(e) => setType(e.target.value)} required aria-label="Category Type">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {categoryToEdit ? 'Update Category' : 'Add Category'}
        </button>
        {categoryToEdit && (
          <button type="button" onClick={onCancel} className="secondary-button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Main CategoriesPage component
function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const handleSaveCategory = (category) => {
    if (categoryToEdit) {
      updateCategory(category);
      setCategoryToEdit(null); // Exit edit mode
    } else {
      addCategory(category);
    }
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
  };

  if (loading) {
    return (
      <div className="page-container categories-page">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="page-container categories-page">
      <h1>Manage Categories</h1>

      <CategoryForm
        categoryToEdit={categoryToEdit}
        onSave={handleSaveCategory}
        onCancel={() => setCategoryToEdit(null)}
      />

      <div className="categories-list-section card">
        <h2>Your Categories</h2>
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map(cat => (
              <div key={cat.id} className="category-item">
                <span className="category-name">{cat.name}</span>
                <span className={`category-type-badge ${cat.type}`}>
                  {cat.type === 'income' ? 'Income' : 'Expense'}
                </span>
                <div className="category-actions">
                  <button onClick={() => handleEditCategory(cat)} className="action-button edit-button">
                    Edit
                  </button>
                  {/* Only allow deleting non-default categories (simple check by ID) */}
                  {!['food', 'transport', 'housing', 'salary', 'freelance', 'utilities', 'entertainment', 'health', 'education', 'investments', 'gifts'].includes(cat.id) && (
                    <button onClick={() => handleDeleteCategory(cat.id)} className="action-button delete-button">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-categories">No categories defined yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;
