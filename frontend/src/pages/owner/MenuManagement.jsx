import { useState, useEffect } from 'react';
import { useMenu } from '../../hooks/useMenu';

export default function MenuManagement() {
  const { categories, items, loading, error, fetchCategories, fetchItems, createCategory, createItem, deleteItem } = useMenu();
  const [activeTab, setActiveTab] = useState('categories');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  async function handleAddCategory(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      await createCategory(categoryName, categoryDesc);
      setCategoryName('');
      setCategoryDesc('');
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to add category');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setSubmitError('');

    if (!selectedCategory) {
      setSubmitError('Please select a category');
      return;
    }

    setSubmitLoading(true);

    try {
      await createItem(selectedCategory, itemName, parseFloat(itemPrice), itemDesc, isVeg);
      setItemName('');
      setItemPrice('');
      setItemDesc('');
      setIsVeg(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to add item');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDeleteItem(id) {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
      } catch (err) {
        setSubmitError(err.response?.data?.error || 'Failed to delete item');
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🍴 Menu Management</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {submitError}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded ${activeTab === 'items' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            Items
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Category Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Add New Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Starters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of this category"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
                >
                  {submitLoading ? 'Adding...' : 'Add Category'}
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Your Categories</h2>
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <p className="text-gray-500">No categories yet</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <h3 className="font-semibold">{cat.name}</h3>
                      {cat.description && <p className="text-sm text-gray-600">{cat.description}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Item Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Add New Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Garlic Bread"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="150"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Item description"
                    rows="2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Vegetarian</label>
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
                >
                  {submitLoading ? 'Adding...' : 'Add Item'}
                </button>
              </form>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Your Items</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-gray-500">No items yet</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">₹{parseFloat(item.price).toFixed(2)}</p>
                          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {item.is_veg ? '🥬 Veg' : '🍗 Non-Veg'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
