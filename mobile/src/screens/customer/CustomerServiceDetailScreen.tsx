import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomerServiceDetailScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="snowflake" size={40} color="#0284C7" />
          </View>
          <Text style={styles.serviceTitle}>Vệ sinh máy lạnh</Text>
          <Text style={styles.servicePrice}>Từ 150.000đ</Text>
        </View>

        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Mô tả dịch vụ</Text>
          <Text style={styles.descText}>
            Dịch vụ vệ sinh máy lạnh chuyên nghiệp, sạch bong sáng bóng. Thợ sẽ có mặt sau 15 phút đặt lịch, bảo hành chảy nước 30 ngày.
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Cam kết của chúng tôi</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="time-outline" size={20} color="#059669" />
            <Text style={styles.benefitText}>Có mặt nhanh chóng trong 15-30 phút</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="pricetag-outline" size={20} color="#059669" />
            <Text style={styles.benefitText}>Báo giá minh bạch trước khi làm</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
            <Text style={styles.benefitText}>Bảo hành 30 ngày</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CustomerAIDiagnosis')}>
          <LinearGradient
            colors={['#1D4ED8', '#2563EB']}
            style={styles.bookBtnGradient}
          >
            <Text style={styles.bookBtnText}>Đặt thợ ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  content: { padding: 16, paddingBottom: 100 },
  heroSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  descSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  descText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  benefitsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#334155',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bookBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
