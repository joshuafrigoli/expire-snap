import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('renders label text', () => {
    const { getByText } = render(<Button label="Add Item" />);
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Tap me" onPress={onPress} />);
    fireEvent.press(getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<Button testID="btn" label="Tap" onPress={onPress} disabled />);
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each(['primary', 'secondary', 'ghost'])('renders variant %s without crash', (variant) => {
    const { getByText } = render(<Button label="X" variant={variant} />);
    expect(getByText('X')).toBeTruthy();
  });

  it.each(['sm', 'md', 'lg'])('renders size %s without crash', (size) => {
    const { getByText } = render(<Button label="X" size={size} />);
    expect(getByText('X')).toBeTruthy();
  });
});
