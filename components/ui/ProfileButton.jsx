import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '@/context/SettingsContext';

function ProfileButton({ testID }) {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const label = settings?.profile?.avatarEmoji || (settings?.profile?.name?.[0]?.toUpperCase() ?? '?');

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

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#001a3d',
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005bc4',
  },
});

export { ProfileButton };
export default ProfileButton;
