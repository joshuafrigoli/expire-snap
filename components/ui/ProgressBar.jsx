import React from 'react';
import { View } from 'react-native';

const colorMap = {
  danger: '#dc2626',
  warning: '#f59e0b',
  safe: '#22c55e',
};

function ProgressBar({ value, max, color, testID, fillTestID }) {
  const percent = Math.round((value / max) * 100);

  return (
    <View
      testID={testID}
      color={color}
      style={[{
        height: 16,
        backgroundColor: '#e2e8f0',
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

export { ProgressBar };
export default ProgressBar;
