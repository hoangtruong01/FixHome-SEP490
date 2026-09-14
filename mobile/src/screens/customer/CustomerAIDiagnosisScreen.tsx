import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomerAIDiagnosisScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [analyzed, setAnalyzed] = useState(false);

  // Step 2 states
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [quantity, setQuantity] = useState(1);
  const [optionsExpanded, setOptionsExpanded] = useState(true);
  const [quoteExpanded, setQuoteExpanded] = useState(false);

  const handleAnalyze = () => {
    setAnalyzed(true);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigation.navigate('CustomerMatching');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.mainTitle}>Nhà mình đang gặp vấn đề gì?</Text>
      <Text style={styles.helperText}>Thêm mô tả để thợ chuẩn bị tốt hơn. Bạn có thể dùng ảnh để nhận gợi ý kiểm tra.</Text>

      <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
        <View style={styles.camIcon}>
          <Ionicons name="camera-outline" size={24} color="#2563EB" />
        </View>
        <Text style={styles.uploadTitle}>Thêm ảnh thiết bị</Text>
        <Text style={styles.uploadHelper}>Ảnh toàn cảnh và vị trí có vấn đề</Text>
        <Text style={styles.uploadHelper}>Tối đa 5 ảnh · JPG, PNG · 10 MB/ảnh</Text>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Mô tả nhu cầu <Text style={styles.inlineTag}>· không bắt buộc khi đặt lịch</Text></Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ví dụ: Điều hòa vẫn chạy nhưng không lạnh, có tiếng kêu nhẹ…"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Số lượng thiết bị</Text>
          <View style={styles.quantityBox}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Ionicons name="remove" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
              <Ionicons name="add" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!analyzed ? (
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleAnalyze} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>Phân tích sự cố bằng AI</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.aiResultCard}>
          <View style={styles.scoreRow}>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeTextSuccess}>Đã có gợi ý kiểm tra</Text>
            </View>
            <Text style={styles.inlineTag}>Kết quả mô phỏng</Text>
          </View>
          <Text style={styles.aiResultTitle}>Nên kiểm tra dàn lạnh và nguồn gas</Text>
          <Text style={styles.aiResultDesc}>Mô tả này có thể liên quan đến nhiều nguyên nhân. Thợ sẽ kiểm tra trực tiếp và báo giá trước khi sửa.</Text>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Chi phí tham khảo</Text>
            <Text style={styles.quoteValue}>150.000–450.000đ</Text>
          </View>
          <Text style={styles.aiResultNote}>Đây chưa phải báo giá. Không tự tháo thiết bị nếu bạn không có chuyên môn.</Text>
        </View>
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.mainTitle}>Thông tin lịch hẹn</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Địa chỉ sửa chữa</Text>
          <TouchableOpacity><Text style={styles.link}>Thay đổi</Text></TouchableOpacity>
        </View>
        <View style={styles.addressBox}>
          <Ionicons name="location" size={20} color="#2563EB" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.addressTitle}>Nhà riêng</Text>
            <Text style={styles.addressDesc}>28 Duy Tân, Cầu Giấy, Hà Nội</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Chọn ngày</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
          {[0,1,2,3].map(i => (
            <TouchableOpacity 
              key={i} 
              style={[styles.dateChip, selectedDate === i && styles.dateChipActive]}
              onPress={() => setSelectedDate(i)}
            >
              <Text style={[styles.dateText, selectedDate === i && styles.textActive]}>{i === 0 ? 'Hôm nay' : `Ngày ${i+1}`}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { marginTop: 16 }]}>Chọn giờ</Text>
        <View style={styles.timeGrid}>
          {['09:00', '10:00', '13:00', '14:00', '15:00', '16:00'].map(time => (
            <TouchableOpacity 
              key={time} 
              style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.textActive]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.summaryCard}>
        {/* Timeline Item 1 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeftIconBox}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#2563EB" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Vấn đề của bạn <Text style={styles.redAsterisk}>*</Text></Text>
            <Text style={styles.timelineValue}>Tình trạng: máy chạy yếu. Số lượng máy: {quantity} máy</Text>
          </View>
          <View style={styles.timelineRight}>
            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            <View style={styles.timelineLine} />
          </View>
        </View>

        {/* Timeline Item 2 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeftIconBox}>
            <Ionicons name="location" size={18} color="#3B82F6" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Địa chỉ làm việc</Text>
            <Text style={styles.timelineValueTitle}>17 Mai Chí Thọ Phường An Khánh,Thành phố Hồ Chí Minh</Text>
            <Text style={styles.timelineSubText}>Chạm để chỉnh sửa</Text>
          </View>
          <View style={styles.timelineRight}>
            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            <View style={styles.timelineLine} />
          </View>
        </View>

        {/* Timeline Item 3 */}
        <View style={[styles.timelineItem, { marginBottom: 0 }]}>
          <View style={styles.timelineLeftIconBox}>
            <Ionicons name="time" size={18} color="#3B82F6" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Thời gian</Text>
            <Text style={styles.timelineValueTitle}>{selectedTime} - 14/09/2026</Text>
          </View>
          <View style={styles.timelineRight}>
            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
          </View>
        </View>
      </View>

      <View style={styles.optionsCard}>
        <TouchableOpacity style={styles.optionsHeader} onPress={() => setOptionsExpanded(!optionsExpanded)} activeOpacity={0.7}>
          <View style={styles.optionsHeaderLeft}>
            <View style={styles.optionsIconBox}>
              <Ionicons name="albums" size={20} color="#60A5FA" />
            </View>
            <View>
              <Text style={styles.optionsTitle}>Tuỳ chọn</Text>
              <Text style={styles.optionsSub}>Ảnh, ghi chú, hoá đơn</Text>
            </View>
          </View>
          <Ionicons name={optionsExpanded ? "chevron-up" : "chevron-down"} size={20} color="#0F172A" />
        </TouchableOpacity>

        {optionsExpanded && (
          <View style={styles.optionsBody}>
            {/* Hình ảnh */}
            <View style={styles.optionSection}>
              <View style={styles.optionSectionHeader}>
                <View style={styles.optionsIconBoxSmall}>
                  <Ionicons name="image" size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.optionSectionTitle}>Hình ảnh</Text>
                  <Text style={styles.optionSectionSub}>Giúp thợ hiểu rõ hơn</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addImageBtn}>
                <Ionicons name="image" size={24} color="#93C5FD" />
                <Text style={styles.addImageText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {/* Ghi chú */}
            <TouchableOpacity style={styles.optionItemRow}>
              <View style={styles.optionsHeaderLeft}>
                <View style={styles.optionsIconBoxSmall}>
                  <Ionicons name="clipboard" size={16} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.optionSectionTitle}>Ghi chú <Text style={styles.optionSectionSub}>Tùy chọn</Text></Text>
                  <Text style={styles.optionSectionSub}>Thêm yêu cầu đặc biệt...</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* Ghi chú */}
            <TouchableOpacity style={styles.optionItemRow}>
              <View style={styles.optionsHeaderLeft}>
                <View style={styles.optionsIconBoxSmall}>
                  <Ionicons name="document-text" size={16} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.optionSectionTitle}>Xuất hóa đơn</Text>
                  <Text style={styles.optionSectionSub}>Yêu cầu xuất hóa đơn VAT</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={{height: 180}} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 3 ? 'Vệ sinh máy lạnh' : 'AI Hỗ trợ chẩn đoán'}</Text>
        {step === 1 ? (
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons name="robot-outline" size={14} color="#2563EB" />
            <Text style={styles.aiBadgeText}>AI 2.0</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step < 3 && (
          <View style={styles.progressWrap}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Bước {step} / 3</Text>
              <Text style={styles.progressLabel}>
                {step === 1 ? 'Mô tả nhu cầu' : 'Thời gian & địa chỉ'}
              </Text>
            </View>
            <View style={styles.steps}>
              <View style={[styles.dot, step >= 1 && styles.dotOn]} />
              <View style={[styles.dot, step >= 2 && styles.dotOn]} />
              <View style={[styles.dot, step >= 3 && styles.dotOn]} />
            </View>
          </View>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

      </ScrollView>

      {step < 3 ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={handleNextStep}>
            <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.bookBtnGradient}>
              <Text style={styles.bookBtnText}>
                {step === 1 ? 'Tiếp tục chọn lịch' : 'Tiếp tục'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          {step === 1 && <Text style={styles.ctaNote}>Ảnh và mô tả được đính kèm lịch hẹn</Text>}
        </View>
      ) : (
        <View style={styles.step3BottomBar}>
          <View style={styles.quoteCardWrapper}>
            <TouchableOpacity 
              style={styles.quoteHeader} 
              onPress={() => setQuoteExpanded(!quoteExpanded)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.quoteTitle}>Báo giá từ AI (tham khảo)</Text>
                <Text style={styles.quotePrice}>230,000 - 650,000đ</Text>
              </View>
              <Ionicons name={quoteExpanded ? "chevron-down" : "chevron-up"} size={20} color="#0F172A" />
            </TouchableOpacity>

            {quoteExpanded && (
              <View style={styles.quoteExpandedBody}>
                <View style={styles.quoteDivider} />
                <View style={styles.quoteRowItem}>
                  <Text style={styles.quoteLabelText}>Tiền công</Text>
                  <Text style={styles.quoteValueText}>150,000 - 400,000đ</Text>
                </View>
                <View style={styles.quoteRowItem}>
                  <Text style={styles.quoteLabelText}>Vật tư</Text>
                  <Text style={styles.quoteValueText}>80,000 - 250,000đ</Text>
                </View>
                
                <View style={styles.quoteMaterialsBox}>
                  <Text style={styles.quoteMaterialsTitle}>Có thể cần:</Text>
                  <View style={styles.quoteMaterialsTags}>
                    <View style={styles.quoteMaterialTag}><Text style={styles.quoteMaterialTagText} numberOfLines={1}>Dung dịch vệ sinh máy lạnh ch...</Text></View>
                    <View style={styles.quoteMaterialTag}><Text style={styles.quoteMaterialTagText} numberOfLines={1}>Nước rửa dàn lạnh/dàn n...</Text></View>
                  </View>
                </View>

                <View style={styles.quoteInfoRow}>
                  <Ionicons name="information-circle-outline" size={16} color="#64748B" />
                  <Text style={styles.quoteInfoText}>Vật tư có thể phát sinh thêm tùy tình trạng thực tế khi khảo sát.</Text>
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.startBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CustomerMatching')}>
            <Text style={styles.startBtnText}>Bắt đầu tìm thợ</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  aiBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 100 },
  progressWrap: { marginBottom: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  steps: { flexDirection: 'row', gap: 6 },
  dot: { height: 4, flex: 1, backgroundColor: '#E2E8F0', borderRadius: 2 },
  dotOn: { backgroundColor: '#2563EB' },
  mainTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  helperText: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 16 },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  camIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  uploadHelper: { fontSize: 12, color: '#64748B', marginTop: 4 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  inlineTag: { fontSize: 12, color: '#64748B', fontWeight: '400' },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top'
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  aiResultCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  badgeSuccess: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeTextSuccess: { color: '#16A34A', fontSize: 12, fontWeight: '700' },
  aiResultTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  aiResultDesc: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 12 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginBottom: 8 },
  quoteLabel: { fontSize: 14, color: '#64748B' },
  quoteValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  aiResultNote: { fontSize: 12, color: '#64748B', fontStyle: 'italic' },
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
  bookBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  bookBtnGradient: { paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  bookBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  ctaNote: { textAlign: 'center', fontSize: 12, color: '#64748B' },
  
  // Step 2 & 3 styles
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  link: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  addressTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  addressDesc: { fontSize: 12, color: '#64748B', marginTop: 4 },
  dateStrip: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  dateChip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  dateChipActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  dateText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, width: '31%', alignItems: 'center' },
  timeChipActive: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  timeText: { fontSize: 14, color: '#0F172A', fontWeight: '500' },
  textActive: { color: '#FFFFFF', fontWeight: '700' },
  quantityBox: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  
  serviceTitle: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  serviceName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748B' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#2563EB' },

  // Step 3 new styles
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  timelineItem: { flexDirection: 'row', marginBottom: 24, minHeight: 50 },
  timelineLeftIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: -2 },
  timelineContent: { flex: 1, paddingRight: 16 },
  timelineLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '500' },
  redAsterisk: { color: '#EF4444' },
  timelineValue: { fontSize: 14, color: '#334155', lineHeight: 22 },
  timelineValueTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 22 },
  timelineSubText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  timelineRight: { width: 24, alignItems: 'center' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#60A5FA', marginTop: 4, borderRadius: 1 },

  optionsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  optionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionsHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  optionsIconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionsTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  optionsSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  optionsBody: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  optionSection: { marginBottom: 20 },
  optionSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  optionsIconBoxSmall: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  optionSectionTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  optionSectionSub: { fontSize: 12, color: '#64748B', fontWeight: '400' },
  addImageBtn: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', marginLeft: 32 },
  addImageText: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
  optionItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingRight: 4 },

  step3BottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  quoteCardWrapper: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  quoteTitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  quotePrice: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  quoteExpandedBody: { padding: 20, paddingTop: 0 },
  quoteDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
  quoteRowItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  quoteLabelText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  quoteValueText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  quoteMaterialsBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginTop: 8 },
  quoteMaterialsTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  quoteMaterialsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quoteMaterialTag: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: '#E2E8F0', maxWidth: '100%' },
  quoteMaterialTagText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  quoteInfoRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignItems: 'flex-start' },
  quoteInfoText: { fontSize: 12, color: '#64748B', flex: 1, lineHeight: 18 },
  startBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
