import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function TopAppBar({ title, onBack, avatarEmoji, onProfilePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable testID="topbar-back-btn" onPress={onBack} style={styles.btn}>
            <Text style={styles.btnText}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.right}>
        <Pressable testID="topbar-profile-btn" onPress={onProfilePress} style={styles.btn}>
          <Text style={styles.btnText}>{avatarEmoji || '👤'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  btn: {
    padding: 4,
  },
  btnText: {
    fontSize: 20,
  },
});

export { TopAppBar };
export default TopAppBar;
