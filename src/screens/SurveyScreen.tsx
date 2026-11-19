import { useRef, useState } from 'react';
import { Image, type ImageStyle, Platform, Pressable, ScrollView, StyleSheet, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { ChoiceCard, ChoiceRow } from '../components/Choice';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { useAppInsets } from '../hooks/useAppInsets';
import { SurveyData, useApp } from '../store/AppProvider';
import { FREQUENCY_OPTIONS, WEEKDAYS, clampWorkoutDays, maxWorkoutDays, minWorkoutDays, workoutDaysValid } from '../data/schedule';
import { colors, fieldFontBold, font, layout, radius, space } from '../theme';

const PLACES = [
  { id: '집', title: '집', subtitle: '언제든 편안하게 내 집에서', icon: require('../../assets/survey/place-home.png') },
  { id: '헬스장', title: '헬스장', subtitle: '다양한 기구를 활용한 고강도 운동', icon: require('../../assets/survey/place-gym.png') },
  { id: '공원', title: '공원', subtitle: '탁 트인 야외에서 상쾌하게', icon: require('../../assets/survey/place-park.png') },
];
const EQUIPMENT = [
  { title: '맨몸', subtitle: 'Bodyweight', icon: require('../../assets/survey/eq-body.png') },
  { title: '덤벨', subtitle: 'Dumbbells', icon: require('../../assets/survey/eq-dumbbell.png') },
  { title: '바벨', subtitle: 'Barbells', icon: require('../../assets/survey/eq-barbell.png') },
  { title: '밴드', subtitle: 'Resistance Bands', icon: require('../../assets/survey/eq-band.png') },
  { title: '폼롤러', subtitle: 'Foam Roller', icon: require('../../assets/survey/eq-roller.png') },
  { title: '요가매트', subtitle: 'Yoga Mat', icon: require('../../assets/survey/eq-mat.png') },
];
const GOALS = [
  { title: '체중 감량', subtitle: 'Weight Loss' },
  { title: '근력 강화', subtitle: 'Muscle Gain' },
  { title: '자세 교정', subtitle: 'Postural Correction' },
  { title: '기초 체력 증진', subtitle: 'Stamina Boost' },
];
const CAUTIONS = [
  { title: '목', subtitle: 'Neck' },
  { title: '허리', subtitle: 'Lower Back' },
  { title: '무릎', subtitle: 'Knees' },
  { title: '어깨', subtitle: 'Shoulders' },
  { title: '손목', subtitle: 'Wrists' },
  { title: '발목', subtitle: 'Ankles' },
];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function SurveyNumberField({
  label,
  unit,
  value,
  onChangeText,
  style,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}) {
  const input = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => input.current?.focus()} style={[styles.inputCard, style]}>
      <AppText variant="label" style={styles.label} pointerEvents="none">
        {label}
      </AppText>
      <TextInput
        ref={input}
        style={styles.inputFill}
        keyboardType="number-pad"
        placeholderTextColor={colors.gray}
        selectionColor={colors.navy}
        underlineColorAndroid="transparent"
        maxLength={3}
        value={value}
        onChangeText={onChangeText}
      />
      <AppText style={styles.unit} pointerEvents="none">
        {unit}
      </AppText>
    </Pressable>
  );
}

export function SurveyScreen() {
  const { saveSurvey, survey } = useApp();
  const { top } = useAppInsets();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({
    ...survey,
    workoutDays: survey.workoutDays ?? [],
  });
  const [readyOpen, setReadyOpen] = useState(false);

  const canNext =
    (step === 0 && data.age && data.gender && data.height && data.weight) ||
    (step === 1 && data.places.length > 0 && data.equipment.length > 0) ||
    (step === 2 && data.goal && data.frequency && data.focus.length > 0 && workoutDaysValid(data.workoutDays, data.frequency)) ||
    (step === 3 && (data.cautions.length > 0 || data.noCautions)) ||
    (step === 4 && !!data.experience);

  const next = () => {
    if (!canNext) return;
    if (step < 4) setStep(step + 1);
    else setReadyOpen(true);
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: top + space[8] }]} edges={[]}>
      <View style={styles.progressWrap}>
        <ProgressBar
          value={readyOpen ? 1 : (step + 1) / 6}
          animateFrom={readyOpen ? 5 / 6 : step / 6}
          useGradient
          height={18}
          trackColor="#B7C9D8"
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <AppText variant="title">회원님의 기본 정보를 알려주세요.</AppText>
            <AppText variant="sub" style={styles.sub}>
              소중한 정보는 외부에 공개되지 않아요.
            </AppText>
            <SurveyNumberField label="나이" unit="살" value={data.age} onChangeText={(age) => setData({ ...data, age })} />
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
            <View style={styles.row}>
              <SurveyNumberField
                label="키"
                unit="cm"
                value={data.height}
                onChangeText={(height) => setData({ ...data, height })}
                style={styles.half}
              />
              <SurveyNumberField
                label="몸무게"
                unit="kg"
                value={data.weight}
                onChangeText={(weight) => setData({ ...data, weight })}
                style={styles.half}
              />
            </View>
            <AppText variant="title">달성하고 싶은 목표 몸무게가 있나요?</AppText>
            <SurveyNumberField
              label="목표"
              unit="kg"
              value={data.goalWeight}
              onChangeText={(goalWeight) => setData({ ...data, goalWeight })}
            />
          </>
        )}

        {step === 1 && (
          <>
            <AppText variant="title">주로 어디에서 운동하실 계획인가요?</AppText>
            <AppText variant="sub" style={styles.sub}>
              중복 선택이 가능합니다.
            </AppText>
            {PLACES.map((place) => (
              <ChoiceRow
                key={place.id}
                title={place.title}
                subtitle={place.subtitle}
                icon={place.icon}
                selected={data.places.includes(place.id)}
                onPress={() => setData({ ...data, places: toggle(data.places, place.id) })}
              />
            ))}
            {data.places.length > 0 ? (
              <>
                <AppText variant="title" style={{ marginTop: space[24] }}>
                  사용 가능한 운동 기구를 알려주세요.
                </AppText>
                <View style={styles.wrap}>
                  {EQUIPMENT.map((item) => (
                    <ChoiceCard
                      key={item.title}
                      title={item.title}
                      subtitle={item.subtitle}
                      icon={item.icon}
                      circledIcon
                      showRadio
                      selected={data.equipment.includes(item.title)}
                      onPress={() => setData({ ...data, equipment: toggle(data.equipment, item.title) })}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}

        {step === 2 && (
          <>
            <AppText variant="title">가장 집중하고 싶은 목표는 무엇인가요?</AppText>
            <View style={styles.wrap}>
              {GOALS.map((goal) => (
                <ChoiceCard
                  key={goal.title}
                  title={goal.title}
                  subtitle={goal.subtitle}
                  showRadio
                  selected={data.goal === goal.title}
                  onPress={() => setData({ ...data, goal: goal.title })}
                />
              ))}
            </View>
            {data.goal ? (
              <>
                <AppText variant="title" style={{ marginTop: space[20] }}>
                  일주일에 몇 번 운동 하시나요?
                </AppText>
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
              </>
            ) : null}
            {data.frequency ? (
              <>
                <AppText variant="title" style={{ marginTop: space[20] }}>
                  운동할 요일을 골라 주세요.
                </AppText>
                <AppText variant="sub" style={styles.sub}>
                  {FREQUENCY_OPTIONS.find((item) => item.id === data.frequency)?.title}에 맞춰 {minWorkoutDays(data.frequency)}~{maxWorkoutDays(data.frequency)}일을 선택해요.
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
              </>
            ) : null}
            {data.frequency ? (
              <>
                <AppText variant="title" style={{ marginTop: space[20] }}>
                  더 관리하고 싶은 부위가 있나요?
                </AppText>
                {['전신', '상체', '하체', '복부'].map((item) => (
                  <ChoiceRow key={item} title={item} selected={data.focus.includes(item)} onPress={() => setData({ ...data, focus: toggle(data.focus, item) })} />
                ))}
              </>
            ) : null}
          </>
        )}

        {step === 3 && (
          <>
            <AppText variant="title">운동 시 불편하거나 주의해야할 부위가 있나요?</AppText>
            <AppText variant="sub" style={styles.sub}>
              선택하신 부위에 무리가 가지 않도록 AI가 동작을 안전하게 필터링해 드릴게요.
            </AppText>
            <View style={styles.wrap}>
              {CAUTIONS.map((item) => (
                <ChoiceCard
                  key={item.title}
                  title={item.title}
                  subtitle={item.subtitle}
                  showRadio
                  selected={data.cautions.includes(item.title)}
                  onPress={() => setData({ ...data, noCautions: false, cautions: toggle(data.cautions, item.title) })}
                />
              ))}
            </View>
            <Pressable
              style={[styles.none, data.noCautions && styles.noneOn]}
              onPress={() => setData({ ...data, noCautions: true, cautions: [] })}
            >
              <Image source={require('../../assets/survey/eq-none.png')} style={styles.noneIcon as ImageStyle} resizeMode="contain" />
              <AppText variant="body" style={[styles.noneText, data.noCautions && styles.noneTextOn]}>
                없음
              </AppText>
            </Pressable>
          </>
        )}

        {step === 4 && (
          <>
            <AppText variant="title">평소 운동 경험은 어느 정도인가요?</AppText>
            <AppText variant="sub" style={styles.sub}>
              현재 나의 수준(경험도)
            </AppText>
            {['입문', '초보', '중급', '숙련'].map((item) => (
              <ChoiceRow key={item} title={item} selected={data.experience === item} onPress={() => setData({ ...data, experience: item })} />
            ))}
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="다음" onPress={next} disabled={!canNext} />
      </View>

      {readyOpen ? (
        <View style={styles.sheetDim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setReadyOpen(false)} />
          <View style={styles.sheet}>
            <AppText variant="title">준비완료!</AppText>
            <AppText variant="body" style={styles.sheetLead}>
              이제 회원님만의 맞춤 루틴을 만나러 가볼까요?
            </AppText>
            <Image source={require('../../assets/characters/ready-popup.png')} style={styles.sheetImg as ImageStyle} resizeMode="contain" />
            <View style={styles.infoBox}>
              <AppText variant="caption" style={styles.sheetBullet}>
                •  회원님 정보를 바탕으로 맞춤 루틴을 생성 중이에요.
              </AppText>
              <AppText variant="caption" style={styles.sheetBullet}>
                •  기다리는 동안 함께 성장할 캐릭터를 골라요.
              </AppText>
            </View>
            <View style={{ marginTop: space[16] }}>
              <PrimaryButton label="만나기" onPress={() => saveSurvey(data)} />
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screen,
    position: 'relative',
  },
  content: { paddingTop: space[20], paddingBottom: space[24], gap: space[12] },
  progressWrap: { marginBottom: space[8] },
  genderRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', gap: space[12] },
  genderCard: { flexGrow: 1, flexBasis: 0, minHeight: 64, justifyContent: 'center' },
  sub: { color: 'rgba(90,90,90,0.8)', marginBottom: space[8] },
  inputCard: {
    backgroundColor: colors.sky,
    borderRadius: radius.input,
    padding: space[24],
    minHeight: 96,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ cursor: 'text' } as unknown as ViewStyle) : null),
  },
  half: { flex: 1 },
  label: { color: colors.navyInk, zIndex: 1 },
  inputFill: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: space[24],
    paddingTop: 44,
    paddingBottom: 18,
    paddingRight: 58,
    ...fieldFontBold,
    fontSize: 28,
    color: colors.navy,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'bottom' } : null),
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null),
  },
  unit: {
    alignSelf: 'flex-end',
    color: colors.navy,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 22,
    zIndex: 1,
  },
  row: { flexDirection: 'row', gap: space[12] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[12] },
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
  none: {
    alignSelf: 'center',
    marginTop: space[8],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    borderRadius: 999,
    backgroundColor: colors.sky,
    paddingHorizontal: space[24],
    paddingVertical: space[10],
  },
  noneOn: { backgroundColor: '#D7E9FB' },
  noneIcon: { width: 18, height: 18 },
  noneText: { fontFamily: font.bold, color: colors.body },
  noneTextOn: { color: colors.navy },
  footer: { paddingBottom: space[16], paddingTop: space[8] },
  sheetDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: layout.screen,
    paddingBottom: space[32],
  },
  sheetLead: { marginTop: space[8], color: colors.navyDeep, fontFamily: font.bold },
  sheetImg: { width: 168, height: 132, alignSelf: 'center', marginVertical: space[16] },
  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: space[16],
    paddingVertical: space[16],
    gap: space[8],
  },
  sheetBullet: { color: colors.body },
});
