import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';
import * as Notifications from 'expo-notifications';
import i18n from '@/utils/i18n';

const mockItem = (overrides = {}) => ({
  id: 'uuid-001',
  name: 'Fresh Milk',
  category: 'Dairy',
  estimated_expiry_date: '2026-06-10',
  confidence_days: 1,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

const TestConsumer = ({ onRender }) => {
  const ctx = useInventory();
  onRender(ctx);
  return null;
};

describe('InventoryContext', () => {
  beforeEach(() => AsyncStorage.clear());
  afterEach(async () => {
    await act(async () => { await i18n.changeLanguage('en'); });
  });

  it('starts with empty inventory', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx.items).toEqual([]));
  });

  it('addItem appends item and persists to AsyncStorage', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Fresh Milk');
  });

  it('deleteItem removes item by id', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await act(async () => { ctx.deleteItem('uuid-001'); });
    await waitFor(() => expect(ctx.items).toHaveLength(0));
  });

  it('markConsumed sets status to consumed and updates updatedAt', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    const originalUpdatedAt = ctx.items[0].updatedAt;
    await act(async () => { ctx.markConsumed('uuid-001'); });
    await waitFor(() => {
      expect(ctx.items[0].status).toBe('consumed');
      expect(ctx.items[0].updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  it('markWasted sets status to wasted', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await act(async () => { ctx.markWasted('uuid-001'); });
    await waitFor(() => expect(ctx.items[0].status).toBe('wasted'));
  });

  it('updateItem modifies fields on matching id', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await act(async () => { ctx.updateItem('uuid-001', { name: 'Whole Milk' }); });
    await waitFor(() => expect(ctx.items[0].name).toBe('Whole Milk'));
  });

  it('auto-delete purges consumed/wasted items older than autoDeleteDays on load', async () => {
    const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({ autoDeleteDays: 7 }));
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      mockItem({ id: 'old-consumed', status: 'consumed', updatedAt: oldDate }),
      mockItem({ id: 'recent-consumed', status: 'consumed', updatedAt: recentDate }),
      mockItem({ id: 'active-item', status: 'active', updatedAt: oldDate }),
    ]));
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => {
      const ids = ctx.items.map(i => i.id);
      expect(ids).not.toContain('old-consumed');
      expect(ids).toContain('recent-consumed');
      expect(ids).toContain('active-item');
    });
  });

  it('auto-delete skips purge when autoDeleteDays is never', async () => {
    const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({ autoDeleteDays: 'never' }));
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      mockItem({ id: 'old-consumed', status: 'consumed', updatedAt: oldDate }),
    ]));
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => {
      expect(ctx.items.map(i => i.id)).toContain('old-consumed');
    });
  });

  it('reschedules all active notifications when language changes', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());

    await act(async () => {
      await ctx.addItem(mockItem({ id: 'item-reschedule', name: 'Cheese' }));
    });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    // addItem called scheduleNotificationAsync once; item now has notificationId 'notification-id-123'

    jest.clearAllMocks();

    await act(async () => {
      await i18n.changeLanguage('it');
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('does not reschedule consumed/wasted items when language changes', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());

    await act(async () => {
      await ctx.addItem(mockItem({ id: 'item-consumed', name: 'OldMilk' }));
    });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    await act(async () => { await ctx.markConsumed('item-consumed'); });
    await waitFor(() => expect(ctx.items[0].status).toBe('consumed'));

    jest.clearAllMocks();

    await act(async () => {
      await i18n.changeLanguage('it');
    });

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('clearExpired marks expired active items as wasted and leaves fresh items active', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem({ id: 'exp-1', estimated_expiry_date: '2020-01-01' })); });
    await act(async () => { ctx.addItem(mockItem({ id: 'fresh-1', estimated_expiry_date: '2099-01-01' })); });
    await waitFor(() => expect(ctx.items).toHaveLength(2));
    await act(async () => { ctx.clearExpired(); });
    await waitFor(() => {
      expect(ctx.items.find(i => i.id === 'exp-1').status).toBe('wasted');
      expect(ctx.items.find(i => i.id === 'fresh-1').status).toBe('active');
    });
  });

  it('clearExpired cancels notifications for expired items', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem({ id: 'exp-2', estimated_expiry_date: '2020-01-01' })); });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    jest.clearAllMocks();
    await act(async () => { ctx.clearExpired(); });
    await waitFor(() => {
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
    });
  });

  it('clearExpired does not change status of consumed items', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem({ id: 'cons-1', estimated_expiry_date: '2020-01-01' })); });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    await act(async () => { ctx.markConsumed('cons-1'); });
    await waitFor(() => expect(ctx.items[0].status).toBe('consumed'));
    await act(async () => { ctx.clearExpired(); });
    await waitFor(() => expect(ctx.items[0].status).toBe('consumed'));
  });
});
