import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

/** 통일된 운동 아이콘 — 흰 원 + 네이비(#194373) 실루엣 */
export const EXERCISE_ICONS = {
  water: require('../../assets/ui/icon-water.png'),
  pushup: require('../../assets/ui/icon-pushup.png'),
  squat: require('../../assets/ui/icon-squat.png'),
  plank: require('../../assets/ui/icon-plank.png'),
  cardio: require('../../assets/ui/icon-cardio.png'),
  run: require('../../assets/ui/icon-run.png'),
  walk: require('../../assets/ui/icon-walk.png'),
  cycle: require('../../assets/ui/icon-cycle.png'),
  lift: require('../../assets/ui/icon-lift.png'),
  weights: require('../../assets/ui/icon-weights.png'),
  stretch: require('../../assets/ui/icon-stretch.png'),
  stairs: require('../../assets/ui/icon-stairs.png'),
} as const;

export type ExerciseIconKey = keyof typeof EXERCISE_ICONS;

export function resolveExerciseIcon(key?: string | null): ImageSourcePropType {
  if (key && key in EXERCISE_ICONS) return EXERCISE_ICONS[key as ExerciseIconKey];
  return EXERCISE_ICONS.cardio;
}

export function ExerciseIcon({
  name,
  size = 48,
  style,
}: {
  name?: string | null;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={resolveExerciseIcon(name)}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
