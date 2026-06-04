import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InventoryItem from '@/components/InventoryItem';

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

describe('InventoryItem', () => {
  it('renders name and category badge', () => {
    const { getByText } = render(
      <InventoryItem name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} />
    );
    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Dairy')).toBeTruthy();
  });

  it('renders days remaining countdown', () => {
    const { getByTestId } = render(
      <InventoryItem name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} />
    );
    expect(getByTestId('item-countdown')).toHaveTextContent('5');
  });

  it('shows danger color when expired', () => {
    const { getByTestId } = render(
      <InventoryItem name="Meat" category="Meat & Fish" estimated_expiry_date={daysFromNow(-1)} />
    );
    expect(getByTestId('item-progress').props.color).toBe('danger');
  });

  it('shows warning color when expiring within 3 days', () => {
    const { getByTestId } = render(
      <InventoryItem name="Meat" category="Meat & Fish" estimated_expiry_date={daysFromNow(2)} />
    );
    expect(getByTestId('item-progress').props.color).toBe('warning');
  });

  it('shows safe color when more than 3 days remaining', () => {
    const { getByTestId } = render(
      <InventoryItem name="Rice" category="Pantry" estimated_expiry_date={daysFromNow(60)} />
    );
    expect(getByTestId('item-progress').props.color).toBe('safe');
  });

  it('renders consume and waste action buttons', () => {
    const { getByTestId } = render(
      <InventoryItem id="1" name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} onConsume={() => {}} onWaste={() => {}} />
    );
    expect(getByTestId('item-consume-btn-1')).toBeTruthy();
    expect(getByTestId('item-waste-btn-1')).toBeTruthy();
  });

  it('fires onConsume with item id when consume button pressed', () => {
    const onConsume = jest.fn();
    const { getByTestId } = render(
      <InventoryItem id="1" name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} onConsume={onConsume} onWaste={() => {}} />
    );
    fireEvent.press(getByTestId('item-consume-btn-1'));
    expect(onConsume).toHaveBeenCalledWith('1');
  });

  it('fires onWaste with item id when waste button pressed', () => {
    const onWaste = jest.fn();
    const { getByTestId } = render(
      <InventoryItem id="1" name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} onConsume={() => {}} onWaste={onWaste} />
    );
    fireEvent.press(getByTestId('item-waste-btn-1'));
    expect(onWaste).toHaveBeenCalledWith('1');
  });
});
