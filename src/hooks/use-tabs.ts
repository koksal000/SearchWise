'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { getTabs, saveTabs } from '@/lib/db';
import { TabItem } from '@/lib/types';
import { nanoid } from 'nanoid';

type TabsContextType = {
  tabs: TabItem[];
  activeTab: string | null;
  addTab: (url: string, title: string) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string | null) => void;
  clearAllTabs: () => void;
  getTabById: (id: string) => TabItem | undefined;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadTabs = async () => {
      if (typeof window !== 'undefined') {
        const storedTabs = await getTabs();
        setTabs(storedTabs);
        setIsInitialized(true);
      }
    };
    loadTabs();
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      saveTabs(tabs);
    }
  }, [tabs, isInitialized]);

  const addTab = useCallback((url: string, title: string) => {
    // Check if a tab with the same URL already exists
    const existingTab = tabs.find(tab => tab.url === url);
    if (existingTab) {
        setActiveTab(existingTab.id);
        return;
    }

    const newTab: TabItem = {
      id: nanoid(),
      url,
      title: title || url,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  }, [tabs]);

  const removeTab = useCallback((id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== id);
      if (activeTab === id) {
        setActiveTab(newTabs[newTabs.length - 1]?.id || null);
      }
      return newTabs;
    });
  }, [activeTab]);

  const clearAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTab(null);
  }, []);
  
  const getTabById = useCallback((id: string) => {
    return tabs.find(tab => tab.id === id);
  }, [tabs]);

  return (
    <TabsContext.Provider value={{ tabs, activeTab, addTab, removeTab, setActiveTab, clearAllTabs, getTabById }}>
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}
