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
                    background: `conic-gradient(from 0deg, #33A1C3 0deg, #194274 ${deg}deg, #E5F1FD ${deg}deg 360deg)`,
                  }
                : {
                    borderWidth: stroke,
                    borderColor: '#E5F1FD',
                    borderTopColor: pct > 0 ? '#194274' : '#E5F1FD',
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
    <ProgressRing progress={progress} size={168} stroke={14}>
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
  track: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  inner: {
    backgroundColor: '#F7FBFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  percent: {
    fontFamily: font.bold,
    fontSize: 32,
    lineHeight: 40,
    color: colors.black,
  },
});
