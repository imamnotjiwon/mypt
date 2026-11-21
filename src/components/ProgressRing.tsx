import { ReactNode, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from './AppText';
import { colors, font } from '../theme';

type Props = {
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  /** true면 progress 변화를 부드럽게 이어서 그림 (루틴 로딩용) */
  animate?: boolean;
  trackColor?: string;
  progressColor?: string;
};

export function ProgressRing({
  progress,
  size = 180,
  stroke = 14,
  children,
  animate = false,
  trackColor = '#D7E9F8',
  progressColor = '#194274',
}: Props) {
  const target = Math.min(1, Math.max(0, progress));
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }

    const tick = () => {
      const cur = displayRef.current;
      const next = cur + (target - cur) * 0.18;
      const done = Math.abs(target - next) < 0.002;
      const value = done ? target : next;
      displayRef.current = value;
      setDisplay(value);
      if (!done) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, target]);

  const pct = animate ? display : target;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View style={styles.host}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={[styles.inner, { width: size - stroke * 2, height: size - stroke * 2 }]}>{children}</View>
      </View>
    </View>
  );
}

export function PercentRing({
  progress,
  size = 140,
  stroke = 12,
}: {
  progress: number;
  size?: number;
  stroke?: number;
}) {
  const pct = Math.min(1, Math.max(0, progress));
  return (
    <ProgressRing progress={pct} size={size} stroke={stroke} animate>
      <AppText style={[styles.percent, size < 160 && styles.percentSm]}>{Math.round(pct * 100)}%</AppText>
    </ProgressRing>
  );
}

const styles = StyleSheet.create({
  host: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontFamily: font.bold,
    fontSize: 32,
    lineHeight: 40,
    color: colors.black,
  },
  percentSm: {
    fontSize: 24,
    lineHeight: 30,
  },
});
