'use client';

import { ReactNode } from 'react';
import { SettingsProvider } from '@/hooks/use-settings';
import { HistoryProvider } from '@/hooks/use-history';
import { TabsProvider } from '@/hooks/use-tabs';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <TabsProvider>
          {children}
        </TabsProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
