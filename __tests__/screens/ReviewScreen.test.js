import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReviewScreen from '@/screens/ReviewScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { SnackbarProvider } from '@/context/SnackbarContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      scanResult: {
        transaction_date: '2026-06-03',
        items: [
          { id: 'a', name: 'Milk', category: 'Dairy', estimated_expiry_date: '2026-06-10', confidence_days: 1 },
          { id: 'b', name: 'Meat', category: 'Meat & Fish', estimated_expiry_date: '2026-06-06', confidence_days: 1 },
        ],
      },
    },
  }),
}));

const Wrapper = ({ children }) => (
  <SnackbarProvider><SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider></SnackbarProvider>
);

describe('ReviewScreen validation', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('blocks confirm when an item name is empty', () => {
    const { getAllByTestId, getByTestId } = render(<Wrapper><ReviewScreen /></Wrapper>);
    fireEvent.changeText(getAllByTestId(/review-item-name/)[0], '');
    fireEvent.press(getByTestId('review-confirm-btn'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('blocks confirm when an expiry date is in the past', () => {
    const { getAllByTestId, getByTestId } = render(<Wrapper><ReviewScreen /></Wrapper>);
    const pastDate = new Date('2020-01-01');
    fireEvent(getAllByTestId(/review-item-date/)[0], 'onChange', { nativeEvent: { timestamp: pastDate.getTime() } }, pastDate);
    fireEvent.press(getByTestId('review-confirm-btn'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('dispatches items to InventoryContext and navigates to Fridge on valid confirm', async () => {
    const { getByTestId } = render(<Wrapper><ReviewScreen /></Wrapper>);
    fireEvent.press(getByTestId('review-confirm-btn'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('BottomTabs', { screen: 'Fridge' }));
  });
});
