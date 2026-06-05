import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';

const TABS = ['Home', 'Scan', 'Fridge', 'Settings'];

function BottomNav({ activeTab, onTabPress }) {
  const colors = useTheme();
  const styles = makeStyles(colors);

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

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.inactive,
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
      color: colors.tabActive,
    },
    inactive: {
      color: colors.tabInactive,
    },
  });
}

export { BottomNav };
export default BottomNav;
