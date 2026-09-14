// src/navigation/CustomerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Bell, User } from 'lucide-react-native';
import type { CustomerTabParamList } from '../types';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import CustomerBookingsScreen from '../screens/customer/CustomerBookingsScreen';
import CustomerNotificationsScreen from '../screens/customer/CustomerNotificationsScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';
import { GlassTabBar } from '../components/navigation/GlassTabBar';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false, // You can toggle this per screen below
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
          } else if (route.name === 'Bookings') {
            return <Calendar size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
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
        component={CustomerHomeScreen}
        options={{
          title: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={CustomerBookingsScreen}
        options={{
          title: 'Đơn của tôi',
          headerShown: true,
          headerTitle: 'Lịch sử & Hoạt động',
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={CustomerNotificationsScreen}
        options={{
          title: 'Thông báo',
          headerShown: true,
          headerTitle: 'Thông báo & Ưu đãi',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          title: 'Tài khoản',
          headerShown: false,
          headerTitle: 'Hồ sơ cá nhân',
        }}
      />
    </Tab.Navigator>
  );
}
