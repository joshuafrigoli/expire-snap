import React from 'react';
import { View } from 'react-native';
import InventoryList from '@/components/InventoryList';
import { FloatingActionButton } from '@/components/ui';

export default function FridgeScreen() {
  return (
    <View testID="screen-fridge">
      <InventoryList />
      <FloatingActionButton testID="fridge-fab" onPress={() => {}} />
    </View>
  );
}
