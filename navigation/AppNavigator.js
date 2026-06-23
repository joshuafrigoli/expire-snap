import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { BackHandler, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { useTheme, darkColors } from '@/theme';

import DashboardScreen from '@/screens/DashboardScreen';
import ScanScreen from '@/screens/ScanScreen';
import FridgeScreen from '@/screens/FridgeScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import ReviewScreen from '@/screens/ReviewScreen';
import ProviderInfoScreen from '@/screens/ProviderInfoScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = { Home: 'home', Scan: 'scan', Fridge: 'nutrition', Settings: 'settings' };

function BottomTabsNavigator() {
  const { t } = useTranslation();
  const colors = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: { borderTopWidth: 2, borderTopColor: colors.tabBorder, backgroundColor: colors.surface },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ tabBarLabel: t('nav.scan') }} />
      <Tab.Screen name="Fridge" component={FridgeScreen} options={{ tabBarLabel: t('nav.fridge') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('nav.settings') }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { settings } = useSettings();
  const hasProfile = !!(settings?.profile?.name?.trim());
  const colors = useTheme();
  const isDark = colors === darkColors;
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg);
    if (Platform.OS !== 'android') return;
    NavigationBar.setBackgroundColorAsync(colors.bg);
    NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
  }, [colors.bg, isDark]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navRef.isReady() && navRef.canGoBack()) {
        navRef.goBack();
        return true;
      }
      BackHandler.exitApp();
      return true;
    });
    return () => sub.remove();
  }, [navRef]);

  const navTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.surface,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
      notification: colors.danger,
    },
  };

  return (
    <NavigationContainer ref={navRef} theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasProfile && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
        {hasProfile && <Stack.Screen name="BottomTabs" component={BottomTabsNavigator} />}
        {hasProfile && <Stack.Screen name="Profile" component={ProfileScreen} />}
        {hasProfile && <Stack.Screen name="History" component={HistoryScreen} />}
        {hasProfile && <Stack.Screen name="Review" component={ReviewScreen} />}
        {hasProfile && <Stack.Screen name="ProviderInfo" component={ProviderInfoScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <SettingsProvider>
      <InventoryProvider>
        <AppContent />
      </InventoryProvider>
    </SettingsProvider>
  );
}
