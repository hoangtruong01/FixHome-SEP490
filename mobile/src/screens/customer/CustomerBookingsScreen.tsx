import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useScrollHideTabBar } from '../../hooks/useScrollHideTabBar';

export default function CustomerBookingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const handleScroll = useScrollHideTabBar();

  return (
    <View style={styles.container}>
      {/* Search & Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đơn..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentContainer}>
        <TouchableOpacity style={[styles.segmentBtn, styles.segmentActive]}>
          <Text style={styles.segmentTextActive}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.segmentBtn}>
          <Text style={styles.segmentText}>Đang xử lý</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.segmentBtn}>
          <Text style={styles.segmentText}>Hoàn tất</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="snow-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.badgeSuccess}>
                <Text style={styles.badgeTextSuccess}>Hoàn thành</Text>
              </View>
              <Text style={styles.title}>Vệ sinh + thay tụ điều hòa</Text>
              <Text style={styles.meta}>07/09/2026 · 350.000đ</Text>
              <Text style={styles.meta}>KTV Nguyễn Đức Anh</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="water-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.badgeNeutral}>
                <Text style={styles.badgeTextNeutral}>Hoàn thành</Text>
              </View>
              <Text style={styles.title}>Sửa vòi rò nước</Text>
              <Text style={styles.meta}>19/08/2026 · 220.000đ</Text>
              <Text style={styles.meta}>KTV Quốc Huy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
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
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    margin: 16,
    padding: 4,
    borderRadius: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  badgeSuccess: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeTextSuccess: {
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
});
