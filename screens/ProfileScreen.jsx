import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '@/context/SettingsContext';
import { useInventory } from '@/context/InventoryContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const { items } = useInventory();

  return (
    <View>
      <Text>{settings.profile?.name || ''}</Text>
      <Pressable testID="profile-export-btn">
        <Text>Export Data</Text>
      </Pressable>
      <Pressable testID="profile-import-btn">
        <Text>Import Data</Text>
      </Pressable>
      <Pressable
        testID="profile-history-btn"
        onPress={() => navigation.navigate('History')}
      >
        <Text>View History</Text>
      </Pressable>
    </View>
  );
}
