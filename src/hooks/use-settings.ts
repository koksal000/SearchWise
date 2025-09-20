'use client';

import { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import useLocalStorage from './use-local-storage';
import { AppSettings } from '@/lib/types';

const defaultSettings: AppSettings = {
  theme: 'dark',
  safeSearch: true,
  inAppWebView: true,
  saveHistory: true,
  filterInAppFriendly: false,
};

type SettingsContextType = {
  settings: AppSettings;
  toggleTheme: () => void;
  setSafeSearch: (value: boolean) => void;
  setInAppWebView: (value: boolean) => void;
  setSaveHistory: (value: boolean) => void;
  setFilterInAppFriendly: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>('searchwise-settings', defaultSettings);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  },[setSettings]);
  
  const setSafeSearch = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, safeSearch: value }));
  },[setSettings]);

  const setInAppWebView = useCallback((value: boolean) => {
    setSettings(prev => {
      // If the user is disabling the in-app web view, also disable the filtering option.
      if (!value) {
        return { ...prev, inAppWebView: false, filterInAppFriendly: false };
      }
      return { ...prev, inAppWebView: true };
    });
  },[setSettings]);

  const setSaveHistory = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, saveHistory: value }));
  }, [setSettings]);
  
  const setFilterInAppFriendly = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, filterInAppFriendly: value }));
  }, [setSettings]);

  return (
    <SettingsContext.Provider value={{ settings, toggleTheme, setSafeSearch, setInAppWebView, setSaveHistory, setFilterInAppFriendly }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
