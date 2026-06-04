import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function FilterTabs({ tabs, activeTab, onTabPress }) {
  const [scrolledLeft, setScrolledLeft] = useState(false);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        scrollEventThrottle={16}
        onScroll={(e) => setScrolledLeft(e.nativeEvent.contentOffset.x > 2)}
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
      {scrolledLeft && (
        <LinearGradient
          colors={['#eff6ff', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeLeft}
          pointerEvents="none"
        />
      )}
      <LinearGradient
        colors={['transparent', '#eff6ff']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fadeRight}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    overflow: 'hidden',
  },
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
  pillActive: { backgroundColor: '#005bc4' },
  pillInactive: { backgroundColor: '#e2e8f0' },
  label: { fontSize: 14 },
  labelActive: { color: '#ffffff' },
  labelInactive: { color: '#64748b' },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    pointerEvents: 'none',
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    pointerEvents: 'none',
  },
});

export { FilterTabs };
export default FilterTabs;
