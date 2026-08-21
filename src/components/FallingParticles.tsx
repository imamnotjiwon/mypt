import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { layout } from '../theme';

type Shape = 'circle' | 'square' | 'triangle';

const COLORS = ['#33A1C3', '#9C27B0', '#FFB300', '#194274', '#68BFD9', '#FF6B9D'];
const SHAPES: Shape[] = ['circle', 'square', 'triangle'];

type Spec = {
  left: number;
  size: number;
  color: string;
  shape: Shape;
  delay: number;
  duration: number;
  spin: string;
};

function Particle({ spec, fallTo }: { spec: Spec; fallTo: number }) {
  const y = useRef(new Animated.Value(-28)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const drop = () => {
      if (!alive) return;
      y.setValue(-28);
      spin.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(y, {
          toValue: fallTo,
          duration: spec.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(spin, {
          toValue: 1,
          duration: spec.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.95, duration: 180, useNativeDriver: true }),
          Animated.delay(Math.max(0, spec.duration - 480)),
          Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished && alive) drop();
      });
    };
    const id = setTimeout(drop, spec.delay);
    return () => {
      alive = false;
      clearTimeout(id);
      y.stopAnimation();
      spin.stopAnimation();
      opacity.stopAnimation();
    };
  }, [fallTo, opacity, spec.delay, spec.duration, spin, y]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', spec.spin] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: spec.left,
          opacity,
          transform: [{ translateY: y }, { rotate }],
        },
      ]}
    >
      {spec.shape === 'triangle' ? (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: spec.size / 2,
            borderRightWidth: spec.size / 2,
            borderBottomWidth: spec.size,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: spec.color,
          }}
        />
      ) : (
        <View
          style={{
            width: spec.size,
            height: spec.size,
            backgroundColor: spec.color,
            borderRadius: spec.shape === 'circle' ? spec.size / 2 : 2,
          }}
        />
      )}
    </Animated.View>
  );
}

export function FallingParticles({ count = 36 }: { count?: number }) {
  const [box, setBox] = useState({ w: layout.phone, h: 874 });

  const bits = useMemo<Spec[]>(() => {
    const span = Math.max(24, box.w - 16);
    return Array.from({ length: count }, (_, i) => {
      const slot = ((i * 11) % count) / count;
      const jitter = ((i * 7) % 9) - 4;
      return {
        left: 4 + slot * span + jitter,
        size: 6 + (i % 5) * 2,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[i % SHAPES.length],
        delay: Math.floor((i / count) * 2600),
        duration: 3200 + (i % 8) * 380,
        spin: i % 2 === 0 ? '360deg' : '-360deg',
      };
    });
  }, [box.w, count]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setBox((prev) => {
      if (Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1) return prev;
      return { w: width, h: height };
    });
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {bits.map((spec, i) => (
        <Particle key={`${i}-${box.w}`} spec={spec} fallTo={box.h + 36} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
  },
});
