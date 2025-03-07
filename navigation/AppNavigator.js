// navigation/AppNavigator.js
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PostsScreen from '../screens/PostsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreateEditPostScreen from '../screens/CreateEditPostScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import UsersListScreen from '../screens/UsersListScreen';

// Import context
import { useAuth } from '../contexts/AuthContext';

// Create stack navigators
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Custom header component
const CustomHeader = ({ navigation, title, showBackButton = true, showMenu = true }) => {
  const { user, isAdmin } = useAuth();
  
  return (
    <View style={styles.headerContainer}>
      {showBackButton ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      )}
      
      {showMenu && (
        <View style={styles.menuContainer}>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navigation.navigate('UsersList')}
            >
              <Feather name="users" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <Feather name="user" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Authentication navigation stack
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Main application navigation stack
const MainNavigator = () => {
  return (
    <AppStack.Navigator
      screenOptions={({ navigation, route }) => ({
        header: (props) => (
          <CustomHeader 
            navigation={navigation} 
            title={route.name}
            showBackButton={route.name !== 'Posts'}
            showMenu={true}
          />
        ),
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <AppStack.Screen name="Posts" component={PostsScreen} />
      <AppStack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{
          title: 'Post Details'
        }}
      />
      <AppStack.Screen 
        name="NewPost" 
        component={CreateEditPostScreen}
        options={{
          title: 'Create Post'
        }}
      />
      <AppStack.Screen 
        name="EditPost" 
        component={CreateEditPostScreen}
        options={{
          title: 'Edit Post'
        }}
      />
      <AppStack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{
          title: 'My Profile'
        }}
      />
      <AppStack.Screen 
        name="UsersList" 
        component={UsersListScreen}
        options={{
          title: 'Users'
        }}
      />
    </AppStack.Navigator>
  );
};

// Root navigator that handles authentication state
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }
  
  // Directly return the appropriate navigator without wrapping in NavigationContainer
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B6B',
    paddingTop: 40, // For status bar
    paddingBottom: 10,
    paddingHorizontal: 16,
    height: 100,
  },
  logoContainer: {
    flex: 1,
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  menuContainer: {
    flexDirection: 'row',
  },
  menuButton: {
    marginLeft: 16,
  },
});

export default AppNavigator;