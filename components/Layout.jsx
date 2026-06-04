import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopAppBar } from '@/components/ui';

function Layout({ children, title, onBack }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eff6ff' }}>
      <TopAppBar title={title} onBack={onBack} />
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export { Layout };
export default Layout;
