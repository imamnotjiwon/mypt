import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { AuthInput } from '../components/AuthInput';
import { ChoiceCard, ChoiceRow } from '../components/Choice';
import { CoinMark } from '../components/Marks';
import { PrimaryButton } from '../components/PrimaryButton';
import { BackGlyph } from '../components/NavGlyph';
import { useAppInsets } from '../hooks/useAppInsets';
import {
  FREQUENCY_OPTIONS,
  NICKNAME_CHANGE_COST,
  WEEKDAYS,
  clampWorkoutDays,
  maxWorkoutDays,
  minWorkoutDays,
  workoutDaysValid,
} from '../data/schedule';
import { SurveyData, useApp } from '../store/AppProvider';
import { colors, font, layout, space } from '../theme';

const PLACES = ['집', '헬스장', '공원'];
const GOALS = ['체중 감량', '근력 강화', '자세 교정', '기초 체력 증진'];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ProfileEditScreen() {
  const { go, nickname, coins, survey, nicknameChanges, updateProfile } = useApp();
  const { top, bottom } = useAppInsets();
  const [name, setName] = useState(nickname);
  const [data, setData] = useState<SurveyData>({
    ...survey,
    workoutDays: survey.workoutDays?.length ? survey.workoutDays : [],
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const nicknameChanged = name.trim() !== nickname;
  const nicknameCost = nicknameChanged && nicknameChanges > 0 ? NICKNAME_CHANGE_COST : 0;
  const daysOk = workoutDaysValid(data.workoutDays, data.frequency);

  const canSave = useMemo(() => {
    const next = name.trim();
    if (!next || next.length > 12) return false;
    if (!data.age || !data.gender || !data.height || !data.weight) return false;
    if (!data.frequency || !data.goal || data.places.length === 0) return false;
    if (!daysOk) return false;
    if (nicknameCost > 0 && coins < nicknameCost) return false;
    return true;
  }, [name, data, daysOk, nicknameCost, coins]);

  const save = async () => {
    if (busy || !canSave) return;
    setError('');
    setBusy(true);
    try {
      await updateProfile({ nickname: name.trim(), survey: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : '정보를 저장하지 못했어요.');
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const trySave = () => {
    if (!canSave) {
      if (nicknameCost > 0 && coins < nicknameCost) setError('닉네임 변경에 3,000코인이 필요해요.');
      else if (!daysOk) setError(`운동 요일은 ${minWorkoutDays(data.frequency)}~${maxWorkoutDays(data.frequency)}일을 골라 주세요.`);
      else setError('필수 정보를 모두 입력해 주세요.');
      return;
    }
    if (nicknameCost > 0) {
      setConfirmOpen(true);
      return;
    }
    save();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={[styles.safe, { paddingTop: top, paddingBottom: bottom }]} edges={[]}>
        <View style={styles.top}>
          <Pressable style={styles.iconBtn} onPress={() => go('profile')} hitSlop={12}>
            <BackGlyph />
          </Pressable>
          <AppText variant="heading">내 정보 수정</AppText>
          <View style={styles.iconBtn} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <AuthInput label="닉네임" value={name} onChangeText={setName} placeholder="예: 달이" maxLength={12} />
            <View style={styles.hintRow}>
              {nicknameCost > 0 ? <CoinMark size={16} /> : null}
              <AppText style={styles.hint}>
                {nicknameChanged
                  ? nicknameCost > 0
                    ? `이번 변경은 ${NICKNAME_CHANGE_COST.toLocaleString()}코인 · 보유 ${coins.toLocaleString()}코인`
                    : '첫 닉네임 변경은 무료예요'
                  : nicknameChanges > 0
                    ? `다음 닉네임 변경은 ${NICKNAME_CHANGE_COST.toLocaleString()}코인`
                    : '첫 닉네임 변경은 무료예요'}
              </AppText>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AuthInput label="나이" value={data.age} onChangeText={(age) => setData({ ...data, age })} keyboardType="number-pad" maxLength={3} placeholder="나이" />
              </View>
              <View style={{ flex: 1 }}>
                <AuthInput label="키(cm)" value={data.height} onChangeText={(height) => setData({ ...data, height })} keyboardType="number-pad" maxLength={3} placeholder="키" />
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AuthInput label="몸무게(kg)" value={data.weight} onChangeText={(weight) => setData({ ...data, weight })} keyboardType="number-pad" maxLength={3} placeholder="몸무게" />
              </View>
              <View style={{ flex: 1 }}>
                <AuthInput label="목표 몸무게(kg)" value={data.goalWeight} onChangeText={(goalWeight) => setData({ ...data, goalWeight })} keyboardType="number-pad" maxLength={3} placeholder="목표" />
              </View>
            </View>

            <AppText style={styles.section}>성별</AppText>
            <View style={styles.genderRow}>
              <ChoiceCard
                title="남성"
                icon={require('../../assets/survey/gender-male.png')}
                style={styles.genderCard}
                inline
                selected={data.gender === 'male'}
                onPress={() => setData({ ...data, gender: 'male' })}
              />
              <ChoiceCard
                title="여성"
                icon={require('../../assets/survey/gender-female.png')}
                style={styles.genderCard}
                inline
                selected={data.gender === 'female'}
                onPress={() => setData({ ...data, gender: 'female' })}
              />
            </View>

            <AppText style={styles.section}>일주일 운동 횟수</AppText>
            {FREQUENCY_OPTIONS.map((item) => (
              <ChoiceRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                selected={data.frequency === item.id}
                onPress={() =>
                  setData({
                    ...data,
                    frequency: item.id,
                    workoutDays: clampWorkoutDays(data.workoutDays, item.id),
                  })
                }
              />
            ))}

            <AppText style={styles.section}>운동할 요일</AppText>
            <AppText style={styles.hint}>
              {minWorkoutDays(data.frequency)}~{maxWorkoutDays(data.frequency)}일을 선택하면 이번주 미션 일정이 바뀌어요.
            </AppText>
            <View style={styles.dayRow}>
              {WEEKDAYS.map((day) => {
                const on = data.workoutDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    style={[styles.dayChip, on && styles.dayChipOn]}
                    onPress={() => {
                      const next = on
                        ? data.workoutDays.filter((item) => item !== day)
                        : clampWorkoutDays([...data.workoutDays, day], data.frequency);
                      setData({ ...data, workoutDays: next });
                    }}
                  >
                    <AppText style={[styles.dayTxt, on && styles.dayTxtOn]}>{day}</AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText style={styles.section}>운동 장소</AppText>
            {PLACES.map((place) => (
              <ChoiceRow
                key={place}
                title={place}
                selected={data.places.includes(place)}
                onPress={() => setData({ ...data, places: toggle(data.places, place) })}
              />
            ))}

            <AppText style={styles.section}>운동 목표</AppText>
            {GOALS.map((goal) => (
              <ChoiceRow key={goal} title={goal} selected={data.goal === goal} onPress={() => setData({ ...data, goal })} />
            ))}

            {error ? <AppText style={styles.error}>{error}</AppText> : null}
            <View style={{ marginTop: space[8], marginBottom: space[24] }}>
              <PrimaryButton label={busy ? '저장 중...' : '저장하기'} onPress={trySave} disabled={busy} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {confirmOpen ? (
        <View style={styles.dim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setConfirmOpen(false)} />
          <View style={styles.sheet}>
            <AppText style={styles.sheetTitle}>닉네임을 바꿀까요?</AppText>
            <AppText style={styles.sheetBody}>
              {NICKNAME_CHANGE_COST.toLocaleString()}코인이 사용되고, 바꾼 뒤에는 다시 3,000코인이 필요해요.
            </AppText>
            <PrimaryButton label={busy ? '변경 중...' : '3,000코인으로 변경'} onPress={save} disabled={busy} />
            <Pressable style={styles.cancel} onPress={() => setConfirmOpen(false)}>
              <AppText style={styles.cancelTxt}>취소</AppText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  top: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screen,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: layout.screen, paddingTop: space[16], paddingBottom: layout.navInset, gap: space[12] },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 },
  hint: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.muted, flex: 1 },
  row: { flexDirection: 'row', gap: space[12] },
  section: { fontFamily: font.bold, fontSize: 16, lineHeight: 22, color: colors.black, marginTop: space[8] },
  genderRow: { flexDirection: 'row', gap: space[12] },
  genderCard: { flexGrow: 1, flexBasis: 0, minHeight: 64, justifyContent: 'center' },
  dayRow: { flexDirection: 'row', gap: 6 },
  dayChip: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#E8EEF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  dayTxt: { fontFamily: font.bold, color: colors.navy, fontSize: 13, lineHeight: 18 },
  dayTxtOn: { color: colors.white },
  error: { fontFamily: font.medium, fontSize: 13, color: '#E35D5D' },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 30,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: layout.screen,
    paddingBottom: space[32],
    gap: space[12],
  },
  sheetTitle: { fontFamily: font.bold, fontSize: 20, lineHeight: 28, color: colors.black },
  sheetBody: { fontFamily: font.medium, fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: space[8] },
  cancel: { alignItems: 'center', paddingVertical: space[8] },
  cancelTxt: { fontFamily: font.bold, color: colors.navy },
});
