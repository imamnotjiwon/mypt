import { Suspense, lazy, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store/AppProvider';
import { PhoneShell } from './src/components/PhoneShell';
import { colors } from './src/theme';
import { useAppFonts } from './src/fonts';

// 자주 쓰는 화면만 즉시 로드 — 나머지는 열 때 로드해서 첫 진입을 빠르게
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';

const SignupScreen = lazy(() => import('./src/screens/SignupScreen').then((m) => ({ default: m.SignupScreen })));
const FindPasswordScreen = lazy(() =>
  import('./src/screens/FindPasswordScreen').then((m) => ({ default: m.FindPasswordScreen })),
);
const WelcomeScreen = lazy(() => import('./src/screens/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen })));
const SurveyScreen = lazy(() => import('./src/screens/SurveyScreen').then((m) => ({ default: m.SurveyScreen })));
const CharacterSelectScreen = lazy(() =>
  import('./src/screens/CharacterSelectScreen').then((m) => ({ default: m.CharacterSelectScreen })),
);
const RoutineReadyScreen = lazy(() =>
  import('./src/screens/RoutineReadyScreen').then((m) => ({ default: m.RoutineReadyScreen })),
);
const PushupMissionScreen = lazy(() =>
  import('./src/screens/PushupMissionScreen').then((m) => ({ default: m.PushupMissionScreen })),
);
const CardioMissionScreen = lazy(() =>
  import('./src/screens/CardioMissionScreen').then((m) => ({ default: m.CardioMissionScreen })),
);
const QuestScreen = lazy(() => import('./src/screens/QuestScreen').then((m) => ({ default: m.QuestScreen })));
const ExerciseScreen = lazy(() => import('./src/screens/ExerciseScreen').then((m) => ({ default: m.ExerciseScreen })));
const ShopScreen = lazy(() => import('./src/screens/ShopScreen').then((m) => ({ default: m.ShopScreen })));
const CommunityScreen = lazy(() =>
  import('./src/screens/CommunityScreen').then((m) => ({ default: m.CommunityScreen })),
);
const ProfileScreen = lazy(() => import('./src/screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const ProfileEditScreen = lazy(() =>
  import('./src/screens/ProfileEditScreen').then((m) => ({ default: m.ProfileEditScreen })),
);
const FriendsScreen = lazy(() => import('./src/screens/FriendsScreen').then((m) => ({ default: m.FriendsScreen })));
const DexScreen = lazy(() => import('./src/screens/DexScreen').then((m) => ({ default: m.DexScreen })));
const ChatScreen = lazy(() => import('./src/screens/ChatScreen').then((m) => ({ default: m.ChatScreen })));
const CoinShopScreen = lazy(() => import('./src/screens/CoinShopScreen').then((m) => ({ default: m.CoinShopScreen })));

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

function BootFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
      <ActivityIndicator color={colors.navy} />
    </View>
  );
}

function Root() {
  const { screen, ready } = useApp();

  if (!ready) return <BootFallback />;

  let body;
  switch (screen) {
    case 'login':
      body = <LoginScreen />;
      break;
    case 'signup':
      body = <SignupScreen />;
      break;
    case 'findPassword':
      body = <FindPasswordScreen />;
      break;
    case 'welcome':
      body = <WelcomeScreen />;
      break;
    case 'survey':
      body = <SurveyScreen />;
      break;
    case 'character':
      body = <CharacterSelectScreen />;
      break;
    case 'routine':
      body = <RoutineReadyScreen />;
      break;
    case 'pushup':
      body = <PushupMissionScreen />;
      break;
    case 'cardio':
      body = <CardioMissionScreen />;
      break;
    case 'quest':
      body = <QuestScreen />;
      break;
    case 'exercise':
      body = <ExerciseScreen />;
      break;
    case 'shop':
      body = <ShopScreen />;
      break;
    case 'community':
      body = <CommunityScreen />;
      break;
    case 'profile':
      body = <ProfileScreen />;
      break;
    case 'profileEdit':
      body = <ProfileEditScreen />;
      break;
    case 'friends':
      body = <FriendsScreen />;
      break;
    case 'dex':
      body = <DexScreen />;
      break;
    case 'chat':
      body = <ChatScreen />;
      break;
    case 'coinShop':
      body = <CoinShopScreen />;
      break;
    default:
      body = <HomeScreen />;
  }

  return <Suspense fallback={<BootFallback />}>{body}</Suspense>;
}

export default function App() {
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <PhoneShell>
        <BootFallback />
      </PhoneShell>
    );
  }

  return (
    <SafeAreaProvider>
      <PhoneShell>
        <AppProvider>
          <StatusBar style="dark" />
          <Root />
        </AppProvider>
      </PhoneShell>
    </SafeAreaProvider>
  );
}
