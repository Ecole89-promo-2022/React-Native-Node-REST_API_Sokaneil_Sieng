// services/PostService.js
import axios from 'axios';
import { Platform } from 'react-native';

// API Base URL - dynamic based on platform
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000'  // Android emulator special IP for host's localhost
  : 'http://localhost:3000'; // iOS simulator or web

// For debugging
console.log('PostService using API URL:', API_URL);

export default {
  // Get all posts
  getAllPosts: async () => {
    try {
      console.log('Fetching all posts from:', `${API_URL}/post/all`);
      const response = await axios.get(`${API_URL}/post/all`);
      console.log('Posts API response status:', response.status);
      
      // Check response structure
      if (response.data && response.data.data) {
        console.log('Posts received, count:', response.data.data.length);
        return response.data.data;
      }
      
      console.log('Posts received, count:', Array.isArray(response.data) ? response.data.length : 'unknown format');
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get a single post by ID
  getPostById: async (postId) => {
    try {
      console.log('Fetching post with ID:', postId);
      const response = await axios.get(`${API_URL}/post/${postId}`);
      console.log('Post detail response status:', response.status);
      
      // Check response structure
      if (response.data && response.data.data) {
        console.log('Post details received:', response.data.data.id);
        return response.data.data;
      }
      
      console.log('Post details received:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Create a new post (requires authentication)
  createPost: async (postData, token) => {
    try {
      console.log('Creating post with data:', postData);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.post(
        `${API_URL}/post/new`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Create post response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update a post (admin only)
  updatePost: async (postId, postData, token) => {
    try {
      console.log('Admin updating post:', postId);
      console.log('With data:', postData);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.put(
        `${API_URL}/post/update/${postId}`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update post response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update user's own post
  updateOwnPost: async (postId, postData, token) => {
    try {
      console.log('Updating own post:', postId);
      console.log('With data:', postData);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.put(
        `${API_URL}/post/updateOwnPost/${postId}`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update own post response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating own post ${postId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete a post (admin only)
  deletePost: async (postId, token) => {
    try {
      console.log('Admin deleting post:', postId);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.delete(
        `${API_URL}/post/delete/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Delete post response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete user's own post
  deleteOwnPost: async (postId, token) => {
    try {
      console.log('Deleting own post:', postId);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.delete(
        `${API_URL}/post/deleteOwnPost/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Delete own post response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting own post ${postId}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};