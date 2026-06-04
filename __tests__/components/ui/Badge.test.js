import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '@/components/ui';

describe('Badge', () => {
  it.each(['danger', 'warning', 'safe', 'neutral'])('renders %s variant', (variant) => {
    const { getByText } = render(<Badge label="Dairy" variant={variant} />);
    expect(getByText('Dairy')).toBeTruthy();
  });
});
