import { useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useUIStore } from '../store/ui.store';

export const useScrollHideTabBar = () => {
  const setTabBarVisible = useUIStore((state) => state.setTabBarVisible);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 50) {
      setTabBarVisible(false);
    } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY <= 50) {
      setTabBarVisible(true);
    }
    
    lastScrollY.current = currentScrollY;
  };

  return handleScroll;
};
