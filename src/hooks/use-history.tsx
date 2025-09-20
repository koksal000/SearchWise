'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import useLocalStorage from './use-local-storage';
import { HistoryItem } from '@/lib/types';
import { useSettings } from './use-settings';

type HistoryContextType = {
  history: HistoryItem[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('searchwise-history', []);
  const { settings } = useSettings();

  const addToHistory = useCallback((query: string) => {
    if (!settings.saveHistory) return;

    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      const newItem: HistoryItem = {
        id: Date.now(),
        query,
        timestamp: Date.now(),
      };
      return [newItem, ...newHistory].slice(0, 100); // Keep latest 100
    });
  }, [setHistory, settings.saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
