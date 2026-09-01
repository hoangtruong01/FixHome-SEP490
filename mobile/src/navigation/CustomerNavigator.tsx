// src/navigation/CustomerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CustomerTabParamList } from '../types';
import { colors } from '../constants';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

// TODO: Create placeholder screens for other tabs

function PlaceholderScreen() {
  const React = require('react');
  const { View, Text } = require('react-native');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#64748B' }}>Coming soon</Text>
    </View>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Bookings"
        component={PlaceholderScreen}
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen
        name="Notifications"
        component={PlaceholderScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
