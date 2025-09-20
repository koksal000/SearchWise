'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import useLocalStorage from './use-local-storage';
import { AppSettings } from '@/lib/types';

const defaultSettings: AppSettings = {
  theme: 'dark',
  safeSearch: true,
  inAppWebView: true,
  saveHistory: true,
};

type SettingsContextType = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  toggleTheme: () => void;
  setSafeSearch: (value: boolean) => void;
  setInAppWebView: (value: boolean) => void;
  setSaveHistory: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>('searchwise-settings', defaultSettings);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);
  }, [settings.theme]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };
  
  const setSafeSearch = (value: boolean) => {
    setSettings(prev => ({ ...prev, safeSearch: value }));
  };

  const setInAppWebView = (value: boolean) => {
    setSettings(prev => ({ ...prev, inAppWebView: value }));
  };

  const setSaveHistory = (value: boolean) => {
    setSettings(prev => ({ ...prev, saveHistory: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, toggleTheme, setSafeSearch, setInAppWebView, setSaveHistory }}>
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
