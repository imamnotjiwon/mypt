import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { AppText } from './AppText';
import { colors, font, shadow, space } from '../theme';

const WEEK_HEAD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isFuture(date: Date, today: Date) {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return a > b;
}

/** Demo days that already have an exercise record. Today itself stays empty. */
export function dateHasRecord(date: Date, today = new Date()) {
  if (isFuture(date, today)) return false;
  if (sameDay(date, today)) return false;
  return [3, 7, 11, 14, 16, 23, 27].includes(date.getDate());
}

type Props = {
  selected: Date;
  today?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
};

export function ExerciseCalendar({ selected, today = new Date(), onSelect, onClose }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(selected));

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const blanks = Array.from({ length: startWeekday }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1));
    return [...blanks, ...days];
  }, [cursor]);

  const title = `${cursor.getFullYear()}.${String(cursor.getMonth() + 1).padStart(2, '0')}`;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <BlurView intensity={48} tint="light" style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </BlurView>
      <View style={styles.sheet}>
        <View style={styles.monthRow}>
          <Pressable
            style={styles.round}
            onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <AppText style={styles.chevron}>‹</AppText>
          </Pressable>
          <AppText variant="body" style={styles.month}>
            {title}
          </AppText>
          <Pressable
            style={styles.round}
            onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <AppText style={styles.chevron}>›</AppText>
          </Pressable>
        </View>
        <View style={styles.weekHead}>
          {WEEK_HEAD.map((day, i) => (
            <AppText key={`${day}-${i}`} style={styles.weekLabel}>
              {day}
            </AppText>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((date, i) => {
            if (!date) return <View key={`empty-${i}`} style={styles.cell} />;
            const selectedDay = sameDay(date, selected);
            const todayDay = sameDay(date, today);
            const marked = dateHasRecord(date, today);
            return (
              <Pressable key={date.toISOString()} onPress={() => onSelect(date)} style={styles.cell}>
                <View style={[styles.dayChip, selectedDay && styles.daySelected, todayDay && !selectedDay && styles.dayToday]}>
                  <AppText style={[styles.dayNum, (selectedDay || todayDay) && styles.dayNumOn]}>{date.getDate()}</AppText>
                </View>
                <View style={[styles.dot, marked ? styles.dotOn : null]} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: space[16],
    paddingTop: space[16],
    paddingBottom: space[20],
    ...shadow.soft,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[12],
  },
  round: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontFamily: font.bold, fontSize: 22, lineHeight: 26, color: colors.navy },
  month: { fontFamily: font.bold, color: colors.navy },
  weekHead: { flexDirection: 'row', marginBottom: space[8] },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.gray,
    fontFamily: font.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 48,
  },
  dayChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: '#D6EBFF' },
  dayToday: { borderWidth: 1.5, borderColor: colors.navy },
  dayNum: { fontFamily: font.medium, color: '#4A4A4A' },
  dayNumOn: { fontFamily: font.bold, color: colors.navy },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 3, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: '#5D5D8B' },
});
