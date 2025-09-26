
'use client';
import * as React from 'react';
import type { DashboardData } from '@/lib/types';
import { dashboardData as initialData } from '@/lib/data';

interface AppContextType {
  data: DashboardData | null;
  setData: React.Dispatch<React.SetStateAction<DashboardData | null>>;
  isSynced: boolean;
  setIsSynced: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<DashboardData | null>(initialData);
  const [isSynced, setIsSynced] = React.useState(true);

  return (
    <AppContext.Provider value={{ data, setData, isSynced, setIsSynced }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
