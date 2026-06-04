import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function Card({ children, style }) {
  return (
    <Shadow offset={[4, 4]} startColor="#001a3d" distance={0}>
      <View style={[styles.card, style]}>
        {children}
      </View>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#001a3d',
    padding: 16,
  },
});

export { Card };
export default Card;
