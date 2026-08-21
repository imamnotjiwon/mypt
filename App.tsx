import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store/AppProvider';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { FindPasswordScreen } from './src/screens/FindPasswordScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SurveyScreen } from './src/screens/SurveyScreen';
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen';
import { RoutineReadyScreen } from './src/screens/RoutineReadyScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PushupMissionScreen } from './src/screens/PushupMissionScreen';
import { CardioMissionScreen } from './src/screens/CardioMissionScreen';
import { QuestScreen } from './src/screens/QuestScreen';
import { ExerciseScreen } from './src/screens/ExerciseScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { DexScreen } from './src/screens/DexScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { PhoneShell } from './src/components/PhoneShell';
import { colors } from './src/theme';
import { useAppFonts } from './src/fonts';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

function Root() {
  const { screen, ready } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  switch (screen) {
    case 'login':
      return <LoginScreen />;
    case 'signup':
      return <SignupScreen />;
    case 'findPassword':
      return <FindPasswordScreen />;
    case 'welcome':
      return <WelcomeScreen />;
    case 'survey':
      return <SurveyScreen />;
    case 'character':
      return <CharacterSelectScreen />;
    case 'routine':
      return <RoutineReadyScreen />;
    case 'pushup':
      return <PushupMissionScreen />;
    case 'cardio':
      return <CardioMissionScreen />;
    case 'quest':
      return <QuestScreen />;
    case 'exercise':
      return <ExerciseScreen />;
    case 'shop':
      return <ShopScreen />;
    case 'community':
      return <CommunityScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'friends':
      return <FriendsScreen />;
    case 'dex':
      return <DexScreen />;
    case 'chat':
      return <ChatScreen />;
    default:
      return <HomeScreen />;
  }
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
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.navy} />
        </View>
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
