import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

interface ServiceItem {
  id: string;
  name: string;
  iconName: string;
  iconType: 'ionic' | 'material' | 'fa5';
  iconColor: string;
  pedestalColor: string;
  imageSource?: any;
}

const ALL_SERVICES: ServiceItem[] = [
  { id: '1', name: 'Vệ sinh máy lạnh', iconName: 'snowflake', iconType: 'fa5', iconColor: '#0284C7', pedestalColor: '#E0F2FE', imageSource: require('../../../assets/air-conditioner.png') },
  { id: '2', name: 'Sửa ống nước', iconName: 'pipe-wrench', iconType: 'material', iconColor: '#0D9488', pedestalColor: '#CCFBF1', imageSource: require('../../../assets/water-pipeline.png') },
  { id: '3', name: 'Lắp đặt hệ thống điện', iconName: 'bolt', iconType: 'fa5', iconColor: '#EAB308', pedestalColor: '#FEF9C3',imageSource: require('../../../assets/voltage-cabinet.png') },
  { id: '4', name: 'Thông nghẹt cống', iconName: 'water-pump', iconType: 'material', iconColor: '#4F46E5', pedestalColor: '#E0E7FF',imageSource: require('../../../assets/unclogging-drains.png') },
  { id: '5', name: 'Sửa Tivi', iconName: 'air-conditioner', iconType: 'material', iconColor: '#2563EB', pedestalColor: '#DBEAFE',imageSource: require('../../../assets/tv-repair.png')  },
  { id: '6', name: 'Điện tử gia dụng', iconName: 'tools', iconType: 'fa5', iconColor: '#059669', pedestalColor: '#D1FAE5',imageSource: require('../../../assets/home-appliance-repair.png') },
  { id: '7', name: 'Sửa máy giặt', iconName: 'washing-machine', iconType: 'material', iconColor: '#7C3AED', pedestalColor: '#EDE9FE', imageSource: require('../../../assets/washing-machine.png') },
  { id: '8', name: 'Sửa tủ lạnh', iconName: 'fridge-outline', iconType: 'material', iconColor: '#EA580C', pedestalColor: '#FFEDD5', imageSource: require('../../../assets/refrigerator.png') },
];

export default function CustomerServicesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CustomerServices'>>();
  const initialQuery = route.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredServices = ALL_SERVICES.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderServiceIcon = (item: ServiceItem) => {
    if (item.imageSource) {
      return (
        <Image 
          source={item.imageSource} 
          style={{ width: 80, height: 80   }} 
          resizeMode="contain" 
        />
      );
    }
    if (item.iconType === 'fa5') {
      return <FontAwesome5 name={item.iconName} size={24} color={item.iconColor} />;
    }
    if (item.iconType === 'material') {
      return <MaterialCommunityIcons name={item.iconName as any} size={24} color={item.iconColor} />;
    }
    return <Ionicons name={item.iconName as any} size={24} color={item.iconColor} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.itemCard}
            onPress={() => navigation.navigate('CustomerServiceDetail')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.pedestalColor }]}>
              {renderServiceIcon(item)}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  }
});
