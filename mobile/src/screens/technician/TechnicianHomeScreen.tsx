// src/screens/technician/TechnicianHomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../constants';

// TODO: Implement technician home screen
// - Assigned jobs
// - Job requests
// - Schedule overview
// - Earnings summary

export default function TechnicianHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Technician Dashboard</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Technician Home – implement when features are requested
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
