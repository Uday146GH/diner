import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../hooks/useRestaurant';

export default function CreateRestaurant() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createRestaurant } = useRestaurant();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const restaurant = await createRestaurant(name);
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">🍽️ DineR</h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
          Create Your Restaurant
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Pizza Palace"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used to create your unique restaurant URL
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          You can add more details like logo and description after creation.
        </p>
      </div>
    </div>
  );
}
