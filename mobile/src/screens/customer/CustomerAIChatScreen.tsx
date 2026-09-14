import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function CustomerAIChatScreen() {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Chào bạn, mình là trợ lý AI FixHome. Mình có thể giúp gì cho bạn?', isUser: false },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Mock AI response
    setTimeout(() => {
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: 'Cảm ơn bạn đã liên hệ. Đây là tin nhắn tự động từ trợ lý AI. Vui lòng cho biết thêm chi tiết để mình có thể hỗ trợ tốt hơn!', 
        isUser: false 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgContainer, item.isUser ? styles.msgUser : styles.msgAI]}>
      <Text style={[styles.msgText, item.isUser ? styles.msgTextUser : styles.msgTextAI]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý FixHome</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TRỰC TUYẾN</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.7}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoid: { flex: 1 },
  chatContent: { padding: 16 },
  msgContainer: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  msgAI: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderBottomLeftRadius: 4,
  },
  msgUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextAI: { color: '#0F172A' },
  msgTextUser: { color: '#FFFFFF' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
    marginRight: 12,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
