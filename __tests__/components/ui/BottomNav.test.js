import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BottomNav } from '@/components/ui';

const TABS = ['Home', 'Scan', 'Fridge', 'Settings'];

describe('BottomNav', () => {
  it('renders exactly 4 tabs: Home, Scan, Fridge, Settings', () => {
    const { getByText } = render(<BottomNav activeTab="Home" onTabPress={() => {}} />);
    TABS.forEach(tab => expect(getByText(tab)).toBeTruthy());
  });

  it('does not render History tab', () => {
    const { queryByText } = render(<BottomNav activeTab="Home" onTabPress={() => {}} />);
    expect(queryByText('History')).toBeNull();
  });

  it('calls onTabPress with correct tab name', () => {
    const onTabPress = jest.fn();
    const { getByText } = render(<BottomNav activeTab="Home" onTabPress={onTabPress} />);
    fireEvent.press(getByText('Fridge'));
    expect(onTabPress).toHaveBeenCalledWith('Fridge');
  });
});
