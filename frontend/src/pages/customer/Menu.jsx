import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function Menu() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenu();
  }, [slug]);

  async function fetchMenu() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/public/restaurants/${slug}/menu`);
      setRestaurant(response.data.restaurant);
      setMenu(response.data.menu);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load menu');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Loading menu...</p>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <p className="text-gray-600">The restaurant menu could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl">Restaurant not found</p>
      </div>
    );
  }

  // Filter items based on search
  const filteredMenu = menu.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-2">🍽️ {restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-gray-600 text-sm mb-3">{restaurant.description}</p>
          )}
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {filteredMenu.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No items found matching your search</p>
          </div>
        ) : (
          filteredMenu.map(category => (
            <div key={category.id} className="mb-8">
              {/* Category Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
                <div className="h-1 bg-blue-500 mt-2 w-12"></div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
                  >
                    {/* Item Image Placeholder */}
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-4xl">🍴</span>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <span className="text-xs ml-2">
                          {item.is_veg ? '🥬' : '🍗'}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </span>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Restaurant Info Footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {restaurant.phone && (
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-semibold">{restaurant.phone}</p>
              </div>
            )}
            {restaurant.email && (
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-semibold">{restaurant.email}</p>
              </div>
            )}
            {restaurant.address && (
              <div>
                <p className="text-gray-600 text-sm">Address</p>
                <p className="font-semibold">{restaurant.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
