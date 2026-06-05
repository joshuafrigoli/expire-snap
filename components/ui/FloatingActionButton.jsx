import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function FloatingActionButton({ testID, onPress, icon, style }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.button, style]}
    >
      {icon ? icon : <Ionicons name="scan" size={24} color="#fff" />}
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
    borderWidth: 2,
    borderColor: '#001a3d',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});

export { FloatingActionButton };
export default FloatingActionButton;
