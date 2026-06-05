import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

function Spinner({ testID }) {
  const colors = useTheme();
  const styles = makeStyles(colors);

  return (
    <View testID={testID} style={styles.container}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

export { Spinner };
export default Spinner;
