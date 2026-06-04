import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const VARIANTS = {
  primary: {
    backgroundColor: '#005bc4',
    textColor: '#ffffff',
    borderColor: '#001a3d',
  },
  secondary: {
    backgroundColor: '#ffffff',
    textColor: '#005bc4',
    borderColor: '#001a3d',
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: '#005bc4',
    borderColor: 'transparent',
  },
};

const SIZES = {
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
  },
  lg: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    fontSize: 17,
  },
};

function Button({
  label,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  testID,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={disabled ? undefined : onPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        accessibilityState={{ disabled }}
        style={[
          styles.base,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
          },
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
            },
            disabled && styles.disabledText,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {},
});

export { Button };
export default Button;
