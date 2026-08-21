import { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { ChoiceCard, ChoiceRow } from '../components/Choice';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { SurveyData, useApp } from '../store/AppProvider';
import { colors, fieldFont, fieldFontBold, font, layout, radius, space } from '../theme';

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

export function SurveyScreen() {
  const { saveSurvey, survey } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>(survey);
  const [readyOpen, setReadyOpen] = useState(false);

  const canNext =
    (step === 0 && data.age && data.gender && data.height && data.weight) ||
    (step === 1 && data.places.length > 0 && data.equipment.length > 0) ||
    (step === 2 && data.goal && data.frequency && data.focus.length > 0) ||
    (step === 3 && (data.cautions.length > 0 || data.noCautions)) ||
    (step === 4 && !!data.experience);

  const next = () => {
    if (!canNext) return;
    if (step < 4) setStep(step + 1);
    else setReadyOpen(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
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
            <View style={styles.inputCard}>
              <AppText variant="label" style={styles.label}>
                나이
              </AppText>
              <View style={styles.valueRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.gray}
                  selectionColor={colors.navy}
                  underlineColorAndroid="transparent"
                  maxLength={3}
                  value={data.age}
                  onChangeText={(age) => setData({ ...data, age })}
                />
                <AppText style={styles.unit}>살</AppText>
              </View>
            </View>
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
              <View style={[styles.inputCard, styles.half]}>
                <AppText variant="label" style={styles.label}>
                  키
                </AppText>
                <View style={styles.valueRow}>
                  <TextInput style={styles.input} keyboardType="number-pad" maxLength={3} selectionColor={colors.navy} underlineColorAndroid="transparent" value={data.height} onChangeText={(height) => setData({ ...data, height })} />
                  <AppText style={styles.unit}>cm</AppText>
                </View>
              </View>
              <View style={[styles.inputCard, styles.half]}>
                <AppText variant="label" style={styles.label}>
                  몸무게
                </AppText>
                <View style={styles.valueRow}>
                  <TextInput style={styles.input} keyboardType="number-pad" maxLength={3} selectionColor={colors.navy} underlineColorAndroid="transparent" value={data.weight} onChangeText={(weight) => setData({ ...data, weight })} />
                  <AppText style={styles.unit}>kg</AppText>
                </View>
              </View>
            </View>
            <AppText variant="title">달성하고 싶은 목표 몸무게가 있나요?</AppText>
            <View style={styles.inputCard}>
              <AppText variant="label" style={styles.label}>
                목표
              </AppText>
              <View style={styles.valueRow}>
                <TextInput style={styles.input} keyboardType="number-pad" maxLength={3} selectionColor={colors.navy} underlineColorAndroid="transparent" value={data.goalWeight} onChangeText={(goalWeight) => setData({ ...data, goalWeight })} />
                <AppText style={styles.unit}>kg</AppText>
              </View>
            </View>
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
                {['1-2', '3-4', '5+'].map((item) => (
                  <ChoiceRow key={item} title={item} selected={data.frequency === item} onPress={() => setData({ ...data, frequency: item })} />
                ))}
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
              <Image source={require('../../assets/survey/eq-none.png')} style={styles.noneIcon} resizeMode="contain" />
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
            <Image source={require('../../assets/characters/ready-popup.png')} style={styles.sheetImg} resizeMode="contain" />
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
    paddingTop: (Platform.OS === 'web' ? STATUS_BAR_HEIGHT : space[8]) + space[24],
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
  },
  half: { flex: 1 },
  label: { color: colors.navyInk },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: space[8],
    minHeight: 36,
  },
  input: {
    width: 72,
    ...fieldFontBold,
    fontSize: 28,
    ...(Platform.OS === 'android' ? { height: 40, includeFontPadding: false, textAlignVertical: 'center' } : { lineHeight: 36, height: 36 }),
    color: colors.navy,
    padding: 0,
    margin: 0,
    // @ts-expect-error web
    outlineStyle: 'none',
  },
  unit: {
    color: colors.navy,
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 22,
    paddingBottom: 5,
  },
  row: { flexDirection: 'row', gap: space[12] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[12] },
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
