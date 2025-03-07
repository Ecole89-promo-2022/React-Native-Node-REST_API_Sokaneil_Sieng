// screens/CreateEditPostScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import PostService from '../services/PostService';

export default function CreateEditPostScreen({ route, navigation }) {
  // Check if we're editing an existing post
  const isEditing = route.params?.postId ? true : false;
  const isOwnPost = route.params?.isOwnPost;
  const postId = route.params?.postId;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPost, setIsFetchingPost] = useState(isEditing);
  const [error, setError] = useState(null);
  
  const { user, token, isAdmin } = useAuth();
  
  // If editing, fetch the post data
  useEffect(() => {
    if (isEditing && postId) {
      const fetchPostDetails = async () => {
        try {
          const response = await PostService.getPostById(postId);
          console.log('Post details for editing:', response);
          setTitle(response.title);
          setContent(response.content);
        } catch (error) {
          setError('Failed to load post details');
          Alert.alert('Error', 'Could not load post data');
        } finally {
          setIsFetchingPost(false);
        }
      };
      
      fetchPostDetails();
    }
  }, [isEditing, postId]);
  
  const handleSubmit = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const postData = { title, content };
      
      if (isEditing) {
        // Update existing post
        console.log('Updating post:', postId);
        console.log('Is admin:', isAdmin, 'Is own post:', isOwnPost);
        
        if (isAdmin && !isOwnPost) {
          await PostService.updatePost(postId, postData, token);
        } else {
          await PostService.updateOwnPost(postId, postData, token);
        }
        
        Alert.alert('Success', 'Post updated successfully');
      } else {
        // Create new post
        console.log('Creating new post');
        await PostService.createPost(postData, token);
        Alert.alert('Success', 'Post created successfully');
      }
      
      // Navigate back after successful operation
      navigation.goBack();
    } catch (error) {
      console.error('Post operation error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        isEditing ? 'Failed to update post' : 'Failed to create post'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // If still fetching post details in edit mode
  if (isFetchingPost) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter post title"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Write your post content here..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update' : 'Publish'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    marginVertical: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contentInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});