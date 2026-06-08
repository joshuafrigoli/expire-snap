import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme, useScheme } from '@/theme';

function DatePicker({ value, onChange, testID }) {
  const colors = useTheme();
  const scheme = useScheme();
  const styles = makeStyles(colors);
  const [show, setShow] = useState(false);

  const formatted = value
    ? value.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const todayString = new Date().toISOString().split('T')[0];
  const selectedString = value ? value.toISOString().split('T')[0] : undefined;

  function handleDayPress(day) {
    const date = new Date(day.dateString + 'T00:00:00');
    onChange({}, date);
    setShow(false);
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

      <Modal
        visible={show}
        transparent
        animationType="slide"
        onRequestClose={() => setShow(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShow(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Calendar
              testID={testID + '-picker'}
              current={selectedString ?? todayString}
              minDate={todayString}
              markedDates={
                selectedString
                  ? { [selectedString]: { selected: true, disableTouchEvent: true } }
                  : {}
              }
              onDayPress={handleDayPress}
              theme={calendarTheme(colors, scheme)}
              style={styles.calendar}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function calendarTheme(colors, scheme) {
  return {
    backgroundColor: colors.surface,
    calendarBackground: colors.surface,
    textSectionTitleColor: colors.textSecondary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.primaryFg,
    todayTextColor: colors.primary,
    todayBackgroundColor: colors.surfaceAlt2,
    dayTextColor: colors.textPrimary,
    textDisabledColor: colors.textMuted,
    dotColor: colors.primary,
    selectedDotColor: colors.primaryFg,
    arrowColor: colors.primary,
    disabledArrowColor: colors.textMuted,
    monthTextColor: colors.textPrimary,
    indicatorColor: colors.primary,
    textDayFontWeight: '500',
    textMonthFontWeight: '700',
    textDayHeaderFontWeight: '600',
    textDayFontSize: 15,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13,
  };
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
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.backdrop,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderBottomWidth: 0,
      borderColor: colors.border,
      paddingBottom: 24,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.handle,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    calendar: {
      borderRadius: 0,
    },
  });
}

export { DatePicker };
export default DatePicker;
