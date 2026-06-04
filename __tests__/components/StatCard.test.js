import React from 'react';
import { render } from '@testing-library/react-native';
import StatCard from '@/components/StatCard';

describe('StatCard', () => {
  it('renders label and count', () => {
    const { getByText } = render(<StatCard label="Expired" count={3} variant="danger" />);
    expect(getByText('Expired')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it.each(['danger', 'warning', 'safe'])('renders variant %s', (variant) => {
    const { getByTestId } = render(<StatCard testID="card" label="X" count={0} variant={variant} />);
    expect(getByTestId('card')).toBeTruthy();
  });
});
