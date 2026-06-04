import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Card, Select, DatePicker, FloatingActionButton, FilterTabs, Spinner, Modal, SkeletonBlock } from '@/components/ui';

describe('Card', () => {
  it('renders children without crash', () => {
    const { getByText } = render(<Card><Text>content</Text></Card>);
    expect(getByText('content')).toBeTruthy();
  });
});

describe('Select', () => {
  it('renders selected value without crash', () => {
    const { getByText } = render(
      <Select label="Provider" value="openai" options={[{ label: 'OpenAI', value: 'openai' }, { label: 'Gemini', value: 'gemini' }]} onChange={() => {}} />
    );
    expect(getByText('OpenAI')).toBeTruthy();
  });
  it('renders testID without crash', () => {
    const { getByTestId } = render(
      <Select testID="sel" label="Provider" value="openai" options={[{ label: 'OpenAI', value: 'openai' }, { label: 'Gemini', value: 'gemini' }]} onChange={() => {}} />
    );
    expect(getByTestId('sel')).toBeTruthy();
  });
});

describe('DatePicker', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(
      <DatePicker testID="dp" value={new Date('2026-06-10')} onChange={() => {}} />
    );
    expect(getByTestId('dp')).toBeTruthy();
  });
});

describe('FloatingActionButton', () => {
  it('renders and fires onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FloatingActionButton testID="fab" onPress={onPress} />);
    fireEvent.press(getByTestId('fab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('FilterTabs', () => {
  const tabs = ['All', 'Dairy', 'Meat & Fish'];
  it('renders all tab labels', () => {
    const { getByTestId } = render(
      <FilterTabs tabs={tabs} activeTab="All" onTabPress={() => {}} />
    );
    tabs.forEach(tab => expect(getByTestId(`filter-tab-${tab}`)).toBeTruthy());
  });
  it('fires onTabPress with tab name', () => {
    const onTabPress = jest.fn();
    const { getByTestId } = render(
      <FilterTabs tabs={tabs} activeTab="All" onTabPress={onTabPress} />
    );
    fireEvent.press(getByTestId('filter-tab-Dairy'));
    expect(onTabPress).toHaveBeenCalledWith('Dairy');
  });
});

describe('Spinner', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(<Spinner testID="spinner" />);
    expect(getByTestId('spinner')).toBeTruthy();
  });
});

describe('Modal', () => {
  it('renders children when visible', () => {
    const { getByText } = render(<Modal visible><Text>Loading</Text></Modal>);
    expect(getByText('Loading')).toBeTruthy();
  });
  it('does not render children when not visible', () => {
    const { queryByText } = render(<Modal visible={false}><Text>Hidden</Text></Modal>);
    expect(queryByText('Hidden')).toBeNull();
  });
});

describe('SkeletonBlock', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(<SkeletonBlock testID="skeleton" />);
    expect(getByTestId('skeleton')).toBeTruthy();
  });
});
