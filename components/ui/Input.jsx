import React, { useRef, useState } from 'react';
import { TextInput, Animated, StyleSheet } from 'react-native';

function Input({ placeholder, value, onChangeText, testID, variant = 'text', secureTextEntry }) {
  const isSecure = variant === 'password' ? true : !!secureTextEntry;
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  function handleFocus() {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  }

  function handleBlur() {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#001a3d', '#005bc4'],
  });

  return (
    <Animated.View style={[styles.wrapper, { borderColor }]}>
      <TextInput
        testID={testID}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={styles.input}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  input: {
    padding: 12,
    fontSize: 15,
    color: '#001a3d',
  },
});

export { Input };
export default Input;
