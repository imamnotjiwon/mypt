import { Image, ImageStyle, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

export function LogoMark({ width = 248, height = 96, style }: { width?: number; height?: number; style?: ImageStyle }) {
  return (
    <Image
      source={require('../../assets/ui/logo.png')}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}

export function AppleMark({ size = 20 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('../../assets/ui/apple.png')} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

export function KakaoMark({ size = 20 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('../../assets/ui/kakao.png')} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

/** 벡터 코인 — 키워도 깨지지 않음 */
export function CoinMark({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="코인">
      <Circle cx="32" cy="32" r="32" fill="#EEB800" />
      <Path
        fill="#000000"
        d="M36.2 14.4c2.1.6 3.7 1.7 4.8 3.2l-3.3 2.5c-.6-.9-1.5-1.5-2.7-1.9-1.2-.4-2.5-.3-3.4.3-.9.6-1.3 1.5-1.3 2.5 0 .8.3 1.4.8 1.9.5.4 1.5.8 2.9 1.2l1.5.4c2.5.7 4.3 1.7 5.4 3.1 1.1 1.4 1.7 3.1 1.7 5.2 0 2.5-.9 4.6-2.6 6.1-1.7 1.5-4.1 2.4-7 2.6v3.8h-3.6v-3.8c-2.6-.3-4.8-1.3-6.5-3.1-1.2-1.2-2-2.6-2.4-4.1l3.8-1.5c.4 1.5 1.2 2.6 2.4 3.4 1.2.8 2.6 1.2 4.2 1.2 1.6 0 2.8-.3 3.7-.9.9-.6 1.3-1.5 1.3-2.6 0-.9-.3-1.6-1-2.1-.7-.5-1.9-1-3.6-1.5l-1.6-.4c-2.3-.6-4-1.6-5.1-2.9-1.1-1.3-1.7-3-1.7-5 0-2.4.9-4.4 2.6-5.8 1.7-1.5 4-2.3 6.8-2.5V10.8h3.6v3.6z"
      />
    </Svg>
  );
}

export function SearchMark({ size = 20 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/ui/icon-nav-search-mark.png')}
      style={{ width: size, height: size, tintColor: '#194373' }}
      resizeMode="contain"
    />
  );
}

export function HouseMark({ color = colors.navy, size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.42,
          borderRightWidth: size * 0.42,
          borderBottomWidth: size * 0.36,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          marginBottom: -2,
        }}
      />
      <View style={{ width: size * 0.62, height: size * 0.42, backgroundColor: color, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />
    </View>
  );
}
