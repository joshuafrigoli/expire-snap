import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui';

describe('Input', () => {
  it('renders placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Type here" value="" onChangeText={() => {}} />);
    expect(getByPlaceholderText('Type here')).toBeTruthy();
  });

  it('calls onChangeText with new value', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<Input testID="input" value="" onChangeText={onChange} />);
    fireEvent.changeText(getByTestId('input'), 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });
});
