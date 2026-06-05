import React, { useRef, useState } from 'react';
import { TextInput, Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';

function Input({ placeholder, value, onChangeText, testID, variant = 'text', secureTextEntry, right }) {
  const colors = useTheme();
  const styles = makeStyles(colors);
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
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View style={[styles.wrapper, { borderColor }]}>
      <TextInput
        testID={testID}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, right && styles.inputWithRight]}
      />
      {right && <View style={styles.rightSlot}>{right}</View>}
    </Animated.View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      borderWidth: 2,
      borderRadius: 12,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: 12,
      fontSize: 15,
      color: colors.textPrimary,
    },
    inputWithRight: {
      paddingRight: 4,
    },
    rightSlot: {
      paddingRight: 10,
      paddingLeft: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

export { Input };
export default Input;
