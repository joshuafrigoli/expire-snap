import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Snackbar } from '@/components/ui';

describe('Snackbar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders message when visible', () => {
    const { getByTestId } = render(<Snackbar message="Item saved" visible variant="success" />);
    expect(getByTestId('snackbar-message').props.children).toMatch('Item saved');
  });

  it('calls onDismiss after 3 seconds', () => {
    const onDismiss = jest.fn();
    render(<Snackbar message="Done" visible variant="info" onDismiss={onDismiss} />);
    act(() => jest.advanceTimersByTime(3000));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<Snackbar message="Hidden" visible={false} variant="info" />);
    expect(queryByText('Hidden')).toBeNull();
  });
});
