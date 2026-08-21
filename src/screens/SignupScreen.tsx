import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { AuthInput } from '../components/AuthInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, space } from '../theme';

export function SignupScreen() {
  const { go, signup } = useApp();
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await signup({ nickname, username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.top}>
          <Pressable style={styles.backBtn} onPress={() => go('login')}>
            <AppText style={styles.backTxt}>‹</AppText>
          </Pressable>
          <AppText variant="heading" style={styles.title}>
            회원가입
          </AppText>
          <View style={styles.backBtn} />
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AppText style={styles.lead}>닉네임, 아이디, 비밀번호만 있으면 시작할 수 있어요.</AppText>
          <AuthInput label="닉네임" value={nickname} onChangeText={setNickname} placeholder="예: 달이" maxLength={12} />
          <AuthInput
            label="아이디"
            value={username}
            onChangeText={setUsername}
            placeholder="영문/숫자 4~20자"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AuthInput
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            placeholder="4자 이상"
            secureTextEntry
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <View style={{ marginTop: space[12] }}>
            <PrimaryButton label={busy ? '가입 중...' : '회원가입'} onPress={submit} disabled={busy} />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1, paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0 },
  top: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screen,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontFamily: font.bold, fontSize: 28, lineHeight: 36, color: colors.navy },
  title: { fontFamily: font.bold, color: colors.black },
  scroll: { paddingHorizontal: layout.screen, paddingTop: space[16], paddingBottom: 40, gap: space[16] },
  lead: { fontFamily: font.medium, fontSize: 14, lineHeight: 22, color: colors.muted },
  error: { fontFamily: font.medium, fontSize: 13, color: '#E35D5D' },
});
