import { Image, ImageSourcePropType, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, shadow, space } from '../theme';

type Props = {
  selected?: boolean;
  title: string;
  subtitle?: string;
  icon?: ImageSourcePropType;
  showRadio?: boolean;
  circledIcon?: boolean;
  inline?: boolean;
  style?: ViewStyle;
  onPress: () => void;
};

export function ChoiceCard({ selected, title, subtitle, icon, showRadio, circledIcon, inline, style, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.card, inline && styles.inlineCard, selected && styles.selected, style]}>
      {icon ? (
        circledIcon ? (
          <View style={styles.iconCircle}>
            <Image source={icon} style={styles.circleGlyph} resizeMode="contain" />
          </View>
        ) : (
          <Image source={icon} style={[styles.cardIcon, inline && styles.inlineIcon]} resizeMode="contain" />
        )
      ) : null}
      <AppText variant="body" style={[styles.title, selected && styles.selectedText]}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="label" style={[styles.sub, selected && styles.selectedSub]}>
          {subtitle}
        </AppText>
      ) : null}
      {showRadio ? (
        selected ? (
          <Image source={require('../../assets/ui/check-on.png')} style={styles.cardCheck} resizeMode="contain" />
        ) : (
          <View style={[styles.radio, styles.cardRadio]} />
        )
      ) : null}
    </Pressable>
  );
}

export function ChoiceRow({ selected, title, subtitle, icon, onPress }: Props) {
  const mark = selected ? (
    <Image source={require('../../assets/ui/check-on.png')} style={styles.check} resizeMode="contain" />
  ) : (
    <View style={styles.radio} />
  );

  return (
    <Pressable onPress={onPress} style={[styles.row, selected && styles.selected]}>
      {icon ? <Image source={icon} style={styles.rowIcon} resizeMode="contain" /> : mark}
      <View style={styles.rowText}>
        <AppText variant="body" style={[styles.rowTitle, selected && styles.selectedText]}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="label" style={styles.rowSub}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {icon ? mark : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 118,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#E8EEF3',
    borderRadius: 20,
    paddingVertical: space[16],
    paddingHorizontal: space[12],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.soft,
  },
  selected: {
    borderColor: colors.navy,
    backgroundColor: colors.sky,
    shadowColor: '#194373',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[10],
    overflow: 'hidden',
  },
  circleGlyph: { width: 40, height: 40 },
  cardIcon: { width: 36, height: 36, marginBottom: space[10] },
  inlineCard: {
    flexDirection: 'row',
    minHeight: 64,
    paddingVertical: space[16],
    paddingHorizontal: space[16],
    gap: space[8],
  },
  inlineIcon: { width: 14, height: 14, marginBottom: 0 },
  title: {
    fontFamily: 'Pretendard-Bold',
    color: colors.text,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.navy,
  },
  sub: {
    marginTop: space[4],
    letterSpacing: 0,
    fontFamily: 'Pretendard-Medium',
    color: colors.muted,
    textAlign: 'center',
  },
  selectedSub: { color: '#5F8BB8' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#E8EEF3',
    borderRadius: 20,
    paddingVertical: space[16],
    paddingHorizontal: space[16],
  },
  rowIcon: { width: 44, height: 44, borderRadius: 10 },
  rowText: { flex: 1 },
  rowTitle: {
    color: colors.body,
  },
  rowSub: {
    marginTop: 2,
    letterSpacing: 0,
    fontFamily: 'Pretendard-Medium',
    color: colors.muted,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#C9D4DE',
  },
  cardRadio: { marginTop: space[12] },
  cardCheck: { width: 22, height: 22, marginTop: space[12] },
  check: { width: 22, height: 22 },
});
