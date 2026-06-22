import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
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

  const value = useMemo(() => ({ mount, unmount }), [mount, unmount]);

  return (
    <PortalContext.Provider value={value}>
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
