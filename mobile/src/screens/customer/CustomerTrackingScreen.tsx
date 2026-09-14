import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

export default function CustomerTrackingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="help-circle-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#94A3B8" />
          <Text style={styles.mapText}>Sơ đồ minh họa</Text>
        </View>

        <View style={styles.trackingCard}>
          <View style={styles.trackingHead}>
            <View>
              <View style={styles.badgeRow}>
                <Ionicons name="navigate-circle" size={16} color="#16A34A" />
                <Text style={styles.badgeText}>Đang trên đường</Text>
              </View>
              <Text style={styles.etaText}>12 phút nữa</Text>
              <Text style={styles.mutedText}>Dự kiến đến khoảng 09:03</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CustomerAIChat')}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="call" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.techInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#2563EB" />
            </View>
            <View style={styles.techDetails}>
              <Text style={styles.techName}>Nguyễn Đức Anh</Text>
              <Text style={styles.mutedText}>4.9/5 · 326 công việc · Đã xác minh</Text>
            </View>
            <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tiến độ dịch vụ</Text>
          <TouchableOpacity><Text style={styles.link}>Chi tiết đơn</Text></TouchableOpacity>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.dot, styles.dotDone]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Đã tiếp nhận yêu cầu</Text>
              <Text style={styles.timelineTime}>08:42</Text>
            </View>
          </View>
          <View style={styles.timelineLineDone} />

          <View style={styles.timelineItem}>
            <View style={[styles.dot, styles.dotDone]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Kỹ thuật viên đã nhận việc</Text>
              <Text style={styles.timelineTime}>08:46 · Nguyễn Đức Anh</Text>
            </View>
          </View>
          <View style={styles.timelineLineDone} />

          <View style={styles.timelineItem}>
            <View style={[styles.dot, styles.dotCurrent]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, {color: '#2563EB'}]}>Đang trên đường</Text>
              <Text style={styles.timelineTime}>08:51 · Dự kiến đến sau 12 phút</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.dot} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, {color: '#94A3B8'}]}>Kiểm tra & sửa chữa</Text>
              <Text style={styles.timelineTime}>Bắt đầu sau khi kỹ thuật viên đến nơi</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.dot} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, {color: '#94A3B8'}]}>Hoàn thành</Text>
              <Text style={styles.timelineTime}>Xác nhận kết quả và thanh toán</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Hủy / thay đổi lịch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerQuotation')}>
          <Text style={styles.primaryBtnText}>Xem báo giá kiểm tra</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  mapPlaceholder: { height: 260, backgroundColor: '#E2E8F0', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: -40, marginHorizontal: -16 },
  mapText: { marginTop: 8, color: '#64748B', fontSize: 14, fontWeight: '500' },
  trackingCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  trackingHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeText: { color: '#16A34A', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  etaText: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  mutedText: { fontSize: 12, color: '#64748B' },
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  techInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  techDetails: { flex: 1 },
  techName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  link: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  timeline: { marginBottom: 24, paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#E2E8F0', marginTop: 2, zIndex: 2 },
  dotDone: { borderColor: '#16A34A' },
  dotCurrent: { borderColor: '#2563EB', borderWidth: 5 },
  timelineContent: { marginLeft: 16, flex: 1, paddingBottom: 16 },
  timelineTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  timelineTime: { fontSize: 12, color: '#64748B' },
  timelineLine: { position: 'absolute', left: 15, width: 2, height: '100%', backgroundColor: '#E2E8F0', zIndex: 1 },
  timelineLineDone: { position: 'absolute', left: 15, width: 2, height: '100%', backgroundColor: '#16A34A', zIndex: 1 },
  dangerBtn: { backgroundColor: '#FEE2E2', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  dangerBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
