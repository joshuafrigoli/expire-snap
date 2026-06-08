import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, useScheme } from '@/theme';

function DatePicker({ value, onChange, testID }) {
  const colors = useTheme();
  const scheme = useScheme();
  const styles = makeStyles(colors);
  const [show, setShow] = useState(false);

  const formatted = value
    ? value.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  function handleChange(event, selectedDate) {
    setShow(Platform.OS === 'ios');
    onChange(event, selectedDate);
  }

  return (
    <View>
      <Pressable
        testID={testID}
        onPress={() => setShow(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{formatted}</Text>
      </Pressable>

      {show && (
        <RNDateTimePicker
          testID={testID + '-picker'}
          value={value ?? new Date()}
          onChange={handleChange}
          mode="date"
          minimumDate={new Date()}
          accentColor={colors.primary}
          textColor={colors.textPrimary}
          themeVariant={scheme}
        />
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    trigger: {
      backgroundColor: colors.bg,
      borderWidth: 2,
      borderColor: colors.borderLight,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    triggerText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });
}

export { DatePicker };
export default DatePicker;
