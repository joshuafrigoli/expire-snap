import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopAppBar } from '@/components/ui';

describe('TopAppBar', () => {
  it('renders page title', () => {
    const { getByText } = render(<TopAppBar title="Dashboard" />);
    expect(getByText('Dashboard')).toBeTruthy();
  });

  it('renders profile avatar button', () => {
    const { getByTestId } = render(<TopAppBar title="X" avatarEmoji="🍕" />);
    expect(getByTestId('topbar-profile-btn')).toBeTruthy();
  });

  it('fires onProfilePress when avatar button tapped', () => {
    const onProfilePress = jest.fn();
    const { getByTestId } = render(
      <TopAppBar title="X" avatarEmoji="🍕" onProfilePress={onProfilePress} />
    );
    fireEvent.press(getByTestId('topbar-profile-btn'));
    expect(onProfilePress).toHaveBeenCalledTimes(1);
  });

  it('renders back button only when onBack provided', () => {
    const { queryByTestId, rerender } = render(<TopAppBar title="X" />);
    expect(queryByTestId('topbar-back-btn')).toBeNull();
    rerender(<TopAppBar title="X" onBack={() => {}} />);
    expect(queryByTestId('topbar-back-btn')).toBeTruthy();
  });

  it('does not render hamburger or extra nav items', () => {
    const { queryByTestId } = render(<TopAppBar title="X" />);
    expect(queryByTestId('topbar-hamburger')).toBeNull();
  });
});
