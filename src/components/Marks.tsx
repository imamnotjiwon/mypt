import { Image, ImageStyle, View } from 'react-native';
import { colors } from '../theme';

export function LogoMark({ width = 180, height = 44, style }: { width?: number; height?: number; style?: ImageStyle }) {
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

export function CoinMark({ size = 18 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/ui/coin-icon.png')}
      style={{ width: size, height: size }}
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
