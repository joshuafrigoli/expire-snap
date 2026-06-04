import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

import DashboardScreen from '@/screens/DashboardScreen';
import ScanScreen from '@/screens/ScanScreen';
import FridgeScreen from '@/screens/FridgeScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';

const STORAGE_KEY = 'expiresnap_settings';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabsNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Fridge" component={FridgeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [hasProfile, setHasProfile] = useState(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          const name = parsed?.profile?.name;
          setHasProfile(typeof name === 'string' && name.trim().length > 0);
        } else {
          setHasProfile(false);
        }
      })
      .catch(() => {
        setHasProfile(false);
      });
  }, []);

  if (hasProfile === null) {
    return null;
  }

  if (!hasProfile) {
    return (
      <SettingsProvider>
        <InventoryProvider>
          <OnboardingScreen />
        </InventoryProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <InventoryProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="BottomTabs" component={BottomTabsNavigator} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </InventoryProvider>
    </SettingsProvider>
  );
}
