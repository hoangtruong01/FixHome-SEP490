import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { UserRole } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileHeader } from '../../components/profile/ProfileHeader';

export default function TechnicianProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { user, setAuth } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
      Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => {
          logout();
          setTimeout(() => {
            navigation.navigate('Auth');
          }, 100);
        }},
      ]);
    };

  const handleSwitchToCustomer = () => {
    setAuth('mock-customer-token', {
      id: 'cust-01',
      email: 'lacvy@fixhome.vn',
      fullName: 'Lạc Vỹ',
      role: UserRole.CUSTOMER,
    });
    navigation.navigate('CustomerMain');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <ProfileHeader 
          name={user?.fullName || 'Lạc Vỹ'} 
          phone={'+841234567890'} 
          avatarText={(user?.fullName || 'L').charAt(0)} 
        />

        <View style={styles.innerContent}>
          {/* Chuyển sang Khách hàng */}
          <TouchableOpacity 
            style={[styles.switchRoleCard, { marginBottom: 16 }]} 
            onPress={handleSwitchToCustomer}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.switchGradient}
            >
              <View style={styles.switchIcon}>
                <Ionicons name="person" size={16} color="#D97706" />
              </View>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Chuyển sang Khách hàng</Text>
                <Text style={styles.switchDesc}>Đặt dịch vụ sửa chữa cho ngôi nhà của bạn</Text>
              </View>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={16} color="#B45309" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Số dư */}
          <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={20} color="#2563EB" />
          <Text style={styles.balanceTitle}>Số dư</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <Ionicons name="folder-open" size={16} color="#2563EB" />
              <Text style={styles.balanceLabel}>Số dư doanh thu</Text>
            </View>
            <Text style={styles.balanceValue}>0đ</Text>
          </View>

          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <Ionicons name="cash" size={16} color="#EAB308" />
              <Text style={styles.balanceLabel}>Số dư nền tảng</Text>
            </View>
            <Text style={styles.balanceValue}>0đ</Text>
          </View>
        </View>

        {/* Nghiệp vụ / Đồng phục */}
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard}>
            <Ionicons name="book" size={20} color="#2563EB" />
            <Text style={styles.toolText}>Nghiệp vụ</Text>
          </TouchableOpacity>
        </View>

        {/* CÀI ĐẶT */}
        <Text style={styles.sectionHeading}>CÀI ĐẶT</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="settings-outline" size={20} color="#64748B" />
            <Text style={styles.listText}>Cài đặt</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="globe-outline" size={20} color="#64748B" />
            <Text style={styles.listText}>Ngôn ngữ</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* HỖ TRỢ */}
        <Text style={styles.sectionHeading}>HỖ TRỢ</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="headset-outline" size={20} color="#64748B" />
            <Text style={styles.listText}>Hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="chatbubbles-outline" size={20} color="#64748B" />
            <Text style={styles.listText}>Những câu hỏi thường gặp (FAQ)</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            <Text style={styles.listText}>Về chúng tôi</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
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
    paddingBottom: 40,
  },
  innerContent: {
    paddingHorizontal: 16,
  },
  switchRoleCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  switchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  switchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  promoBanner: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  promoIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoLabel: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  hotBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  whiteArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 48,
  },
  logoutBtn: {
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
