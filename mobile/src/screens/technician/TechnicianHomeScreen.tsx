import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { LinearGradient } from 'expo-linear-gradient';

export default function TechnicianHomeScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color="#2563EB" />
          </View>
          <Text style={styles.headerName}>{user?.fullName || 'Lạc Vỹ'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Tổng quan tuần này */}
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Tổng quan tuần này</Text>
        </View>

        <View style={styles.overviewRow}>
          <LinearGradient colors={['#E0F2FE', '#F0F9FF']} style={styles.overviewCard}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#BAE6FD' }]}>
                <Ionicons name="wallet" size={16} color="#0284C7" />
              </View>
              <Text style={styles.cardLabel}>Thu nhập</Text>
            </View>
            <Text style={styles.cardValue}>0 <Text style={styles.cardUnit}>đ</Text></Text>
          </LinearGradient>

          <LinearGradient colors={['#FEF3C7', '#FFFBEB']} style={styles.overviewCard}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#FDE68A' }]}>
                <Ionicons name="checkmark" size={16} color="#D97706" />
              </View>
              <Text style={styles.cardLabel}>Hoàn thành</Text>
            </View>
            <Text style={styles.cardValue}>0 <Text style={styles.cardUnit}>đơn</Text></Text>
          </LinearGradient>
        </View>

        {/* Mục tiêu tuần */}
        <View style={styles.targetContainer}>
          <View style={styles.targetRow}>
            <View style={styles.targetIcon}>
              <Ionicons name="calendar" size={14} color="#2563EB" />
            </View>
            <Text style={styles.targetLabel}>Mục tiêu tuần</Text>
            <Text style={styles.targetValue}>0/20 đơn</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
          </View>
        </View>

        {/* Tăng xếp hạng */}
        <View style={styles.targetContainer}>
          <View style={styles.rankRow}>
            <View style={styles.rankIconContainer}>
              <Ionicons name="clipboard" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankTitle}>Hoàn thành để tăng xếp hạng</Text>
              <Text style={styles.rankSubtitle}>Đã đạt 2/10 tiêu chí</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '20%' }]} />
          </View>
        </View>

        {/* Banner Cuối */}
        <LinearGradient colors={['#93C5FD', '#BFDBFE']} style={styles.bottomBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomBannerTitle}>Đua Top Ngay,{'\n'}Rinh Honda Wave</Text>
            <Text style={styles.bottomBannerSubtitle}>Cơ hội sở hữu Honda Wave cùng nhiều phần thưởng giá trị.</Text>
            <TouchableOpacity style={styles.joinBtn}>
              <Text style={styles.joinBtnText}>Tham gia ngay</Text>
              <Ionicons name="chevron-forward" size={14} color="#000" />
            </TouchableOpacity>
          </View>
          <Ionicons name="trophy" size={60} color="#EAB308" style={{ marginLeft: 8 }} />
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerLogo: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoText1: {
    color: '#FDE047',
    fontSize: 12,
    fontWeight: '900',
  },
  logoText2: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  bannerScroll: {
    marginBottom: 24,
    overflow: 'visible',
  },
  bannerItem: {
    width: 140,
    height: 180,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-start',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  bannerImagePlaceholder: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: 0.5,
  },
  targetContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  rankSubtitle: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 2,
    fontWeight: '500',
  },
  bottomBanner: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  bottomBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  bottomBannerSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 18,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginRight: 4,
  },
});
