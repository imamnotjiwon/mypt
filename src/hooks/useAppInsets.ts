import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { layout } from '../theme';

const TOP_GAP = 10;

function androidStatusTop() {
  return StatusBar.currentHeight && StatusBar.currentHeight > 0 ? StatusBar.currentHeight : 24;
}

export function useAppInsets() {
  const insets = useSafeAreaInsets();
  const top =
    (Platform.OS === 'web'
      ? STATUS_BAR_HEIGHT
      : Platform.OS === 'android'
        ? Math.max(insets.top, androidStatusTop())
        : Math.max(insets.top, 20)) + TOP_GAP;
  // 홈 인디케이터 구간도 탭 흰색 배경으로 채움
  const bottom = Platform.OS === 'web' ? 0 : Math.max(insets.bottom, 0);
  return {
    top,
    bottom,
    headerPad: top,
    headerHeight: top + 56,
    navHeight: layout.navHeight + bottom,
    navInset: layout.navInset + bottom,
  };
}
