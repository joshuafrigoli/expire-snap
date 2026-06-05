import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, FlatList, Animated, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '@/theme';

function Select({ label, value, options = [], onChange, testID }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, insets.bottom);
  const [open, setOpen] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    Animated.timing(borderAnim, { toValue: open ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [open]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  async function handleShow() {
    if (Platform.OS !== 'android') return;
    try { await NavigationBar.setBackgroundColorAsync(colors.surface); } catch (_) {}
  }

  function handleSelect(opt) {
    onChange && onChange(opt.value);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Animated.View style={[styles.trigger, { borderColor }]}>
        <Pressable testID={testID} style={styles.triggerPressable} onPress={() => setOpen(true)}>
          <Text style={styles.selectedText}>{selectedLabel}</Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
      </Animated.View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
        onShow={handleShow}
      >
        {/* Full-screen backdrop — tap anywhere outside sheet closes dropdown */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        {/* Sheet container pinned to absolute bottom of window.
            In Android edge-to-edge, bottom:0 reaches the true screen bottom
            (behind nav bar), so navBarFill covers the 3-button area. */}
        <View style={styles.sheetContainer} pointerEvents="box-none">
          <View style={styles.sheet}>
            <View style={styles.handle} />
            {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value && <Text style={styles.check}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
          {/* Solid fill that covers the system navigation bar area */}
          <View style={styles.navBarFill} />
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors, bottomInset) {
  return StyleSheet.create({
    container: { marginVertical: 4 },
    label: { fontSize: 14, marginBottom: 4, color: colors.textSecondary, fontWeight: '600' },
    trigger: {
      borderWidth: 2,
      borderRadius: 12,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    triggerPressable: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedText: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
    chevron: { fontSize: 16, color: colors.primary, fontWeight: '700', paddingLeft: 8, transform: [{ scaleX: 1.6 }] },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.backdrop,
    },
    sheetContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 2,
      borderColor: colors.border,
      paddingBottom: 12,
      maxHeight: '70%',
      minHeight: 180,
    },
    navBarFill: {
      backgroundColor: colors.surface,
      // bottomInset = nav bar height when edge-to-edge insets are applied.
      // 80 fallback safely covers any Android 3-button or gesture nav bar.
      height: bottomInset > 0 ? bottomInset : 80,
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
    sheetTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.inactive,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    optionActive: { backgroundColor: colors.bg },
    optionText: { fontSize: 15, color: colors.textPrimary },
    optionTextActive: { fontWeight: '700', color: colors.primary },
    check: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  });
}

export { Select };
export default Select;
