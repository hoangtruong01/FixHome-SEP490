// src/screens/customer/CustomerHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../constants';

// TODO: Implement customer home screen
// - Service categories
// - Recent bookings
// - AI Diagnosis entry point
// - Quick actions

export default function CustomerHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FixHome</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Customer Home – implement when features are requested
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  placeholder: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
