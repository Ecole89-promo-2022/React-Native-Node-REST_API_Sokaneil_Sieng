// screens/UserProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import PostService from '../services/PostService';

export default function UserProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token, logout, getUserProfile } = useAuth();
  
  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      // Get all posts
      const allPosts = await PostService.getAllPosts();
      
      if (!allPosts || !Array.isArray(allPosts)) {
        console.log('No posts returned or invalid format');
        return [];
      }
      
      // Filter posts by the current user's ID
      console.log('Filtering posts for user ID:', user.id);
      const filteredPosts = allPosts.filter(post => post.userId === user.id);
      console.log('Filtered posts:', filteredPosts.length);
      
      return filteredPosts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  };
  
  // Fetch user profile and their posts
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Get user profile
      const profileResponse = await getUserProfile();
      setUserProfile(profileResponse);
      console.log('User profile:', profileResponse);
      
      // Fetch user's posts separately
      const posts = await fetchUserPosts();
      setUserPosts(posts);
      
      setError(null);
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load profile on initial render
  useEffect(() => {
    fetchUserData();
  }, []);
  
  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            // Navigation will be handled by the AuthNavigator
          }
        }
      ]
    );
  };
  
  // If loading
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  // If error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.username}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{userPosts.length || 0}</Text>
            <Text style={styles.statsLabel}>Posts</Text>
          </View>
          
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{user?.isAdmin ? 'Admin' : 'User'}</Text>
            <Text style={styles.statsLabel}>Role</Text>
          </View>
          
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{
              user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString() 
                : 'N/A'
            }</Text>
            <Text style={styles.statsLabel}>Joined</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('NewPost')}
        >
          <Feather name="edit-3" size={20} color="#FF6B6B" />
          <Text style={styles.actionButtonText}>Create Post</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#e74c3c" />
          <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        
        {userPosts.length === 0 ? (
          <View style={styles.emptyPostsContainer}>
            <Feather name="file-text" size={50} color="#ccc" />
            <Text style={styles.emptyPostsText}>You haven't created any posts yet</Text>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => navigation.navigate('NewPost')}
            >
              <Text style={styles.createPostButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.postItem}
                onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              >
                <View style={styles.postItemHeader}>
                  <Text style={styles.postItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.postItemDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.postItemExcerpt} numberOfLines={2}>
                  {item.content}
                </Text>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        )}
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
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fff0f0',
  },
  logoutText: {
    color: '#e74c3c',
  },
  postsSection: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyPostsContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyPostsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  createPostButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  postItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  postItemDate: {
    fontSize: 12,
    color: '#999',
  },
  postItemExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  }
});