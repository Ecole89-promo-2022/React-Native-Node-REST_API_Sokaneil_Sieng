// app/App.js
import React from 'react';
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import navigation - fix the path to be relative to app folder
import AppNavigator from './navigation/AppNavigator';

// Import context providers - fix the path to be relative to app folder
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}