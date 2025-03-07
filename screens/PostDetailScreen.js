// screens/PostDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import PostService from '../services/PostService';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token, isAuthenticated, isAdmin } = useAuth();
  
  // Fetch post details
  const fetchPostDetails = async () => {
    setIsLoading(true);
    try {
      const response = await PostService.getPostById(postId);
      console.log('Post details received:', response);
      setPost(response);
      setError(null);
    } catch (error) {
      setError('Failed to load post details. Please try again.');
      console.error('Error fetching post details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load post on initial render
  useEffect(() => {
    fetchPostDetails();
  }, [postId]);
  
  // Handle delete post
  const handleDeletePost = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const isOwnPost = post.userId === user.id;
              console.log('Deleting post. Post userId:', post.userId, 'Current user id:', user.id, 'Is own post:', isOwnPost);
              
              if (isAdmin) {
                await PostService.deletePost(postId, token);
              } else if (isOwnPost) {
                await PostService.deleteOwnPost(postId, token);
              } else {
                Alert.alert('Error', 'You can only delete your own posts');
                return;
              }
              
              Alert.alert('Success', 'Post deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting post:', error.response?.data || error.message);
              Alert.alert('Error', 'Failed to delete post: ' + (error.response?.data?.message || error.message));
            }
          }
        }
      ]
    );
  };
  
  // Determine if the user can edit or delete a post
  const canEditPost = () => {
    if (!post || !isAuthenticated) return false;
    return isAdmin || post.userId === user.id;
  };
  
  const canDeletePost = () => {
    if (!post || !isAuthenticated) return false;
    return isAdmin || post.userId === user.id;
  };
  
  // If loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </View>
    );
  }
  
  // If error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPostDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If post not found
  if (!post) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="file-minus" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        
        {canEditPost() && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditPost', { 
                postId: post.id,
                isOwnPost: post.userId === user.id
              })}
            >
              <Feather name="edit-2" size={16} color="white" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            {canDeletePost() && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeletePost}
              >
                <Feather name="trash-2" size={16} color="white" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.postContainer}>
        <Text style={styles.postTitle}>{post.title}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.authorInfo}>
            <Feather name="user" size={14} color="#666" />
            <Text style={styles.authorText}>
              {post.User ? post.User.name : 'Unknown Author'}
            </Text>
          </View>
          
          <Text style={styles.dateText}>
            {new Date(post.createdAt).toLocaleDateString()} • 
            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postContainer: {
    padding: 16,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});