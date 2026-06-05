import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/theme';

function ProfileButton({ testID }) {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const label = settings?.profile?.avatarEmoji || (settings?.profile?.name?.[0]?.toUpperCase() ?? '?');
  const colors = useTheme();
  const styles = makeStyles(colors);

  return (
    <Pressable
      testID={testID ?? 'profile-btn'}
      onPress={() => navigation.navigate('Profile')}
      style={styles.btn}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    btn: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt2,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    text: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
  });
}

export { ProfileButton };
export default ProfileButton;
