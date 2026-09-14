import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

export default function CustomerUnderRepairScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đang sửa chữa</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Đang sửa chữa</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="build" size={14} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>Đang thực hiện</Text>
          </View>
          <Text style={styles.heroTitle}>Kỹ thuật viên đang xử lý</Text>
          <Text style={styles.heroDesc}>Phạm vi đã duyệt: vệ sinh điều hòa + thay tụ 35µF.</Text>
        </View>

        <Text style={styles.sectionTitle}>Các bước công việc</Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Kiểm tra ban đầu</Text>
              <Text style={styles.listTime}>Hoàn tất 09:24</Text>
            </View>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Vệ sinh dàn lạnh</Text>
              <Text style={styles.listTime}>Hoàn tất 09:41</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.listItem}>
            <Ionicons name="hourglass-outline" size={24} color="#EAB308" />
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Thay tụ 35µF</Text>
              <Text style={styles.listTime}>Đang thực hiện</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Hình ảnh đang cập nhật</Text>
        <View style={styles.evidenceRow}>
          <View style={styles.evidenceBox}>
            <Ionicons name="camera" size={24} color="#2563EB" />
          </View>
          <View style={styles.evidenceBox}>
            <Ionicons name="camera" size={24} color="#2563EB" />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerCompleted')}>
          <Text style={styles.primaryBtnText}>Xem kết quả hoàn tất</Text>
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  badge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  content: { padding: 16 },
  heroCard: { backgroundColor: '#DBEAFE', borderRadius: 16, padding: 20, marginBottom: 24 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  heroBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  heroDesc: { fontSize: 14, color: '#475569', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  list: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  listItem: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  listContent: { marginLeft: 12, flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  listTime: { fontSize: 12, color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 52 },
  evidenceRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  evidenceBox: { flex: 1, height: 100, backgroundColor: '#E2E8F0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed' },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
