import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

const PortalContext = createContext({ mount: () => {}, unmount: () => {} });

export function PortalProvider({ children }) {
  const [nodes, setNodes] = useState({});

  const mount = useCallback((key, node) => {
    setNodes(prev => ({ ...prev, [key]: node }));
  }, []);

  const unmount = useCallback((key) => {
    setNodes(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <PortalContext.Provider value={{ mount, unmount }}>
      <View style={{ flex: 1 }}>
        {children}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {Object.values(nodes)}
        </View>
      </View>
    </PortalContext.Provider>
  );
}

export const usePortal = () => useContext(PortalContext);
