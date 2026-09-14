"use no memo";
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  Extrapolation,
  runOnJS,
  SharedValue,
  withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUIStore } from '../../store/ui.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MARGIN_HORIZONTAL = 16;
const GAP = 12;
const ACTION_CIRCLE_SIZE = 64;
const PILL_WIDTH = SCREEN_WIDTH - (MARGIN_HORIZONTAL * 2) - GAP - ACTION_CIRCLE_SIZE;

// Sub-component for Icon Color Interpolation
const AnimatedTabIcon = ({ 
  index, 
  translateX, 
  tabWidth, 
  options 
}: { 
  index: number; 
  translateX: SharedValue<number>; 
  tabWidth: number; 
  options: any; 
}) => {
  const whiteOpacityStyle = useAnimatedStyle(() => {
    // Distance from the indicator's center to this tab's center
    const indicatorCenter = translateX.value + tabWidth / 2;
    const tabCenter = (index * tabWidth) + tabWidth / 2;
    const distance = Math.abs(indicatorCenter - tabCenter);
    
    // When distance is 0, opacity is 1 (fully white). Fades to 0 quickly as it moves away.
    const opacity = interpolate(distance, [0, tabWidth / 1.2], [1, 0], Extrapolation.CLAMP);
    return { opacity, position: 'absolute' };
  });

  const grayOpacityStyle = useAnimatedStyle(() => {
    const indicatorCenter = translateX.value + tabWidth / 2;
    const tabCenter = (index * tabWidth) + tabWidth / 2;
    const distance = Math.abs(indicatorCenter - tabCenter);
    
    // When distance is 0, gray is hidden (0). When far, gray is visible (1).
    const opacity = interpolate(distance, [0, tabWidth / 1.2], [0, 1], Extrapolation.CLAMP);
    return { opacity, position: 'absolute' };
  });

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={grayOpacityStyle}>
        {options.tabBarIcon ? options.tabBarIcon({ focused: false, color: '#7A879E', size: 26 }) : null}
      </Animated.View>
      <Animated.View style={whiteOpacityStyle}>
        {options.tabBarIcon ? options.tabBarIcon({ focused: true, color: '#FFFFFF', size: 26 }) : null}
      </Animated.View>
      {options.tabBarBadge !== undefined && (
        <View style={styles.badge} />
      )}
    </View>
  );
};

// Hook tùy chỉnh để đồng bộ state từ React Navigation vào Reanimated SharedValue
// Việc tách hook này giúp vượt qua cơ chế kiểm tra gắt gao của React Compiler (tránh lỗi "This value cannot be modified")
function useSyncTabState(
  currentIndex: number, 
  tabWidth: number, 
  translateX: SharedValue<number>, 
  activeIndex: SharedValue<number>
) {
  useEffect(() => {
    if (activeIndex.value !== currentIndex) {
      activeIndex.value = currentIndex;
      translateX.value = withSpring(currentIndex * tabWidth, { damping: 14, stiffness: 130, mass: 0.8 });
    }
  }, [currentIndex, tabWidth, activeIndex, translateX]);
}

export const GlassTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const tabCount = state.routes.length;
  const tabWidth = PILL_WIDTH / tabCount;

  // Shared Values cho Liquid Glass Physics
  const translateX = useSharedValue(state.index * tabWidth);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const activeIndex = useSharedValue(state.index);
  const isTabBarVisible = useUIStore((state) => state.isTabBarVisible);

  // Sync back to navigation state if changed from outside
  useSyncTabState(state.index, tabWidth, translateX, activeIndex);

  const triggerHaptic = () => {
    Haptics.selectionAsync();
  };

  const navigateToTab = (index: number) => {
    const route = state.routes[index];
    const isFocused = state.index === index;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  // Fluid Drag & Tap Gesture Arena
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const targetIndex = Math.floor(event.x / tabWidth);
      const clampedIndex = Math.max(0, Math.min(targetIndex, tabCount - 1));

      translateX.value = withSpring(clampedIndex * tabWidth, { damping: 12, stiffness: 150, mass: 0.8 });
      scaleX.value = withSpring(1, { damping: 12, stiffness: 150 });
      scaleY.value = withSpring(1, { damping: 12, stiffness: 150 });

      if (clampedIndex !== activeIndex.value) {
        activeIndex.value = clampedIndex;
        runOnJS(triggerHaptic)();
      }
      runOnJS(navigateToTab)(clampedIndex);
    });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Morph/Expand - Surface tension break
      scaleX.value = withSpring(1.15, { damping: 12, stiffness: 200 });
      scaleY.value = withSpring(1.15, { damping: 12, stiffness: 200 });
    })
    .onUpdate((event) => {
      // 1. Follow finger
      const newX = event.x - (tabWidth / 2);
      const maxTranslateX = PILL_WIDTH - tabWidth;
      translateX.value = Math.max(0, Math.min(newX, maxTranslateX));

      // 2. Liquid Stretch (Velocity based)
      const velocityStretch = interpolate(
        Math.abs(event.velocityX),
        [0, 1500],
        [1, 1.4],
        Extrapolation.CLAMP
      );
      scaleX.value = withSpring(velocityStretch, { damping: 15, stiffness: 200 });

      // 3. Liquid Squish (Metaball volume maintenance)
      const velocitySquish = interpolate(
        Math.abs(event.velocityX),
        [0, 1500],
        [1, 0.85],
        Extrapolation.CLAMP
      );
      scaleY.value = withSpring(velocitySquish, { damping: 15, stiffness: 200 });

      // 4. Haptic Feedback on crossing boundaries
      const currentIndex = Math.round(translateX.value / tabWidth);
      if (currentIndex !== activeIndex.value) {
        activeIndex.value = currentIndex;
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd((event) => {
      // 1. Determine final target based on finger release position
      const targetIndex = Math.floor(event.x / tabWidth);
      const clampedIndex = Math.max(0, Math.min(targetIndex, tabCount - 1));

      // 2. Snap to position with wobble physics
      translateX.value = withSpring(clampedIndex * tabWidth, { damping: 12, stiffness: 150, mass: 0.8 });
      scaleX.value = withSpring(1, { damping: 12, stiffness: 150 });
      scaleY.value = withSpring(1, { damping: 12, stiffness: 150 });

      // 3. Update state and navigate
      if (clampedIndex !== activeIndex.value) {
        activeIndex.value = clampedIndex;
        runOnJS(triggerHaptic)();
      }
      runOnJS(navigateToTab)(clampedIndex);
    })
    .onFinalize(() => {
      // Failsafe reset
      scaleX.value = withSpring(1);
      scaleY.value = withSpring(1);
    });

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
      ],
    };
  });

  const animatedWrapperStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isTabBarVisible ? 0 : 150, { duration: 300 }) }
      ],
    };
  });

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <Animated.View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }, animatedWrapperStyle]}>
      
      {/* 1. KHỐI MAIN PILL */}
      <GestureDetector gesture={composedGesture}>
        <View style={styles.mainPillContainer}>
          <BlurView intensity={70} tint="light" style={styles.mainPill}>
            
            {/* Liquid Glass Indicator */}
            <Animated.View style={[styles.activeIndicator, { width: tabWidth }, animatedIndicatorStyle]}>
               <LinearGradient
                 colors={['#00E5FF', '#0097A7']}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
                 style={styles.indicatorGradient}
               />
            </Animated.View>

            {/* Hàng Icon Overlay */}
            <View style={styles.iconsRow} pointerEvents="none">
              {state.routes.map((route, index) => (
                <View key={route.key} style={styles.tabSlot}>
                  <AnimatedTabIcon 
                    index={index} 
                    translateX={translateX} 
                    tabWidth={tabWidth} 
                    options={descriptors[route.key].options} 
                  />
                </View>
              ))}
            </View>
          </BlurView>
        </View>
      </GestureDetector>

      {/* 2. KHỐI ACTION CIRCLE */}
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('CustomerAIChat')}>
        <View style={styles.actionCircleContainer}>
          <BlurView intensity={70} tint="light" style={styles.actionCircle}>
            <FontAwesome5 name="robot" size={24} color="#00E5FF" />
          </BlurView>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MARGIN_HORIZONTAL,
    gap: GAP,
    backgroundColor: 'transparent',
  },
  mainPillContainer: {
    width: PILL_WIDTH,
    height: 64,
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  mainPill: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeIndicator: {
    position: 'absolute',
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6, // creates a margin inside for the liquid pill
  },
  indicatorGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  iconsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 2,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3D00',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  actionCircleContainer: {
    width: ACTION_CIRCLE_SIZE,
    height: ACTION_CIRCLE_SIZE,
    borderRadius: ACTION_CIRCLE_SIZE / 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  actionCircle: {
    flex: 1,
    borderRadius: ACTION_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  gridIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 13,
  },
  gridBox: {
    width: 13,
    height: 13,
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    left: 2,
    width: 4,
    height: 4,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
});