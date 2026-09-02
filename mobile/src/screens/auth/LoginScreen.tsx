import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, fontSize } from '../../constants';

// TODO: Implement login form with email/password
// TODO: Connect to auth API
// TODO: Navigate to appropriate screen based on user role

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>FixHome</Text>
      <Text style={styles.subtitle}>Home Repair & Maintenance</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Login screen – implement when auth feature is requested
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  placeholder: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  placeholderText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
