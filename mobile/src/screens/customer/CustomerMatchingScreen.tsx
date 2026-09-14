import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

const TECHNICIANS = [
  {
    id: '1',
    name: 'TRƯƠNG VĂN THẮNG',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 4.9,
    jobs: 209,
    completionRate: '100%',
    distance: '10.9 km',
    price: '230,000đ',
  },
  {
    id: '2',
    name: 'PHẠM HỒNG LÂM',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5.0,
    jobs: 8,
    completionRate: '100%',
    distance: '9.1 km',
    price: '230,000đ',
  },
  {
    id: '3',
    name: 'TÔ MINH LONG',
    avatar: 'https://i.pravatar.cc/150?img=13',
    rating: 4.4,
    jobs: 184,
    completionRate: '66%',
    distance: '10.4 km',
    price: '230,000đ',
  },
];

export default function CustomerMatchingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isFinding, setIsFinding] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Simple pulse animation for radar
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (isFinding) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Mock finding technician after 3 seconds
      const timer = setTimeout(() => {
        setIsFinding(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isFinding, pulseAnim]);

  if (!isFinding) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {/* Fake Map */}
        <Image 
          source={{uri: 'https://img.freepik.com/premium-vector/city-map-any-kind-digital-info-graphics-web-element-flat-map-with-pin-pointers_306734-712.jpg'}} 
          style={StyleSheet.absoluteFill} 
          resizeMode="cover"
        />
        
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.foundHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnCircle}>
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.foundHeaderCenter}>
              <Text style={styles.foundHeaderTitle}>Vệ sinh máy lạnh</Text>
              <Text style={styles.foundHeaderSub}>#00208496</Text>
            </View>
            <View style={styles.foundHeaderRight}>
               <TouchableOpacity style={styles.iconCircleBtn}>
                 <Ionicons name="receipt-outline" size={20} color="#0F172A" />
               </TouchableOpacity>
               <TouchableOpacity style={[styles.iconCircleBtn, {marginLeft: 8}]}>
                 <Ionicons name="headset-outline" size={20} color="#0F172A" />
                 <View style={styles.notiBadge}><Text style={styles.notiBadgeText}>1</Text></View>
               </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <View style={[styles.bottomSheet, { flex: isExpanded ? 3.5 : 1 }]}>
            <TouchableOpacity style={styles.dragHandleWrap} activeOpacity={0.8} onPress={() => setIsExpanded(!isExpanded)}>
              <View style={styles.dragHandle} />
            </TouchableOpacity>
            
            <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 40}} showsVerticalScrollIndicator={false}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <View style={styles.greenDot} />
                <Text style={styles.sheetTitle}>3 thợ báo giá</Text>
              </View>
              <Text style={styles.expectedCostLabel}>Chi phí dự kiến</Text>
              <Text style={styles.expectedCostValue}>230,000 - 650,000đ</Text>
              <Text style={styles.expectedCostNote}>Khoảng giá tham khảo - Thợ sẽ đến khảo sát và chốt giá</Text>
              
              <View style={styles.warrantyRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6}}>
                  <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
                  <Text style={styles.warrantyText}>Bảo hành bởi Vua Thợ</Text>
                </View>
                <Text style={styles.feeText}>Phí 6% giá trị đơn</Text>
              </View>

              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6}}>
                <Ionicons name="people" size={18} color="#2563EB" />
                <Text style={styles.listTitle}>Danh sách thợ giỏi</Text>
              </View>

              {TECHNICIANS.map((tech) => (
                <View key={tech.id} style={styles.techCard}>
                  <View style={styles.techTop}>
                    <Image source={{uri: tech.avatar}} style={styles.techAvatar} />
                    <View style={styles.techInfo}>
                      <Text style={styles.techName} numberOfLines={1}>{tech.name}</Text>
                      <View style={styles.techStats}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.techStatText}>{tech.rating} · {tech.jobs} đơn · {tech.completionRate}</Text>
                      </View>
                    </View>
                    <View style={styles.techRight}>
                      <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={12} color="#2563EB" />
                        <Text style={styles.distanceText}>{tech.distance}</Text>
                      </View>
                      <TouchableOpacity style={styles.chatBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#0F172A" />
                        <Text style={styles.chatBtnText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <LinearGradient colors={['#FFFFFF', '#EFF6FF']} style={styles.techActionArea} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                    <View>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                        <Ionicons name="pricetag-outline" size={12} color="#64748B" />
                        <Text style={styles.techPriceLabel}>Giá dự kiến</Text>
                      </View>
                      <Text style={styles.techPriceValue}>{tech.price}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewTechBtn} onPress={() => navigation.navigate('CustomerTechFound')}>
                      <Ionicons name="person-circle-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.viewTechBtnText}>Xem thông tin thợ</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đang tìm kỹ thuật viên</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Đang tìm</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#94A3B8" />
          <Text style={styles.mapText}>Sơ đồ minh họa</Text>
        </View>

        <View style={styles.matchStage}>
          <Animated.View style={[styles.radarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.radarInner}>
              <MaterialIcons name="radar" size={32} color="#2563EB" />
            </View>
          </Animated.View>
          <Text style={styles.matchTitle}>Đang tìm thợ phù hợp gần bạn</Text>
          <Text style={styles.matchDesc}>FixHome ưu tiên kỹ thuật viên đã xác minh, đúng chuyên môn và có thể đến trong khung giờ bạn chọn.</Text>
          
          <View style={styles.pointsRow}>
            <View style={styles.pointItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.pointText}>Đã xác minh</Text>
            </View>
            <View style={styles.pointItem}>
              <Ionicons name="build" size={16} color="#16A34A" />
              <Text style={styles.pointText}>Đúng chuyên môn</Text>
            </View>
            <View style={styles.pointItem}>
              <Ionicons name="location" size={16} color="#16A34A" />
              <Text style={styles.pointText}>Ở gần bạn</Text>
            </View>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            <Text style={{ fontWeight: '700' }}>Nếu chưa có thợ nhận ngay</Text>, FixHome sẽ tiếp tục tìm ứng viên khác và thông báo cho bạn. Bạn không cần thao tác lại.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerMain')}>
          <Text style={styles.primaryBtnText}>Hủy tìm kiếm</Text>
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },
  badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  content: { padding: 16, flex: 1 },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  mapText: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  matchStage: {
    alignItems: 'center',
    marginBottom: 24,
  },
  radarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  radarInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  matchDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  noticeBox: {
    backgroundColor: '#FEF9C3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  noticeText: {
    color: '#854D0E',
    fontSize: 13,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Found State Styles
  foundHeader: { flexDirection: 'row', padding: 16, alignItems: 'center', marginTop: Platform.OS === 'android' ? 24 : 0 },
  backBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  foundHeaderCenter: { flex: 1, marginLeft: 16, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  foundHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  foundHeaderSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  foundHeaderRight: { flexDirection: 'row', marginLeft: 16 },
  iconCircleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  notiBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  notiBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  bottomSheet: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 3.5, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  dragHandleWrap: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  expectedCostLabel: { fontSize: 14, color: '#64748B', marginTop: 12 },
  expectedCostValue: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginVertical: 4 },
  expectedCostNote: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  warrantyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 16 },
  warrantyText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  feeText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  techCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  techTop: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  techAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  techInfo: { flex: 1 },
  techName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 6, textTransform: 'uppercase' },
  techStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  techStatText: { fontSize: 12, color: '#64748B' },
  techRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 56 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F1F5F9', borderRadius: 100 },
  chatBtnText: { fontSize: 12, color: '#0F172A', fontWeight: '600' },
  techActionArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  techPriceLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  techPriceValue: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  viewTechBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 100, shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width:0, height: 4}, elevation: 4 },
  viewTechBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }
});
