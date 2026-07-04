/**
 * Main App Component
 * 
 * Root application component that initializes Firebase, Auth Provider,
 * and sets up navigation
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation';
import { COLORS } from './constants';

/**
 * App Component
 */
const App = (): React.JSX.Element => {
  useEffect(() => {
    // App initialization logic can go here
    console.log('App initialized');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.WHITE}
          translucent={false}
        />
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;
