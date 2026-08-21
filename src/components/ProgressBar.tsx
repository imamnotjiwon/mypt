import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradient } from '../theme';

type Props = {
  value: number;
  height?: number;
  color?: string;
  trackColor?: string;
  useGradient?: boolean;
  animateFrom?: number;
};

export function ProgressBar({ value, height = 12, color = colors.navy, trackColor, useGradient = false, animateFrom }: Props) {
  const clampedTo = Math.min(1, Math.max(0, value));
  const clampedFrom = Math.min(1, Math.max(0, animateFrom ?? value));
  const anim = useRef(new Animated.Value(clampedFrom)).current;

  useEffect(() => {
    if (animateFrom == null) return;
    anim.setValue(Math.min(1, Math.max(0, animateFrom)));
    Animated.timing(anim, {
      toValue: clampedTo,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, animateFrom, clampedTo]);

  const width =
    animateFrom == null
      ? (`${clampedTo * 100}%` as const)
      : anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, borderRadius: height, backgroundColor: trackColor ?? colors.progressTrack }]}>
      <Animated.View style={[styles.fillWrap, { width, height, borderRadius: height }]}>
        {useGradient ? (
          <LinearGradient colors={[...gradient.stats]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { height, borderRadius: height }]} />
        ) : (
          <View style={[styles.fill, { height, borderRadius: height, backgroundColor: clampedTo >= 1 ? '#5F8BB8' : color }]} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fillWrap: {
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
  },
});
