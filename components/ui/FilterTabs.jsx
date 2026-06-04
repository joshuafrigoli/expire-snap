import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function FilterTabs({ tabs, activeTab, onTabPress }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            testID={`filter-tab-${tab}`}
            onPress={() => onTabPress(tab)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pill: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#005bc4',
  },
  pillInactive: {
    backgroundColor: '#e2e8f0',
  },
  label: {
    fontSize: 14,
  },
  labelActive: {
    color: '#ffffff',
  },
  labelInactive: {
    color: '#64748b',
  },
});

export { FilterTabs };
export default FilterTabs;
