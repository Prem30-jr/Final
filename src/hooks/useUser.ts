import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

const USER_STORAGE_KEY = 'olink_user';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUser = (userData: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const clearUser = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Error clearing user:', error);
      return false;
    }
  };

  return {
    user,
    isLoading,
    updateUser,
    clearUser
  };
}; 