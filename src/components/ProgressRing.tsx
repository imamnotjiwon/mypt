import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, font } from '../theme';

type Props = {
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
};

export function ProgressRing({ progress, size = 180, stroke = 14, children }: Props) {
  const pct = Math.min(1, Math.max(0, progress));
  const deg = +(pct * 360).toFixed(2);
  const inner = size - stroke * 2;

  return (
    <View style={styles.host}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={[
            styles.track,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              ...(Platform.OS === 'web'
                ? {
                    // 링만 그리고 안쪽은 비워서 뒤 그라데이션이 보이게
                    background: `conic-gradient(from 0deg, #33A1C3 0deg, #194274 ${deg}deg, rgba(229,241,253,0.45) ${deg}deg 360deg)`,
                    WebkitMaskImage: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 calc(100% - ${stroke}px))`,
                    maskImage: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 calc(100% - ${stroke}px))`,
                  }
                : {
                    borderWidth: stroke,
                    borderColor: '#D7E9F8',
                    borderTopColor: pct > 0 ? '#194274' : '#D7E9F8',
                    backgroundColor: 'transparent',
                  }),
            } as object,
          ]}
        />
        <View
          style={[
            styles.inner,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

export function PercentRing({ progress }: { progress: number }) {
  return (
    <ProgressRing progress={progress} size={200} stroke={16}>
      <AppText style={styles.percent}>{Math.round(progress * 100)}%</AppText>
    </ProgressRing>
  );
}

const styles = StyleSheet.create({
  host: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { position: 'absolute', left: 0, top: 0, overflow: 'hidden', backgroundColor: 'transparent' },
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
});
