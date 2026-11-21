import { Image, StyleSheet } from 'react-native';

const SIZE = 40;

/** 첨부 에셋 — 흰 원 + 화살표가 이미 들어 있음 */
export function BackGlyph({ size = SIZE }: { color?: string; size?: number }) {
  return (
    <Image
      source={require('../../assets/ui/icon-nav-back.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="뒤로가기"
    />
  );
}

/** 첨부 에셋 — 흰 원 + X가 이미 들어 있음 */
export function CloseGlyph({ size = SIZE }: { color?: string; size?: number }) {
  return (
    <Image
      source={require('../../assets/ui/icon-nav-close.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="닫기"
    />
  );
}

/** 흰 원 + 네이비 검색 마크 (첨부 검색 아이콘 색상 적용) */
export function SearchGlyph({ size = SIZE }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/ui/icon-nav-search.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="검색"
    />
  );
}

export const navGlyphStyles = StyleSheet.create({
  hit: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
