import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

export default function CustomerTechFoundScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnCircle}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Tech Info Card */}
        <View style={styles.techCard}>
          <View style={styles.techHeader}>
            <Image source={{uri: 'https://i.pravatar.cc/150?img=11'}} style={styles.avatarLarge} />
            <View style={styles.techInfo}>
              <Text style={styles.techName}>TRƯƠNG VĂN THẮNG</Text>
              <View style={styles.badgesRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
                <View style={styles.dividerV} />
                <View style={styles.verifyBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                  <Text style={styles.verifyText}>Đã xác minh</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <View style={styles.statIconRow}>
                <Ionicons name="briefcase" size={16} color="#2563EB" />
                <Text style={styles.statVal}>209</Text>
              </View>
              <Text style={styles.statLabel}>Đơn dịch vụ</Text>
            </View>
            <View style={styles.dividerV2} />
            <View style={styles.statCol}>
              <View style={styles.statIconRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#2563EB" />
                <Text style={styles.statVal}>100%</Text>
              </View>
              <Text style={styles.statLabel}>Đã hoàn thành</Text>
            </View>
            <View style={styles.dividerV2} />
            <View style={styles.statCol}>
              <View style={styles.statIconRow}>
                <Ionicons name="time-outline" size={16} color="#2563EB" />
                <Text style={styles.statVal}>~15 phút</Text>
              </View>
              <Text style={styles.statLabel}>Phản hồi</Text>
            </View>
          </View>
        </View>

        <View style={styles.dividerH} />

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.starCircle}><Ionicons name="star" size={16} color="#F59E0B" /></View>
            <Text style={styles.sectionTitle}>Đánh giá khách hàng</Text>
          </View>

          <View style={styles.reviewStatsRow}>
            <View style={styles.overallRating}>
              <Text style={styles.overallScore}>4.9</Text>
              <View style={styles.starsWrap}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
              </View>
              <Text style={styles.totalReviewsText}>79 phản hồi</Text>
            </View>
            <View style={styles.barsContainer}>
              <View style={styles.barRow}><Text style={styles.barLabel}>5 <Ionicons name="star" size={10} color="#64748B" /></Text><View style={styles.barBg}><View style={[styles.barFill, {width: '95%'}]}/></View><Text style={styles.barCount}>76</Text></View>
              <View style={styles.barRow}><Text style={styles.barLabel}>4 <Ionicons name="star" size={10} color="#64748B" /></Text><View style={styles.barBg}><View style={[styles.barFill, {width: '5%'}]}/></View><Text style={styles.barCount}>1</Text></View>
              <View style={styles.barRow}><Text style={styles.barLabel}>3 <Ionicons name="star" size={10} color="#64748B" /></Text><View style={styles.barBg}><View style={[styles.barFill, {width: '0%'}]}/></View><Text style={styles.barCount}>0</Text></View>
              <View style={styles.barRow}><Text style={styles.barLabel}>2 <Ionicons name="star" size={10} color="#64748B" /></Text><View style={styles.barBg}><View style={[styles.barFill, {width: '0%'}]}/></View><Text style={styles.barCount}>0</Text></View>
              <View style={styles.barRow}><Text style={styles.barLabel}>1 <Ionicons name="star" size={10} color="#64748B" /></Text><View style={styles.barBg}><View style={[styles.barFill, {width: '8%'}]}/></View><Text style={styles.barCount}>2</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.dividerH} />

        <View style={styles.recentReviews}>
          <Text style={styles.recentTitle}>Phản hồi gần đây</Text>
          <View style={{height: 100, backgroundColor: '#F8FAFC', borderRadius: 12, marginTop: 16}} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarRow}>
          <View style={styles.priceLeft}>
            <Ionicons name="pricetag-outline" size={16} color="#64748B" />
            <Text style={styles.priceLabel}>Giá dự kiến</Text>
            <Ionicons name="information-circle-outline" size={14} color="#2563EB" style={{marginLeft: 4}} />
          </View>
          <Text style={styles.priceValue}>230,000đ</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('CustomerTracking')}>
          <Text style={styles.bookBtnText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtnCircle: { width: 40, height: 40, justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 120 },
  techCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  techHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarLarge: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  techInfo: { flex: 1 },
  techName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8, textTransform: 'uppercase' },
  badgesRow: { flexDirection: 'row', alignItems: 'center' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
  dividerV: { width: 1, height: 12, backgroundColor: '#CBD5E1', marginHorizontal: 12 },
  verifyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifyText: { fontSize: 14, color: '#64748B' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  statCol: { flex: 1, alignItems: 'center' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statVal: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  statLabel: { fontSize: 12, color: '#64748B' },
  dividerV2: { width: 1, height: 32, backgroundColor: '#F1F5F9', marginTop: 4 },
  criteriaBox: { backgroundColor: '#FFFFFF' },
  criteriaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  criteriaIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2563EB' },
  criteriaStar: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#F59E0B', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  criteriaTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  criteriaSub: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  progressBarWrap: { marginTop: 4 },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#2563EB', borderRadius: 3 },
  dividerH: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 24 },
  reviewsSection: { paddingHorizontal: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  starCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  reviewStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  overallRating: { width: 120, alignItems: 'center' },
  overallScore: { fontSize: 48, fontWeight: '700', color: '#0F172A', marginBottom: 4, lineHeight: 56 },
  starsWrap: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  totalReviewsText: { fontSize: 12, color: '#64748B' },
  barsContainer: { flex: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 32, fontSize: 12, color: '#64748B', flexDirection: 'row', alignItems: 'center' },
  barBg: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginHorizontal: 8 },
  barFill: { height: 6, backgroundColor: '#2563EB', borderRadius: 3 },
  barCount: { width: 24, fontSize: 12, color: '#64748B', textAlign: 'right' },
  tagsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tagItem: { alignItems: 'center', width: '23%', backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  tagIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  checkMini: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10B981', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF' },
  tagScore: { fontSize: 12, color: '#10B981', fontWeight: '700', marginBottom: 4 },
  tagLabel: { fontSize: 12, color: '#64748B' },
  recentReviews: {},
  recentTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  bottomBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  priceLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceLabel: { fontSize: 14, color: '#64748B' },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  bookBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  bookBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
