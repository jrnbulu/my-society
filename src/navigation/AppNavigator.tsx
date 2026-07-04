/**
 * App Navigator
 * 
 * Main application navigation with drawer menu
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  DashboardScreen,
  ProfileScreen,
  SettingsScreen,
} from '../screens';
import { SCREEN_NAMES } from '../constants';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/**
 * Dashboard Stack Navigator
 */
const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.DASHBOARD}
        component={DashboardScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'My Profile',
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.SETTINGS}
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * App Navigator Component with Drawer
 */
export const AppNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
      }}
    >
      <Drawer.Screen
        name="DashboardStack"
        component={DashboardStackNavigator}
        options={{
          drawerLabel: 'Dashboard',
        }}
      />
    </Drawer.Navigator>
  );
};
