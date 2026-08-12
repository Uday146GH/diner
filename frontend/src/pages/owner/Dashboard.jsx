import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/auth/login');
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.full_name || user?.email}!</h2>
          <p className="text-gray-600">
            Dashboard is coming soon. You can now:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Manage restaurant profile</li>
            <li>Create menu categories and items</li>
            <li>View and manage orders</li>
            <li>Generate QR codes</li>
            <li>View analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
