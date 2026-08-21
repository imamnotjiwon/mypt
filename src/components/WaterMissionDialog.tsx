import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { ProgressBar } from './ProgressBar';
import { colors, font, radius, space } from '../theme';

type Props = {
  currentMl: number;
  targetMl: number;
  onAdd: (ml: number) => void;
  onDismiss: () => void;
};

export function WaterMissionDialog({ currentMl, targetMl, onAdd, onDismiss }: Props) {
  const done = currentMl >= targetMl;
  return (
    <View style={styles.dim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      <View style={styles.card}>
        <View style={styles.icon}>
          <AppText style={{ fontSize: 22 }}>💧</AppText>
        </View>
        <AppText variant="title">물 마시기</AppText>
        <AppText variant="caption" style={styles.sub}>
          오늘 마신 물의 양을 기록해보세요
        </AppText>
        <AppText variant="title" style={styles.amount}>
          {currentMl}ml / {targetMl}ml
        </AppText>
        <View style={{ width: '100%', marginTop: space[8] }}>
          <ProgressBar value={currentMl / targetMl} />
        </View>
        <View style={styles.row}>
          {[100, 250, 500].map((ml) => (
            <Pressable key={ml} style={styles.quick} onPress={() => onAdd(ml)}>
              <AppText variant="body" style={styles.quickTxt}>
                +{ml}ml
              </AppText>
            </Pressable>
          ))}
        </View>
        <View style={{ width: '100%', marginTop: space[16] }}>
          <PrimaryButton label={done ? '클리어' : '닫기'} onPress={onDismiss} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
    zIndex: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.skyCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[16],
  },
  sub: { color: colors.gray, marginTop: space[4] },
  amount: { color: colors.navy, marginTop: space[16], fontFamily: font.bold },
  row: { flexDirection: 'row', gap: space[8], marginTop: space[24], width: '100%' },
  quick: {
    flex: 1,
    backgroundColor: colors.skyCard,
    borderRadius: radius.card,
    paddingVertical: space[16],
    alignItems: 'center',
  },
  quickTxt: { fontFamily: font.bold, color: colors.navy },
});
