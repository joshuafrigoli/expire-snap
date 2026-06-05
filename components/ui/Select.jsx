import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, Animated, StyleSheet, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePortal } from '@/context/PortalContext';
import { useTheme } from '@/theme';

let _seq = 0;

function Select({ label, value, options = [], onChange, testID }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors);
  const [open, setOpen] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const portal = usePortal();
  const portalKey = useRef(`select-${_seq++}`).current;

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    Animated.timing(borderAnim, { toValue: open ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [open]);

  useEffect(() => {
    if (!open) {
      portal.unmount(portalKey);
      return;
    }
    const s = makeStyles(colors);
    portal.mount(
      portalKey,
      <Pressable key={portalKey} style={s.backdrop} onPress={() => setOpen(false)}>
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.handle} />
          {label ? <Text style={s.sheetTitle}>{label}</Text> : null}
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            renderItem={({ item }) => (
              <Pressable
                style={[s.option, item.value === value && s.optionActive]}
                onPress={() => {
                  onChange && onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text style={[s.optionText, item.value === value && s.optionTextActive]}>
                  {item.label}
                </Text>
                {item.value === value && <Text style={s.check}>✓</Text>}
              </Pressable>
            )}
          />
        </View>
      </Pressable>,
    );
    return () => portal.unmount(portalKey);
  }, [open, colors, label, options, value, onChange, insets.bottom]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View style={[styles.trigger, { borderColor }]}>
        <Pressable testID={testID} style={styles.triggerPressable} onPress={() => setOpen(true)}>
          <Text style={styles.selectedText}>{selectedLabel}</Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors) {
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
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'flex-end',
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
      maxHeight: '70%',
      minHeight: 180,
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
