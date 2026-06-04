import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  function addItem(item) {
    persist([...items, item]);
  }

  function deleteItem(id) {
    persist(items.filter((i) => i.id !== id));
  }

  function updateItem(id, changes) {
    persist(
      items.map((i) =>
        i.id === id ? { ...i, ...changes, updatedAt: new Date().toISOString() } : i
      )
    );
  }

  function markConsumed(id) {
    persist(
      items.map((i) => {
        if (i.id !== id) return i;
        const prev = new Date(i.updatedAt).getTime();
        const now = Math.max(Date.now(), prev + 1);
        return { ...i, status: 'consumed', updatedAt: new Date(now).toISOString() };
      })
    );
  }

  function markWasted(id) {
    persist(
      items.map((i) => {
        if (i.id !== id) return i;
        const prev = new Date(i.updatedAt).getTime();
        const now = Math.max(Date.now(), prev + 1);
        return { ...i, status: 'wasted', updatedAt: new Date(now).toISOString() };
      })
    );
  }

  return (
    <InventoryContext.Provider value={{ items, addItem, deleteItem, updateItem, markConsumed, markWasted }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
