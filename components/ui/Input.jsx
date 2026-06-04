import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function Input({
  placeholder,
  value,
  onChangeText,
  testID,
  variant = 'text',
  secureTextEntry,
}) {
  const isSecure = variant === 'password' ? true : !!secureTextEntry;

  return (
    <TextInput
      testID={testID}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={isSecure}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
});

export { Input };
export default Input;
