import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantSlug, setRestaurantSlug] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [total, setTotal] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSlug = localStorage.getItem('restaurantSlug');
    const savedName = localStorage.getItem('customerName');
    const savedPhone = localStorage.getItem('customerPhone');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    }
    if (savedSlug) {
      setRestaurantSlug(savedSlug);
    }
    if (savedName) {
      setCustomerName(savedName);
    }
    if (savedPhone) {
      setCustomerPhone(savedPhone);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    calculateTotal();
  }, [cartItems]);

  // Save restaurant slug
  useEffect(() => {
    if (restaurantSlug) {
      localStorage.setItem('restaurantSlug', restaurantSlug);
    }
  }, [restaurantSlug]);

  // Save customer info
  useEffect(() => {
    if (customerName) {
      localStorage.setItem('customerName', customerName);
    }
  }, [customerName]);

  useEffect(() => {
    if (customerPhone) {
      localStorage.setItem('customerPhone', customerPhone);
    }
  }, [customerPhone]);

  function calculateTotal() {
    const newTotal = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    setTotal(newTotal);
  }

  function addToCart(item, slug) {
    if (!restaurantSlug) {
      setRestaurantSlug(slug);
    }

    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCartItems(
        cartItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          isVeg: item.isVeg,
          quantity: 1
        }
      ]);
    }
  }

  function removeFromCart(itemId) {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  }

  function updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(
        cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  }

  function clearCart() {
    setCartItems([]);
    // Keep customer info and slug, just clear items
  }

  function setCustomerDetails(name, phone) {
    setCustomerName(name);
    setCustomerPhone(phone);
  }

  const value = {
    cartItems,
    restaurantSlug,
    customerName,
    customerPhone,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomerDetails,
    itemCount: cartItems.length,
    isEmpty: cartItems.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
