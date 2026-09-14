import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

export default function TechnicianNotificationsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Công việc mới gần bạn</Text>
              <Text style={styles.desc}>Điều hòa không lạnh · 2.1 km · phản hồi trong 45s</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainerActive}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Khách hàng đã duyệt báo giá</Text>
              <Text style={styles.desc}>#QT-8821 · +250.000đ</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Thu nhập đã ghi nhận</Text>
              <Text style={styles.desc}>+280.000đ từ #FH-240921</Text>
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
