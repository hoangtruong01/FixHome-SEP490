// src/navigation/TechnicianNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Briefcase, Bell, User } from 'lucide-react-native';
import type { TechnicianTabParamList } from '../types';
import TechnicianHomeScreen from '../screens/technician/TechnicianHomeScreen';
import TechnicianJobsScreen from '../screens/technician/TechnicianJobsScreen';
import TechnicianNotificationsScreen from '../screens/technician/TechnicianNotificationsScreen';
import TechnicianProfileScreen from '../screens/technician/TechnicianProfileScreen';
import { GlassTabBar } from '../components/navigation/GlassTabBar';

const Tab = createBottomTabNavigator<TechnicianTabParamList>();

export default function TechnicianNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Jobs') {
            return <Briefcase size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Notifications') {
            return <Bell size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Profile') {
            return <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={TechnicianHomeScreen}
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Jobs"
        component={TechnicianJobsScreen}
        options={{ title: 'Công việc' }}
      />
      <Tab.Screen
        name="Notifications"
        component={TechnicianNotificationsScreen}
        options={{ title: 'Thông báo' }}
      />
      <Tab.Screen
        name="Profile"
        component={TechnicianProfileScreen}
        options={{ title: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}
