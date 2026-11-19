import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const SHADOW = require('../../assets/ui/floor-shadow.png');

type Props = {
  width: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/** 캐릭터 발 아래 바닥 그림자. 하체가 보이는 화면에서 공통 사용. */
export function FloorShadow({ width, height, style }: Props) {
  const h = height ?? Math.max(16, Math.round(width * 0.3));
  return (
    <View style={[styles.wrap, { width, height: h }, style]} pointerEvents="none">
      <Image source={SHADOW} style={styles.img} resizeMode="stretch" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
});
