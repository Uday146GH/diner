import { useAuth } from '../../hooks/useAuth';
import { useRestaurant } from '../../hooks/useRestaurant';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { restaurant, loading } = useRestaurant();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/auth/login');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">No Restaurant Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your restaurant to get started with managing your digital menu.
          </p>
          <button
            onClick={() => navigate('/owner/create-restaurant')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
          >
            Create Restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍽️ DineR Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {user?.full_name || user?.email}!
          </h2>
          <p className="text-gray-600">
            Restaurant: <span className="font-semibold text-blue-600">{restaurant.name}</span>
          </p>
          <p className="text-gray-600">
            URL: <span className="font-mono text-sm">https://diner.com/r/{restaurant.slug}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">🍴 Menu Management</h3>
            <p className="text-gray-600 mb-4">Manage your menu categories and items</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Manage Menu
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">📋 Orders</h3>
            <p className="text-gray-600 mb-4">View and manage customer orders</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              View Orders
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">🔗 QR Code</h3>
            <p className="text-gray-600 mb-4">Download your QR code for customers</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Get QR Code
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">⚙️ Settings</h3>
            <p className="text-gray-600 mb-4">Update restaurant details and settings</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Edit Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
