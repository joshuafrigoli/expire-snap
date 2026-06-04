import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const TABS = ['Home', 'Scan', 'Fridge', 'Settings'];

const PRIMARY = '#005bc4';
const INACTIVE = '#64748b';

function BottomNav({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => onTabPress(tab)}
          >
            <Text style={[styles.label, isActive ? styles.active : styles.inactive]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  active: {
    color: PRIMARY,
  },
  inactive: {
    color: INACTIVE,
  },
});

export { BottomNav };
export default BottomNav;
