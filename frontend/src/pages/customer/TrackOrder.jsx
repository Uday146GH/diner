import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function TrackOrder() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualOrderNumber, setManualOrderNumber] = useState(orderNumber || '');

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
      // Auto-refresh every 5 seconds
      const interval = setInterval(() => fetchOrder(orderNumber), 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  async function fetchOrder(ordNum) {
    try {
      setError('');
      const response = await api.get(`/orders/track/${ordNum}`);
      setOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found');
      setOrder(null);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!manualOrderNumber.trim()) {
      setError('Please enter order number');
      return;
    }
    setLoading(true);
    await fetchOrder(manualOrderNumber);
    setLoading(false);
  }

  const statusSteps = ['pending', 'accepted', 'preparing', 'ready', 'paid', 'completed'];
  const statusLabels = {
    pending: '📋 Order Placed',
    accepted: '✅ Accepted',
    preparing: '👨‍🍳 Preparing',
    ready: '🍴 Ready',
    paid: '💳 Paid',
    completed: '✨ Completed',
    cancelled: '❌ Cancelled'
  };

  const statusColors = {
    pending: 'bg-gray-200',
    accepted: 'bg-blue-200',
    preparing: 'bg-yellow-200',
    ready: 'bg-orange-200',
    paid: 'bg-green-200',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  if (!order && orderNumber) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Loading order...</p>
          <p className="text-gray-600">{orderNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📍 Track Your Order</h1>

        {/* Search Form */}
        {!order && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={manualOrderNumber}
                  onChange={(e) => setManualOrderNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ORD-20260816-123456"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
              >
                Track Order
              </button>
            </form>
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Order Details */}
        {order && (
          <>
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="font-mono font-bold text-lg">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Customer</p>
                  <p className="font-semibold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="font-bold text-lg">₹{order.total}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="font-semibold">{order.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Status Progress */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Order Status</h2>
              
              {/* Current Status Badge */}
              <div className="mb-6">
                <span className={`${statusColors[order.status]} text-gray-800 px-4 py-2 rounded-full font-semibold`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                {statusSteps.map((step, idx) => {
                  const isCompleted = statusSteps.indexOf(order.status) >= idx;
                  const isCurrent = order.status === step;
                  
                  return (
                    <div key={step} className="flex items-center gap-4">
                      {/* Step Circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>

                      {/* Step Label */}
                      <div className="flex-1">
                        <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                          {statusLabels[step] || step}
                        </p>
                      </div>

                      {/* Line to next step */}
                      {idx < statusSteps.length - 1 && (
                        <div className={`absolute left-5 top-[90px] w-0.5 h-12 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {order.status === 'cancelled' && (
                <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  Your order has been cancelled.
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-semibold">{item.itemName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">₹{(parseFloat(item.itemPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No items in order</p>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-2">Special Instructions</h2>
                <p className="text-gray-700">{order.specialInstructions}</p>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-center text-gray-600 text-sm">
              <p>Last updated: {new Date(order.updatedAt).toLocaleTimeString()}</p>
              <p className="mt-1 text-xs">Refreshing every 5 seconds...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
