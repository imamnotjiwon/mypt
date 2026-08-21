import { useRef } from 'react';
import { Image, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { CHARACTERS } from '../data/characters';

type Props = {
  index: number;
  onIndexChange: (index: number) => void;
};

export function CharacterCarousel({ index, onIndexChange }: Props) {
  const indexRef = useRef(index);
  const changeRef = useRef(onIndexChange);
  indexRef.current = index;
  changeRef.current = onIndexChange;
  const prev = CHARACTERS[(index - 1 + CHARACTERS.length) % CHARACTERS.length];
  const current = CHARACTERS[index];
  const next = CHARACTERS[(index + 1) % CHARACTERS.length];

  const go = (dir: -1 | 1) => {
    const nextIndex = (indexRef.current + dir + CHARACTERS.length) % CHARACTERS.length;
    changeRef.current(nextIndex);
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => undefined,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -36) go(1);
        else if (g.dx > 36) go(-1);
      },
    }),
  ).current;

  return (
    <View style={[styles.wrap, Platform.OS === 'web' ? styles.webTouch : null]} {...pan.panHandlers}>
      <Pressable style={styles.side} onPress={() => go(-1)}>
        <Image source={prev.body} style={styles.sideImg} resizeMode="contain" />
      </Pressable>
      <View style={styles.center}>
        <Image source={current.body} style={styles.centerImg} resizeMode="contain" />
        <View style={styles.ground} />
      </View>
      <Pressable style={styles.side} onPress={() => go(1)}>
        <Image source={next.body} style={styles.sideImg} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: -24,
    overflow: 'hidden',
  },
  webTouch: {
    // @ts-expect-error web
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'grab',
  },
  side: {
    width: 118,
    height: 230,
    justifyContent: 'flex-end',
    opacity: 0.45,
  },
  sideImg: { width: 118, height: 220 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  centerImg: { width: 236, height: 292 },
  ground: {
    width: 148,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(25, 67, 115, 0.16)',
    marginTop: -4,
  },
});
