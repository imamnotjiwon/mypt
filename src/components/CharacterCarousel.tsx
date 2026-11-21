import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Character, CHARACTERS } from '../data/characters';
import { useDesignScale } from '../hooks/useDesignScale';
import { FloorShadow } from './FloorShadow';

type Props = {
  index: number;
  onIndexChange: (index: number) => void;
};

const BASE_H = 248;
const SLIDE_MS = 280;

function Slot({
  character,
  width,
  height,
  shadowW,
  onPress,
  style,
}: {
  character: Character;
  width: number;
  height: number;
  shadowW: number;
  onPress?: () => void;
  style?: object;
}) {
  const shadowH = Math.round(shadowW * 0.32);
  const overflow = Math.round(shadowH * 0.28);
  const body = (
    <View style={[styles.slotInner, { width, height: height + overflow }]}>
      <FloorShadow
        width={shadowW}
        height={shadowH}
        style={[styles.shadow, { bottom: -Math.round(shadowH * 0.16) }]}
      />
      <Image
        source={character.body}
        style={{
          width,
          height,
          marginBottom: overflow,
          zIndex: 2,
          transform: [{ translateX: Math.round(width * (character.nudgeX ?? 0)) }],
        }}
        resizeMode="contain"
      />
    </View>
  );
  if (onPress) {
    return (
      <Pressable style={style} onPress={onPress}>
        {body}
      </Pressable>
    );
  }
  return <View style={style}>{body}</View>;
}

export function CharacterCarousel({ index, onIndexChange }: Props) {
  const indexRef = useRef(index);
  const changeRef = useRef(onIndexChange);
  const animating = useRef(false);
  const stepRef = useRef({ prev: 120, next: 120 });
  const slideX = useRef(new Animated.Value(0)).current;
  indexRef.current = index;
  changeRef.current = onIndexChange;

  const s = useDesignScale();
  const prev = CHARACTERS[(index - 1 + CHARACTERS.length) % CHARACTERS.length];
  const current = CHARACTERS[index];
  const next = CHARACTERS[(index + 1) % CHARACTERS.length];

  const sizeOf = (c: Character) => {
    const h = Math.round(BASE_H * c.bodyScale * s);
    const w = Math.round(h * 0.74);
    return { w, h, shadow: Math.round(w * 1.05) };
  };
  const p = sizeOf(prev);
  const c = sizeOf(current);
  const n = sizeOf(next);
  const peek = Math.round(Math.max(p.w, n.w) * 0.4);
  const gap = Math.round(10 * s);

  useEffect(() => {
    stepRef.current = {
      prev: Math.round(c.w / 2 + gap + p.w / 2),
      next: Math.round(c.w / 2 + gap + n.w / 2),
    };
  }, [c.w, gap, n.w, p.w]);

  const finishSlide = (dir: -1 | 1) => {
    // 인덱스를 먼저 바꾸고, 같은 프레임에 오프셋을 0으로 리셋해야
    // "뒤로 튕겼다가 바뀌는" 깜빡임이 없다.
    const nextIndex = (indexRef.current + dir + CHARACTERS.length) % CHARACTERS.length;
    changeRef.current(nextIndex);
    slideX.setValue(0);
    animating.current = false;
  };

  const go = (dir: -1 | 1) => {
    if (animating.current) return;
    animating.current = true;
    const target = dir === 1 ? -stepRef.current.next : stepRef.current.prev;
    Animated.timing(slideX, {
      toValue: target,
      duration: SLIDE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        slideX.setValue(0);
        animating.current = false;
        return;
      }
      finishSlide(dir);
    });
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !animating.current,
        onMoveShouldSetPanResponder: (_, g) =>
          !animating.current && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.1,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          slideX.stopAnimation();
        },
        onPanResponderMove: (_, g) => {
          if (animating.current) return;
          const max = Math.max(stepRef.current.prev, stepRef.current.next);
          const dx = Math.max(-max, Math.min(max, g.dx));
          slideX.setValue(dx);
        },
        onPanResponderRelease: (_, g) => {
          if (animating.current) return;
          const goNext = g.dx < -40 || g.vx < -0.5;
          const goPrev = g.dx > 40 || g.vx > 0.5;
          if (goNext || goPrev) {
            const dir: -1 | 1 = goNext ? 1 : -1;
            animating.current = true;
            const target = dir === 1 ? -stepRef.current.next : stepRef.current.prev;
            Animated.timing(slideX, {
              toValue: target,
              duration: Math.max(160, SLIDE_MS - Math.min(160, Math.abs(g.dx))),
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (!finished) {
                slideX.setValue(0);
                animating.current = false;
                return;
              }
              finishSlide(dir);
            });
            return;
          }
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start(() => {
            animating.current = false;
          });
        },
      }),
    // finishSlide/slideX are stable via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={[styles.clip, Platform.OS === 'web' ? styles.webTouch : null]} {...pan.panHandlers}>
      <Animated.View style={[styles.track, { transform: [{ translateX: slideX }] }]}>
        <Slot
          character={prev}
          width={p.w}
          height={p.h}
          shadowW={p.shadow}
          onPress={() => go(-1)}
          style={[styles.side, { width: p.w, left: -p.w + peek }]}
        />
        <Slot
          character={current}
          width={c.w}
          height={c.h}
          shadowW={c.shadow}
          style={[styles.center, { width: c.w, marginLeft: -c.w / 2 }]}
        />
        <Slot
          character={next}
          width={n.w}
          height={n.h}
          shadowW={n.shadow}
          onPress={() => go(1)}
          style={[styles.side, { width: n.w, right: -n.w + peek }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: -24,
  },
  webTouch: {
    ...(Platform.OS === 'web'
      ? ({ touchAction: 'none', userSelect: 'none', cursor: 'grab' } as object)
      : null),
  },
  track: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 36,
  },
  side: {
    position: 'absolute',
    bottom: 36,
  },
  center: {
    position: 'absolute',
    bottom: 36,
    left: '50%',
    zIndex: 2,
  },
  slotInner: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadow: {
    position: 'absolute',
    zIndex: 1,
  },
});
