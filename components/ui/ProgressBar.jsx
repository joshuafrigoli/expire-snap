import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';

function ProgressBar({ value, max, color, testID, fillTestID }) {
  const colors = useTheme();
  const colorMap = makeColorMap(colors);
  const percent = Math.round((value / max) * 100);

  return (
    <View
      testID={testID}
      color={color}
      style={[{
        height: 16,
        backgroundColor: colors.inactive,
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
      }]}
    >
      <View
        testID={fillTestID}
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: colorMap[color],
        }}
      />
    </View>
  );
}

function makeColorMap(colors) {
  return {
    danger: colors.danger,
    warning: colors.warningBar,
    safe: colors.successBar,
  };
}

export { ProgressBar };
export default ProgressBar;
