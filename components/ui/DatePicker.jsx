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
        <Text style={styles.triggerIcon}>📅</Text>
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
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    triggerText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    triggerIcon: {
      fontSize: 16,
    },
  });
}

export { DatePicker };
export default DatePicker;
