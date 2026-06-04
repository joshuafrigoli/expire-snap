import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import RNDateTimePicker from '@react-native-community/datetimepicker';

function DatePicker({ value, onChange, testID }) {
  return (
    <View style={styles.container}>
      <RNDateTimePicker
        testID={testID}
        value={value}
        onChange={onChange}
        mode="date"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
});

export { DatePicker };
export default DatePicker;
