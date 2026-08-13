import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch restaurant when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchRestaurant();
    } else {
      setRestaurant(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  async function fetchRestaurant() {
    try {
      const response = await api.get('/restaurants/my-restaurant');
      setRestaurant(response.data.restaurant);
      setError(null);
    } catch (err) {
      // Restaurant not found is OK (user hasn't created one yet)
      if (err.response?.status === 404) {
        setRestaurant(null);
      } else {
        setError(err.response?.data?.error || 'Error fetching restaurant');
      }
    } finally {
      setLoading(false);
    }
  }

  async function createRestaurant(name) {
    try {
      setError(null);
      const response = await api.post('/restaurants', { name });
      setRestaurant(response.data.restaurant);
      return response.data.restaurant;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create restaurant';
      setError(errorMsg);
      throw err;
    }
  }

  async function updateRestaurant(updates) {
    if (!restaurant?.id) {
      throw new Error('No restaurant to update');
    }

    try {
      setError(null);
      const response = await api.put(`/restaurants/${restaurant.id}`, updates);
      setRestaurant(response.data.restaurant);
      return response.data.restaurant;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update restaurant';
      setError(errorMsg);
      throw err;
    }
  }

  const value = {
    restaurant,
    loading,
    error,
    createRestaurant,
    updateRestaurant,
    hasRestaurant: !!restaurant
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}
