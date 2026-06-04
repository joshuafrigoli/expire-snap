import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import InventoryList from '@/components/InventoryList';
import { FloatingActionButton } from '@/components/ui';

export default function FridgeScreen() {
  const { t } = useTranslation();
  return (
    <View testID="screen-fridge">
      <InventoryList />
      <FloatingActionButton testID="fridge-fab" onPress={() => {}} />
    </View>
  );
}
