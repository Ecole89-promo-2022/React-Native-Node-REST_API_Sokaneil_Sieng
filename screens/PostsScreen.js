// screens/PostsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import PostService from '../services/PostService';

export default function PostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token, isAuthenticated, isAdmin } = useAuth();
  
  // Fetch all posts
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await PostService.getAllPosts();
      console.log('Posts received:', response);
      setPosts(response);
      setError(null);
    } catch (error) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchPosts();
  }, []);
  
  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPosts();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Delete post handler
  const handleDeletePost = async (postId, post) => {
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
              console.log('Deleting post:', postId);
              console.log('Post userId:', post.userId, 'Current user id:', user.id);
              console.log('Is admin:', isAdmin, 'Is own post:', isOwnPost);
              
              if (isAdmin) {
                await PostService.deletePost(postId, token);
              } else if (isOwnPost) {
                await PostService.deleteOwnPost(postId, token);
              } else {
                Alert.alert('Error', 'You can only delete your own posts');
                return;
              }
              
              // Refresh posts after deletion
              fetchPosts();
              Alert.alert('Success', 'Post deleted successfully');
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
  const canEditPost = (post) => {
    if (!isAuthenticated) return false;
    return isAdmin || post.userId === user.id;
  };
  
  const canDeletePost = (post) => {
    if (!isAuthenticated) return false;
    return isAdmin || post.userId === user.id;
  };
  
  // If loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }
  
  // If error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Articles</Text>
        
        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.newPostButton}
            onPress={() => navigation.navigate('NewPost')}
          >
            <Feather name="plus" size={20} color="white" />
            <Text style={styles.newPostButtonText}>New Post</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="file-text" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No posts available</Text>
          {isAuthenticated && (
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('NewPost')}
            >
              <Text style={styles.createFirstButtonText}>Create First Post</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            >
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{item.title}</Text>
                
                <View style={styles.postActions}>
                  {canEditPost(item) && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('EditPost', { 
                        postId: item.id,
                        isOwnPost: item.userId === user.id
                      })}
                    >
                      <Feather name="edit" size={18} color="#3498db" />
                    </TouchableOpacity>
                  )}
                  
                  {canDeletePost(item) && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeletePost(item.id, item)}
                    >
                      <Feather name="trash-2" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              <Text style={styles.postExcerpt} numberOfLines={2}>
                {item.content}
              </Text>
              
              <View style={styles.postFooter}>
                <View style={styles.authorContainer}>
                  <Feather name="user" size={14} color="#666" />
                  <Text style={styles.authorText}>
                    {item.User ? item.User.name : 'Unknown Author'}
                  </Text>
                </View>
                
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.postsList}
        />
      )}
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newPostButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  newPostButtonText: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postsList: {
    padding: 16,
    paddingBottom: 24,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  postActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  }
});