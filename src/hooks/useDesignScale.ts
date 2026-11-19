import { Platform, useWindowDimensions } from 'react-native';
import { layout } from '../theme';

/** Figma 프레임 402 기준으로 웹·실기기 이미지 크기를 같게 맞춤. */
export function useDesignScale() {
  const { width } = useWindowDimensions();
  const frame = Platform.OS === 'web' ? layout.phone : width;
  return frame / layout.phone;
}

export function useFrameWidth() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' ? layout.phone : width;
}
