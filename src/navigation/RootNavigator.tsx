/**
 * Root Navigator
 * 
 * Main navigation structure that handles authentication state
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { SplashScreen, LoginScreen, OTPVerificationScreen } from '../screens';
import { AppNavigator } from './AppNavigator';

const Stack = createNativeStackNavigator();

/**
 * Authentication Stack Navigator
 */
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
      />
    </Stack.Navigator>
  );
};

/**
 * Root Navigator Component
 */
export const RootNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen
            name="AppStack"
            component={AppNavigator}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        ) : (
          <Stack.Screen
            name="AuthStack"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
