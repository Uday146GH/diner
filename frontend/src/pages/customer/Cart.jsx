import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import api from '../../services/api';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, restaurantSlug, total, removeFromCart, updateQuantity, clearCart, setCustomerDetails, customerName: savedName, customerPhone: savedPhone } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState(savedName || '');
  const [customerPhone, setCustomerPhone] = useState(savedPhone || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(null);

  if (cartItems.length === 0 && !orderPlaced && !showCheckout) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-xl font-semibold mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">Thank you, {orderPlaced.customer_name}!</p>
          <div className="bg-gray-50 p-4 rounded mb-6">
            <p className="text-sm text-gray-600 mb-2">Order ID</p>
            <p className="font-mono font-bold text-lg">{orderPlaced.order_number}</p>
            <p className="text-sm text-gray-600 mt-2">Total: ₹{orderPlaced.total}</p>
            <p className="text-sm text-gray-600">Status: {orderPlaced.status}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">Your order is being prepared!</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/r/${restaurantSlug}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
            >
              Order Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone) {
      setError('Please enter name and phone number');
      return;
    }

    if (customerPhone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    if (!restaurantSlug) {
      setError('Restaurant information missing');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/orders', {
        restaurantSlug,
        customerName,
        customerPhone,
        specialInstructions: specialInstructions || null,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      if (response.data.success) {
        setCustomerDetails(customerName, customerPhone);
        setOrderPlaced(response.data.order);
        clearCart();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!showCheckout ? (
          <>
            <div className="bg-white rounded-lg shadow mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="border-b last:border-b-0 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">₹{parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-xl font-bold mb-4">
                Total: ₹{total.toFixed(2)}
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold mb-3"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Checkout</h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests?"
                    rows="3"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-3">Order Summary</h3>
                  <div className="space-y-2 mb-3">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 font-bold">
                    Total: ₹{total.toFixed(2)}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded font-semibold"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>

            <button
              onClick={() => setShowCheckout(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-semibold"
            >
              Back to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}
