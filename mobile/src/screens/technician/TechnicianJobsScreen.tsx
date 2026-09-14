import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

export default function TechnicianJobsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          <TouchableOpacity style={styles.jobCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconMap}>
                <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeTextGreen}>Đang trên đường</Text>
                </View>
                <Text style={styles.jobTitle}>#FH-240921 · Điều hòa</Text>
                <Text style={styles.jobMeta}>Cầu Giấy · ETA 9 phút</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.jobCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconMap}>
                <Ionicons name="build-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.badgeNeutral}>
                  <Text style={styles.badgeTextNeutral}>Đang sửa chữa</Text>
                </View>
                <Text style={styles.jobTitle}>#FH-240918 · Máy giặt</Text>
                <Text style={styles.jobMeta}>Chờ linh kiện đã được duyệt</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  list: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  badgeGreen: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeTextGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  badgeNeutral: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeTextNeutral: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 13,
    color: '#64748B',
  },
});
