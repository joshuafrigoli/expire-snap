import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function Spinner({ testID }) {
  return (
    <View testID={testID} style={styles.container}>
      <ActivityIndicator color="#005bc4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { Spinner };
export default Spinner;
