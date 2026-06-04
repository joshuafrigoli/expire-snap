import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
};

function getInitials(name) {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function Avatar({ emoji, name, size = 'md', testID }) {
  const dimension = SIZES[size] ?? SIZES.md;
  const borderRadius = dimension / 2;
  const fontSize = dimension * 0.4;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { width: dimension, height: dimension, borderRadius, backgroundColor: '#bfdbfe' },
      ]}
    >
      {emoji ? (
        <Text style={{ fontSize }}>{emoji}</Text>
      ) : name ? (
        <Text style={{ fontSize, fontWeight: '600', color: '#1e3a5f' }}>
          {getInitials(name)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export { Avatar };
export default Avatar;
