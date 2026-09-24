import React, { createContext, useContext, useState } from 'react';
import { RootScreen, NavigationContextValue } from './types';

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface HistoryEntry {
  screen: RootScreen;
  params?: Record<string, any>;
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { screen: 'Home' },
  ]);

  const current = history[history.length - 1] || { screen: 'Home' };

  const navigate = (screen: RootScreen, params?: Record<string, any>) => {
    setHistory((prev) => [...prev, { screen, params }]);
  };

  const goBack = () => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen: current.screen,
        params: current.params,
        navigate,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export function useAppNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within NavigationProvider');
  }
  return context;
}

