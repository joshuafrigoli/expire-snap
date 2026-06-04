import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

import DashboardScreen from '@/screens/DashboardScreen';
import ScanScreen from '@/screens/ScanScreen';
import FridgeScreen from '@/screens/FridgeScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import ReviewScreen from '@/screens/ReviewScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Fridge" component={FridgeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { settings } = useSettings();
  const hasProfile = !!(settings?.profile?.name?.trim());

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasProfile && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
        {hasProfile && <Stack.Screen name="BottomTabs" component={BottomTabsNavigator} />}
        {hasProfile && <Stack.Screen name="Profile" component={ProfileScreen} />}
        {hasProfile && <Stack.Screen name="History" component={HistoryScreen} />}
        {hasProfile && <Stack.Screen name="Review" component={ReviewScreen} />}
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
