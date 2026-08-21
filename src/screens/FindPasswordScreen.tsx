import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { AuthInput } from '../components/AuthInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, space } from '../theme';

export function FindPasswordScreen() {
  const { go, resetPassword } = useApp();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await resetPassword({ username, nickname, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호를 바꾸지 못했어요.');
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
            비밀번호 찾기
          </AppText>
          <View style={styles.backBtn} />
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AppText style={styles.lead}>가입할 때 만든 아이디와 닉네임을 확인한 뒤 새 비밀번호로 바꿔요.</AppText>
          <AuthInput
            label="아이디"
            value={username}
            onChangeText={setUsername}
            placeholder="아이디"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AuthInput label="닉네임" value={nickname} onChangeText={setNickname} placeholder="닉네임" />
          <AuthInput
            label="새 비밀번호"
            value={password}
            onChangeText={setPassword}
            placeholder="4자 이상"
            secureTextEntry
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          {done ? <AppText style={styles.ok}>비밀번호를 바꿨어요. 다시 로그인해 주세요.</AppText> : null}
          <View style={{ marginTop: space[12] }}>
            <PrimaryButton
              label={done ? '로그인하기' : busy ? '확인 중...' : '비밀번호 재설정'}
              onPress={done ? () => go('login') : submit}
              disabled={busy}
            />
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
  ok: { fontFamily: font.medium, fontSize: 13, color: colors.navy },
});
