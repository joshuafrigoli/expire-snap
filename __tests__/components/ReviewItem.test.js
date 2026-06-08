import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReviewItem from '@/components/ReviewItem';

const baseItem = {
  id: 'uuid-001',
  name: 'Fresh Milk',
  estimated_expiry_date: '2026-06-15',
  confidence_days: 2,
};

describe('ReviewItem', () => {
  it('renders item name in editable field', () => {
    const { getByDisplayValue } = render(
      <ReviewItem item={baseItem} onChange={() => {}} onDelete={() => {}} />
    );
    expect(getByDisplayValue('Fresh Milk')).toBeTruthy();
  });

  it('renders days-left label based on expiry date', () => {
    const { getByText } = render(
      <ReviewItem item={baseItem} onChange={() => {}} onDelete={() => {}} />
    );
    expect(getByText(/days\.daysLeft|days\.today|days\.tomorrow|days\.expired/)).toBeTruthy();
  });

  it('calls onChange when name edited', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <ReviewItem item={baseItem} onChange={onChange} onDelete={() => {}} />
    );
    fireEvent.changeText(getByDisplayValue('Fresh Milk'), 'Whole Milk');
    expect(onChange).toHaveBeenCalledWith('uuid-001', { name: 'Whole Milk' });
  });

  it('calls onDelete when delete pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <ReviewItem item={baseItem} onChange={() => {}} onDelete={onDelete} />
    );
    fireEvent.press(getByTestId('review-item-delete-uuid-001'));
    expect(onDelete).toHaveBeenCalledWith('uuid-001');
  });
});
