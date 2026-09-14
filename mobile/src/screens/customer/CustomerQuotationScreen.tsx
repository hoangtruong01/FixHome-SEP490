import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

export default function CustomerQuotationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo giá phát sinh</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Chờ bạn duyệt</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Kỹ thuật viên phát hiện tụ điện yếu. Không có công việc phát sinh nào được thực hiện trước khi bạn phê duyệt báo giá.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Báo giá #QT-8821</Text>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Vệ sinh điều hòa</Text>
            <Text style={styles.quoteValue}>150.000đ</Text>
          </View>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Thay tụ 35µF</Text>
            <Text style={styles.quoteValue}>180.000đ</Text>
          </View>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Công thay thế</Text>
            <Text style={styles.quoteValue}>70.000đ</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.quoteRowTotal}>
            <Text style={styles.totalLabel}>Tổng mới</Text>
            <Text style={styles.totalValue}>400.000đ</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bằng chứng kỹ thuật</Text>
        <View style={styles.evidenceRow}>
          <View style={styles.evidenceBox}>
            <Ionicons name="camera" size={24} color="#2563EB" />
          </View>
          <View style={styles.evidenceBox}>
            <Ionicons name="camera" size={24} color="#2563EB" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ghi chú kỹ thuật viên</Text>
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>Tụ hiện tại đo được thấp hơn mức cho phép, có dấu hiệu làm block khó khởi động. Khuyến nghị thay để tránh lỗi tái diễn.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerUnderRepair')}>
            <Text style={styles.primaryBtnText}>Duyệt 250.000đ</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  badge: { backgroundColor: '#FEF9C3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#A16207', fontSize: 10, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 100 },
  noticeBox: { backgroundColor: '#FEF9C3', padding: 16, borderRadius: 12, marginBottom: 16 },
  noticeText: { color: '#854D0E', fontSize: 13, lineHeight: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  quoteLabel: { fontSize: 14, color: '#64748B' },
  quoteValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  quoteRowTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#2563EB' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  evidenceRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  evidenceBox: { flex: 1, height: 100, backgroundColor: '#E2E8F0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed' },
  noteCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  noteText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  btnRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '700' },
  primaryBtn: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }
});
