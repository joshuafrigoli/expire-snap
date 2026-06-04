import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function FloatingActionButton({ testID, onPress, icon }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={styles.button}
    >
      {icon ? icon : <Text style={styles.plus}>+</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#005bc4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 28,
  },
});

export { FloatingActionButton };
export default FloatingActionButton;
