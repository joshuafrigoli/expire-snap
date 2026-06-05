import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, ProgressBar } from '@/components/ui';
import { CATEGORY_I18N_KEY } from '@/constants/categories';
import { useTheme } from '@/theme';

function computeDaysLeft(estimated_expiry_date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(estimated_expiry_date);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86400000);
}

function getProgressColor(daysLeft) {
  if (daysLeft < 0) return 'danger';
  if (daysLeft <= 3) return 'warning';
  return 'safe';
}

export function InventoryItem({ id, name, category, estimated_expiry_date, onConsume, onWaste }) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = makeStyles(colors);
  const daysLeft = computeDaysLeft(estimated_expiry_date);
  const progressColor = getProgressColor(daysLeft);

  const COLOR_MAP = {
    danger: { bg: colors.dangerBg, text: colors.danger },
    warning: { bg: colors.warningBg, text: colors.warningText },
    safe: { bg: colors.successBg, text: colors.success },
  };
  const countdownColors = COLOR_MAP[progressColor] ?? COLOR_MAP.safe;

  return (
    <View style={styles.card}>
      <View style={styles.row1}>
        <Text style={styles.name}>{name}</Text>
        <Badge label={t(CATEGORY_I18N_KEY[category] ?? `categories.${category}`, { defaultValue: category })} variant={progressColor} />
      </View>

      <ProgressBar
        testID="item-progress"
        color={progressColor}
        value={Math.max(0, daysLeft)}
        max={30}
        fillTestID="item-progress-fill"
        style={styles.progressBar}
      />

      <View style={styles.row3}>
        <View style={styles.countdownWrapper}>
          <Text testID="item-countdown" style={[styles.countdownNumber, { color: countdownColors.text }]}>
            {daysLeft}
          </Text>
          <Text style={[styles.countdownLabel, { color: countdownColors.text }]}>
            {t('days.unit')}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            testID={"item-consume-btn-" + id}
            onPress={() => onConsume && onConsume(id)}
            style={({ pressed }) => [styles.pillBtn, styles.consumeBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.consumeBtnText}>{t('actions.consume')}</Text>
          </Pressable>

          <Pressable
            testID={"item-waste-btn-" + id}
            onPress={() => onWaste && onWaste(id)}
            style={({ pressed }) => [styles.pillBtn, styles.wasteBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.wasteBtnText}>{t('actions.waste')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    row1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      flexShrink: 1,
      marginRight: 8,
    },
    progressBar: {
      marginBottom: 8,
    },
    row3: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    countdownWrapper: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    countdownNumber: {
      fontSize: 20,
      fontWeight: '700',
    },
    countdownLabel: {
      fontSize: 13,
      fontWeight: '500',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    pillBtn: {
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    consumeBtn: {
      backgroundColor: colors.successBg,
    },
    consumeBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success,
    },
    wasteBtn: {
      backgroundColor: colors.dangerBg,
    },
    wasteBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.danger,
    },
    btnPressed: {
      opacity: 0.75,
      shadowOffset: { width: 1, height: 1 },
      elevation: 1,
    },
  });
}

export default InventoryItem;
