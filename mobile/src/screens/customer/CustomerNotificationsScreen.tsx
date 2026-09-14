import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useScrollHideTabBar } from '../../hooks/useScrollHideTabBar';

export default function CustomerNotificationsScreen() {
  const handleScroll = useScrollHideTabBar();
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionTitle}>Hôm nay</Text>
        
        <TouchableOpacity style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.title}>Kỹ thuật viên đang đến</Text>
            <Text style={styles.desc}>Nguyễn Đức Anh dự kiến đến sau 12 phút.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="cash-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.title}>Cần duyệt báo giá phát sinh</Text>
            <Text style={styles.desc}>Báo giá #QT-8821 · +250.000đ</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.title}>Voucher FIX50 sắp hết hạn</Text>
            <Text style={styles.desc}>Còn 24 ngày để sử dụng.</Text>
          </View>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
