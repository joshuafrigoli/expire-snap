import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '@/components/ui';

describe('Avatar', () => {
  it('renders emoji', () => {
    const { getByText } = render(<Avatar emoji="🍕" size="md" />);
    expect(getByText('🍕')).toBeTruthy();
  });

  it('renders initials when no emoji', () => {
    const { getByText } = render(<Avatar name="Josh Frigoli" size="md" />);
    expect(getByText('JF')).toBeTruthy();
  });

  it.each(['sm', 'md', 'lg'])('renders size %s', (size) => {
    const { getByTestId } = render(<Avatar testID="avatar" emoji="🧑" size={size} />);
    expect(getByTestId('avatar')).toBeTruthy();
  });
});
