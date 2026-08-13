import { createContext, useState } from 'react';
import api from '../services/api';

export const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/menu/categories');
      setCategories(response.data.categories);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  }

  async function fetchItems() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/menu/items');
      setItems(response.data.items);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching items');
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(name, description) {
    try {
      setError(null);
      const response = await api.post('/menu/categories', { name, description });
      setCategories([...categories, response.data.category]);
      return response.data.category;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create category';
      setError(errorMsg);
      throw err;
    }
  }

  async function updateCategory(id, updates) {
    try {
      setError(null);
      const response = await api.put(`/menu/categories/${id}`, updates);
      setCategories(categories.map(c => c.id === id ? response.data.category : c));
      return response.data.category;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update category';
      setError(errorMsg);
      throw err;
    }
  }

  async function deleteCategory(id) {
    try {
      setError(null);
      await api.delete(`/menu/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete category';
      setError(errorMsg);
      throw err;
    }
  }

  async function createItem(categoryId, name, price, description, isVeg) {
    try {
      setError(null);
      const response = await api.post('/menu/items', {
        categoryId,
        name,
        price,
        description,
        isVeg
      });
      setItems([...items, response.data.item]);
      return response.data.item;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create item';
      setError(errorMsg);
      throw err;
    }
  }

  async function updateItem(id, updates) {
    try {
      setError(null);
      const response = await api.put(`/menu/items/${id}`, updates);
      setItems(items.map(i => i.id === id ? response.data.item : i));
      return response.data.item;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update item';
      setError(errorMsg);
      throw err;
    }
  }

  async function deleteItem(id) {
    try {
      setError(null);
      await api.delete(`/menu/items/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete item';
      setError(errorMsg);
      throw err;
    }
  }

  const value = {
    categories,
    items,
    loading,
    error,
    fetchCategories,
    fetchItems,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}
