// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store';
import { UserRole } from '../../types';
import { colors, spacing, fontSize } from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList & RootStackParamList>>();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('0909123123');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const handleLoginCustomer = () => {
    setAuth('mock-jwt-customer-token', {
      id: 'cust-01',
      email: 'lacvy@fixhome.vn',
      fullName: 'Lạc Vỹ',
      role: UserRole.CUSTOMER,
    });
    navigation.navigate('CustomerMain');
  };

  const handleLoginTechnician = () => {
    setAuth('mock-jwt-tech-token', {
      id: 'tech-01',
      email: 'thoviet@fixhome.vn',
      fullName: 'Nguyễn Văn Hùng (Thợ)',
      role: UserRole.TECHNICIAN,
    });
    navigation.navigate('TechnicianMain');
  };

  const handleContinueAsGuest = () => {
    navigation.navigate('CustomerMain');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={handleContinueAsGuest}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
        <Text style={styles.backText}>Về Trang chủ</Text>
      </TouchableOpacity>

      <Image
        source={require('../../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>FixHome</Text>
      <Text style={styles.subtitle}>Sửa Chữa & Bảo Trì Nhà Trọn Gói</Text>

      {/* Form Login Mockup */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Đăng nhập tài khoản</Text>

        {step === 1 ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Ví dụ: 0909123456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => {
                if (phone.length >= 9) setStep(2);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Tiếp tục</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã xác thực (OTP)</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                Mã OTP gồm 6 số đã được gửi đến số {phone}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="keypad-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Nhập mã 6 số"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLoginCustomer}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Xác nhận OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 16, alignItems: 'center' }}
              onPress={() => setStep(1)}
            >
              <Text style={{ color: '#64748B', fontSize: 13 }}>Đổi số điện thoại</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Quick Dev Switcher Buttons */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>HOẶC THỬ NGHIỆM VAI TRÒ</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={[styles.techLoginBtn, { backgroundColor: '#2563EB', marginBottom: 12 }]}
          onPress={handleLoginCustomer}
          activeOpacity={0.85}
        >
          <Ionicons name="person" size={16} color="#FFFFFF" />
          <Text style={styles.techLoginBtnText}>Vào vai Khách (Customer)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.techLoginBtn, { backgroundColor: '#0F172A' }]}
          onPress={handleLoginTechnician}
          activeOpacity={0.85}
        >
          <Ionicons name="construct" size={16} color="#FFFFFF" />
          <Text style={styles.techLoginBtnText}>Vào vai Thợ (Technician)</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.lg,
    paddingTop: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.xs,
    borderRadius: 20,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  registerText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },
  techLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 10,
  },
  techLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  guestBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  guestBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
});
