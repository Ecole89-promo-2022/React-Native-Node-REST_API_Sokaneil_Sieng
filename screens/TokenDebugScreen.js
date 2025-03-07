// screens/TokenDebugScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

export default function TokenDebugScreen({ navigation }) {
  const [storageData, setStorageData] = useState(null);
  const [axiosHeaders, setAxiosHeaders] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { token, user } = useAuth();
  
  // Check storage
  const checkStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      setStorageData({
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null
      });
    } catch (error) {
      console.error('Error checking storage:', error);
    }
  };
  
  // Check headers
  const checkHeaders = () => {
    setAxiosHeaders(axios.defaults.headers.common);
  };
  
  // Test API call
  const testApiCall = async () => {
    setIsLoading(true);
    try {
      // Get current token
      const currentToken = await AsyncStorage.getItem('authToken');
      
      // Test the API call with explicit token
      const response = await axios.get('http://10.0.2.2:3000/user/monprofil', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      setTestResponse({
        success: true,
        status: response.status,
        data: response.data
      });
    } catch (error) {
      setTestResponse({
        success: false,
        status: error.response?.status,
        error: error.message,
        details: error.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run checks on initial render
  useEffect(() => {
    checkStorage();
    checkHeaders();
  }, []);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Auth State</Text>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Token in Context:</Text>
          <Text style={styles.value}>{token ? 'Present' : 'Missing'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>User in Context:</Text>
          <Text style={styles.value}>{user ? 'Present' : 'Missing'}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AsyncStorage Data</Text>
        {!storageData ? (
          <ActivityIndicator size="small" color="#FF6B6B" />
        ) : (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Token in Storage:</Text>
              <Text style={styles.value}>{storageData.token ? 'Present' : 'Missing'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>User in Storage:</Text>
              <Text style={styles.value}>{storageData.user ? 'Present' : 'Missing'}</Text>
            </View>
            
            <View style={styles.tokenPreview}>
              <Text style={styles.tokenTitle}>Token Preview:</Text>
              <Text style={styles.tokenValue}>
                {storageData.token 
                  ? `${storageData.token.substring(0, 15)}...` 
                  : 'No token'}
              </Text>
            </View>
          </>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={checkStorage}
        >
          <Text style={styles.buttonText}>Refresh Storage Data</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Axios Headers</Text>
        {!axiosHeaders ? (
          <ActivityIndicator size="small" color="#FF6B6B" />
        ) : (
          <View style={styles.infoItem}>
            <Text style={styles.label}>Authorization Header:</Text>
            <Text style={styles.value}>
              {axiosHeaders.Authorization || 'Not set'}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={checkHeaders}
        >
          <Text style={styles.buttonText}>Refresh Headers</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Test</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={testApiCall}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Test Profile API Call</Text>
          )}
        </TouchableOpacity>
        
        {testResponse && (
          <View style={styles.responseContainer}>
            <Text style={[
              styles.responseStatus,
              testResponse.success ? styles.successText : styles.errorText
            ]}>
              Status: {testResponse.status || 'Unknown'}
            </Text>
            
            <Text style={styles.responseLabel}>Response Data:</Text>
            <ScrollView style={styles.responseData}>
              <Text>
                {JSON.stringify(
                  testResponse.success ? testResponse.data : testResponse.details,
                  null, 2
                )}
              </Text>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  tokenPreview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  tokenTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  responseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  responseStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    color: '#2ecc71',
  },
  errorText: {
    color: '#e74c3c',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  responseData: {
    maxHeight: 200,
    padding: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 4,
  },
});