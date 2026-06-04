import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '@/components/ui';

describe('ProgressBar', () => {
  it('renders with height >= 16', () => {
    const { getByTestId } = render(<ProgressBar testID="pb" value={50} max={100} color="safe" />);
    const style = getByTestId('pb').props.style;
    const height = Array.isArray(style) ? style.find(s => s?.height)?.height : style?.height;
    expect(height).toBeGreaterThanOrEqual(16);
  });

  it('fill width equals value/max ratio', () => {
    const { getByTestId } = render(
      <ProgressBar value={25} max={100} color="safe" fillTestID="fill" />
    );
    const fill = getByTestId('fill');
    expect(fill.props.style).toMatchObject(expect.objectContaining({ width: '25%' }));
  });
});
