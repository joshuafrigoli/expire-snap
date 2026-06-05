import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function FilterTabs({ tabs, activeTab, onTabPress }) {
  const [scrollX, setScrollX] = useState(0);
  const [viewW, setViewW] = useState(0);
  const [contentW, setContentW] = useState(0);

  const showLeftFade = scrollX > 2;
  const showRightFade = contentW > viewW && scrollX + viewW < contentW - 2;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        onLayout={(e) => setViewW(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentW(w)}
      >
        {tabs.map((tab) => {
          const value = typeof tab === 'object' ? tab.value : tab;
          const label = typeof tab === 'object' ? tab.label : tab;
          const isActive = value === activeTab;
          return (
            <Pressable
              key={value}
              testID={`filter-tab-${value}`}
              onPress={() => onTabPress(value)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            >
              <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showLeftFade && (
        <LinearGradient
          colors={['#eff6ff', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeLeft}
          pointerEvents="none"
        />
      )}
      {showRightFade && (
        <LinearGradient
          colors={['transparent', '#eff6ff']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeRight}
          pointerEvents="none"
        />
      )}
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
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
});

export { FilterTabs };
export default FilterTabs;
