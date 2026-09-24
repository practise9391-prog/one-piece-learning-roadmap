import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
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
    { screen: 'Dashboard' },
  ]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const current = history[history.length - 1] || { screen: 'Dashboard' };

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);

  const navigate = useCallback((screen: RootScreen, params?: Record<string, any>) => {
    setDrawerOpen(false);
    setHistory((prev) => [...prev, { screen, params }]);
  }, []);

  const goBack = useCallback(() => {
    setDrawerOpen(false);
    setHistory((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      return prev;
    });
  }, []);

  // Handle native Android hardware back button
  useEffect(() => {
    const onBackPress = () => {
      // 1. If drawer is open, close drawer first
      if (drawerOpen) {
        closeDrawer();
        return true;
      }

      // 2. If we have navigation history, go back
      if (history.length > 1) {
        goBack();
        return true;
      }

      // 3. If on a non-dashboard screen at root, return to Dashboard
      if (current.screen !== 'Dashboard') {
        navigate('Dashboard');
        return true;
      }

      // 4. On Dashboard at root -> allow OS default (exit app)
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [drawerOpen, history.length, current.screen, closeDrawer, goBack, navigate]);

  return (
    <NavigationContext.Provider
      value={{
        currentScreen: current.screen,
        params: current.params,
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
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
