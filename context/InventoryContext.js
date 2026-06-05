import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleExpiryNotification, cancelExpiryNotification } from '@/utils/notifications';

const STORAGE_KEY = 'expiresnap_inventory';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const [inventoryRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem('expiresnap_settings'),
      ]);

      let loaded = inventoryRaw ? JSON.parse(inventoryRaw) : [];

      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      const autoDeleteDays = settings.autoDeleteDays ?? 30;

      if (autoDeleteDays !== 'never') {
        const cutoff = Date.now() - autoDeleteDays * 24 * 60 * 60 * 1000;
        loaded = loaded.filter((item) => {
          if (item.status === 'active') return true;
          return new Date(item.updatedAt).getTime() > cutoff;
        });
      }

      setItems(loaded);
    }
    load();
  }, []);

  async function persist(next) {
    setItems(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function addItem(item) {
    const notificationId = await scheduleExpiryNotification(item);
    await persist([...items, { ...item, notificationId }]);
  }

  async function deleteItem(id) {
    const item = items.find((i) => i.id === id);
    if (item && item.notificationId) {
      await cancelExpiryNotification(item.notificationId);
    }
    await persist(items.filter((i) => i.id !== id));
  }

  async function updateItem(id, changes) {
    const existing = items.find((i) => i.id === id);
    if (existing && existing.notificationId) {
      await cancelExpiryNotification(existing.notificationId);
    }
    const merged = { ...existing, ...changes, updatedAt: new Date().toISOString() };
    const notificationId = await scheduleExpiryNotification(merged);
    await persist(
      items.map((i) => (i.id === id ? { ...merged, notificationId } : i))
    );
  }

  async function markConsumed(id) {
    const item = items.find((i) => i.id === id);
    if (item && item.notificationId) {
      await cancelExpiryNotification(item.notificationId);
    }
    await persist(
      items.map((i) => {
        if (i.id !== id) return i;
        const prev = new Date(i.updatedAt).getTime();
        const now = Math.max(Date.now(), prev + 1);
        return { ...i, status: 'consumed', updatedAt: new Date(now).toISOString() };
      })
    );
  }

  async function clearInventory() {
    const active = items.filter((i) => i.status === 'active');
    for (const item of active) {
      if (item.notificationId) await cancelExpiryNotification(item.notificationId);
    }
    await persist(items.filter((i) => i.status !== 'active'));
  }

  async function markWasted(id) {
    const item = items.find((i) => i.id === id);
    if (item && item.notificationId) {
      await cancelExpiryNotification(item.notificationId);
    }
    await persist(
      items.map((i) => {
        if (i.id !== id) return i;
        const prev = new Date(i.updatedAt).getTime();
        const now = Math.max(Date.now(), prev + 1);
        return { ...i, status: 'wasted', updatedAt: new Date(now).toISOString() };
      })
    );
  }

  return (
    <InventoryContext.Provider value={{ items, addItem, deleteItem, updateItem, markConsumed, markWasted, clearInventory }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
