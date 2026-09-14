import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store';
import { useScrollHideTabBar } from '../../hooks/useScrollHideTabBar';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { LinearGradient } from 'expo-linear-gradient';

interface Address {
  id: string;
  name: string;
  detail: string;
}

export default function CustomerProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handleScroll = useScrollHideTabBar();
  
  // States for user info
  const [name, setName] = useState('Trần Minh');
  const [email, setEmail] = useState('minh.tran@gmail.com');
  const [phone, setPhone] = useState('0909123123');
  
  // State for theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // States for addresses
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', name: 'Nhà riêng', detail: '28 Duy Tân, Cầu Giấy, Hà Nội' },
    { id: '2', name: 'Văn phòng', detail: '16 Phạm Hùng, Nam Từ Liêm, Hà Nội' },
  ]);

  // Modals visibility
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);

  // Temp states for editing profile
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);

  // Temp states for adding/editing address
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [addressName, setAddressName] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  const handleSaveProfile = () => {
    setName(editName);
    setEmail(editEmail);
    setPhone(editPhone);
    setProfileModalVisible(false);
    Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
  };

  const handleSaveAddress = () => {
    if (!addressName || !addressDetail) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin địa chỉ.');
      return;
    }

    if (editAddressId) {
      setAddresses(addresses.map(a => a.id === editAddressId ? { ...a, name: addressName, detail: addressDetail } : a));
    } else {
      setAddresses([...addresses, { id: Date.now().toString(), name: addressName, detail: addressDetail }]);
    }
    
    setAddressName('');
    setAddressDetail('');
    setEditAddressId(null);
  };

  const handleEditAddress = (addr: Address) => {
    setEditAddressId(addr.id);
    setAddressName(addr.name);
    setAddressDetail(addr.detail);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

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

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ProfileHeader 
          name={name} 
          phone={phone} 
          avatarText={name.charAt(0)} 
          isDarkMode={isDarkMode} 
        />

        <View style={styles.scrollContent}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Ví & Điểm thưởng</Text>
          <View style={styles.overviewRow}>
            <LinearGradient colors={['#E0F2FE', '#F0F9FF']} style={styles.overviewCard}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#BAE6FD' }]}>
                  <Ionicons name="wallet" size={16} color="#0284C7" />
                </View>
                <Text style={styles.cardLabel}>Số dư</Text>
              </View>
              <Text style={styles.cardValue}>0 <Text style={styles.cardUnit}>đ</Text></Text>
            </LinearGradient>

            <LinearGradient colors={['#FEF3C7', '#FFFBEB']} style={styles.overviewCard}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#FDE68A' }]}>
                  <Ionicons name="gift" size={16} color="#D97706" />
                </View>
                <Text style={styles.cardLabel}>F-Point</Text>
              </View>
              <Text style={styles.cardValue}>0 <Text style={styles.cardUnit}>điểm</Text></Text>
            </LinearGradient>
          </View>

        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Quản lý tài khoản</Text>

        <View style={[styles.menuContainer, isDarkMode && styles.cardDark]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {
            setEditName(name); setEditEmail(email); setEditPhone(phone);
            setProfileModalVisible(true);
          }}>
            <Ionicons name="person-outline" size={22} color="#64748B" style={styles.menuIcon} />
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>Thông tin cá nhân</Text>
              <Text style={styles.menuDesc}>Họ tên, avatar, số điện thoại</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => setAddressModalVisible(true)}>
            <Ionicons name="location-outline" size={22} color="#64748B" style={styles.menuIcon} />
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>Địa chỉ sửa chữa</Text>
              <Text style={styles.menuDesc}>{addresses.length} địa chỉ đã lưu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Tính năng đang phát triển')}>
            <Ionicons name="card-outline" size={22} color="#64748B" style={styles.menuIcon} />
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>Phương thức thanh toán</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Tính năng đang phát triển')}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#64748B" style={styles.menuIcon} />
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>Bảo mật & phiên đăng nhập</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Tùy chọn</Text>
        <View style={[styles.menuContainer, isDarkMode && styles.cardDark]}>
          <View style={styles.menuItem}>
            <Ionicons name="moon-outline" size={22} color="#64748B" style={styles.menuIcon} />
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>Giao diện tối</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal visible={isProfileModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDarkMode && styles.cardDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Chỉnh sửa thông tin</Text>
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} placeholder="Họ và tên" placeholderTextColor="#94A3B8" value={editName} onChangeText={setEditName} />
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} placeholder="Email" placeholderTextColor="#94A3B8" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} placeholder="Số điện thoại" placeholderTextColor="#94A3B8" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Address Edit Modal */}
      <Modal visible={isAddressModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDarkMode && styles.cardDark, { maxHeight: '80%' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Quản lý địa chỉ</Text>
            <ScrollView style={{ width: '100%', marginBottom: 16 }}>
              {addresses.map(addr => (
                <View key={addr.id} style={[styles.addressItem, isDarkMode && styles.inputDark]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addressName, isDarkMode && styles.textDark]}>{addr.name}</Text>
                    <Text style={styles.addressDetail}>{addr.detail}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleEditAddress(addr)} style={styles.iconBtn}>
                    <Ionicons name="pencil" size={20} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)} style={styles.iconBtn}>
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark, { alignSelf: 'flex-start' }]}>
              {editAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Text>
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} placeholder="Tên gợi nhớ (VD: Nhà riêng)" placeholderTextColor="#94A3B8" value={addressName} onChangeText={setAddressName} />
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} placeholder="Địa chỉ chi tiết" placeholderTextColor="#94A3B8" value={addressDetail} onChangeText={setAddressDetail} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddressModalVisible(false); setEditAddressId(null); setAddressName(''); setAddressDetail(''); }}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
                <Text style={styles.saveBtnText}>{editAddressId ? 'Cập nhật' : 'Thêm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 16 },
  cardDark: { backgroundColor: '#1E293B' },
  identityInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  textDark: { color: '#F8FAFC' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  menuIcon: { marginRight: 16 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  menuDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 54 },
  footer: { alignItems: 'center', marginTop: 12, marginBottom: 32 },
  logoutBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 },
  modalContent: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  input: { width: '100%', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A', marginBottom: 12 },
  inputDark: { backgroundColor: '#334155', color: '#F8FAFC' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 8, gap: 12 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#F1F5F9' },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  saveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#2563EB' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  addressItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 8 },
  addressName: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  addressDetail: { fontSize: 12, color: '#64748B' },
  iconBtn: { padding: 8, marginLeft: 4 },
  overviewRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  overviewCard: { flex: 1, borderRadius: 16, padding: 16 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  cardLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },
  cardValue: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  cardUnit: { fontSize: 14, fontWeight: '600', color: '#64748B' },
});
