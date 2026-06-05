import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

function FloatingActionButton({ testID, onPress, icon, style }) {
  const colors = useTheme();
  const styles = makeStyles(colors);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.button, style]}
    >
      {icon ? icon : <Ionicons name="scan" size={24} color={colors.primaryFg} />}
    </Pressable>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  });
}

export { FloatingActionButton };
export default FloatingActionButton;
