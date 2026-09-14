import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileHeaderProps {
  name: string;
  phone: string;
  avatarText: string;
  isDarkMode?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  phone,
  avatarText,
  isDarkMode = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Cover Background */}
      <View style={styles.coverWrapper}>
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#3B82F6', '#1D4ED8']}
          style={styles.coverBackground}
        />
      </View>

      {/* Avatar & Info Container */}
      <View style={styles.infoContainer}>
        {/* Avatar overlapping the cover */}
        <View style={[styles.avatarBorder, isDarkMode ? styles.avatarBorderDark : styles.avatarBorderLight]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
        </View>

        {/* User Info */}
        <Text style={[styles.name, isDarkMode && styles.textDark]}>{name}</Text>
        <Text style={styles.phone}>{phone}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  coverWrapper: {
    width: '100%',
    height: 140, // cover height
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  coverBackground: {
    flex: 1,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: -50, // pull avatar up over the cover
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarBorderLight: {
    borderColor: '#F8FAFC', // Match typical background
    backgroundColor: '#F8FAFC',
  },
  avatarBorderDark: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#DBEAFE', // Light blue background for text avatar
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2563EB',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  textDark: {
    color: '#F8FAFC',
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});
