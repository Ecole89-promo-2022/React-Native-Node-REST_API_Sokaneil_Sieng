// contexts/AuthContext.js - getUserProfile function update
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Create the authentication context
export const AuthContext = createContext();

// API Base URL - dynamically set based on platform
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000'  // Android emulator special IP for host's localhost
  : 'http://localhost:3000'; // iOS simulator or web

// For debugging
console.log('Using API URL:', API_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on app load
  useEffect(() => {
    const loadStoredAuthState = async () => {
      try {
        // Load token and user from AsyncStorage
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Set authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuthState();
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    setError(null);
    try {
      // Note: The backend expects "name", not "username"
      const response = await axios.post(`${API_URL}/user/new`, {
        name,
        email,
        password
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login a user
  const login = async (email, password) => {
    setError(null);
    try {
      console.log('Attempting login to:', `${API_URL}/user/login`);
      console.log('With credentials:', { email, password: '***' });
      
      const response = await axios.post(`${API_URL}/user/login`, {
        email,
        password
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);
      
      // The backend only returns a token, not user data
      const { token: receivedToken } = response.data;
      
      if (!receivedToken) {
        throw new Error('No token received from server');
      }
      
      // Store token in state
      setToken(receivedToken);
      
      // Set authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      console.log('Set Authorization header for future requests');
      
      // Get user profile data
      const profileResponse = await axios.get(`${API_URL}/user/monprofil`, {
        headers: {
          'Authorization': `Bearer ${receivedToken}`
        }
      });
      
      console.log('User profile response:', profileResponse.status);
      const userData = profileResponse.data.data;
      
      console.log('User profile data:', userData);
      
      // Set user data
      setUser(userData);
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem('authToken', receivedToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout the user
  const logout = async () => {
    try {
      // Clear auth state
      setUser(null);
      setToken(null);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // Clear authorization header
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.isAdmin === true;
  };

  // Get user profile
  const getUserProfile = async () => {
    setError(null);
    try {
      console.log('Getting user profile from:', `${API_URL}/user/monprofil`);
      console.log('Current token:', token ? 'Token exists' : 'No token');
      console.log('Authorization header:', axios.defaults.headers.common['Authorization'] || 'Not set');
      
      // Explicitly set the Authorization header for this request to ensure it's correct
      const response = await axios.get(`${API_URL}/user/monprofil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile response status:', response.status);
      console.log('Profile response data:', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      setError(error.response?.data?.message || 'Failed to get profile');
      throw error;
    }
  };

  // Get all users (admin only)
  const getAllUsers = async () => {
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get users');
      throw error;
    }
  };

  // Value object to be provided to consumers
  const contextValue = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    isAdmin: isAdmin(),
    register,
    login,
    logout,
    getUserProfile,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy context use
export const useAuth = () => useContext(AuthContext);