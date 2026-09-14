// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAuthStore } from '../store';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import TechnicianNavigator from './TechnicianNavigator';
import { UserRole } from '../types';
import CustomerServicesScreen from '../screens/customer/CustomerServicesScreen';
import CustomerServiceDetailScreen from '../screens/customer/CustomerServiceDetailScreen';
import CustomerAIDiagnosisScreen from '../screens/customer/CustomerAIDiagnosisScreen';
import CustomerAIChatScreen from '../screens/customer/CustomerAIChatScreen';
import CustomerMatchingScreen from '../screens/customer/CustomerMatchingScreen';
import CustomerTechFoundScreen from '../screens/customer/CustomerTechFoundScreen';
import CustomerTrackingScreen from '../screens/customer/CustomerTrackingScreen';
import CustomerQuotationScreen from '../screens/customer/CustomerQuotationScreen';
import CustomerUnderRepairScreen from '../screens/customer/CustomerUnderRepairScreen';
import CustomerCompletedScreen from '../screens/customer/CustomerCompletedScreen';
import CustomerReviewScreen from '../screens/customer/CustomerReviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user?.role === UserRole.TECHNICIAN ? (
          <>
            <Stack.Screen name="TechnicianMain" component={TechnicianNavigator} />
            <Stack.Screen name="CustomerMain" component={CustomerNavigator} />
            <Stack.Screen name="CustomerServices" component={CustomerServicesScreen} />
            <Stack.Screen name="CustomerServiceDetail" component={CustomerServiceDetailScreen} />
            <Stack.Screen name="CustomerAIDiagnosis" component={CustomerAIDiagnosisScreen} />
            <Stack.Screen name="CustomerAIChat" component={CustomerAIChatScreen} />
            <Stack.Screen name="CustomerMatching" component={CustomerMatchingScreen} />
            <Stack.Screen name="CustomerTechFound" component={CustomerTechFoundScreen} />
            <Stack.Screen name="CustomerTracking" component={CustomerTrackingScreen} />
            <Stack.Screen name="CustomerQuotation" component={CustomerQuotationScreen} />
            <Stack.Screen name="CustomerUnderRepair" component={CustomerUnderRepairScreen} />
            <Stack.Screen name="CustomerCompleted" component={CustomerCompletedScreen} />
            <Stack.Screen name="CustomerReview" component={CustomerReviewScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            {/* Khi vừa mở app: Vào ngay Trang chủ Khách hàng (theo chuẩn Vua Thợ / Xanh SM) */}
            <Stack.Screen name="CustomerMain" component={CustomerNavigator} />
            <Stack.Screen name="TechnicianMain" component={TechnicianNavigator} />
            <Stack.Screen name="CustomerServices" component={CustomerServicesScreen} />
            <Stack.Screen name="CustomerServiceDetail" component={CustomerServiceDetailScreen} />
            <Stack.Screen name="CustomerAIDiagnosis" component={CustomerAIDiagnosisScreen} />
            <Stack.Screen name="CustomerAIChat" component={CustomerAIChatScreen} />
            <Stack.Screen name="CustomerMatching" component={CustomerMatchingScreen} />
            <Stack.Screen name="CustomerTechFound" component={CustomerTechFoundScreen} />
            <Stack.Screen name="CustomerTracking" component={CustomerTrackingScreen} />
            <Stack.Screen name="CustomerQuotation" component={CustomerQuotationScreen} />
            <Stack.Screen name="CustomerUnderRepair" component={CustomerUnderRepairScreen} />
            <Stack.Screen name="CustomerCompleted" component={CustomerCompletedScreen} />
            <Stack.Screen name="CustomerReview" component={CustomerReviewScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
