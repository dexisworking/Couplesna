
'use client';
import * as React from 'react';
import { doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import type { DashboardData } from '@/lib/types';
import { dashboardData as initialData } from '@/lib/data';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  data: DashboardData | null;
  setData: (data: Partial<DashboardData>) => Promise<void>;
  isSynced: boolean;
  setIsSynced: React.Dispatch<React.SetStateAction<boolean>>;
  coupleId: string | null;
  setCoupleId: React.Dispatch<React.SetStateAction<string | null>>;
  loading: boolean;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = React.useState<DashboardData | null>(initialData);
  const [isSynced, setIsSynced] = React.useState(true);
  const [coupleId, setCoupleId] = React.useState<string | null>('couple-1');
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!coupleId || !isSynced) {
      setDataState(initialData);
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getFirestore(app);
    const docRef = doc(db, 'couples', coupleId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setDataState(docSnap.data() as DashboardData);
      } else {
        // If doc doesn't exist, create it with initial data
        setDoc(docRef, initialData).catch(err => console.error("Error creating document:", err));
        setDataState(initialData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error: ", error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: "Could not connect to the database. Displaying local data."
      });
      setDataState(initialData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coupleId, isSynced, toast]);

  const handleSetData = async (newData: Partial<DashboardData>) => {
    if (!coupleId || !data) return;

    const db = getFirestore(app);
    const docRef = doc(db, 'couples', coupleId);

    try {
      const updatedData = { ...data, ...newData, coupleId: data.coupleId };
      await setDoc(docRef, updatedData, { merge: true });
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        variant: 'destructive',
        title: 'Sync Error',
        description: "Could not save changes. Please try again."
      });
    }
  };

  return (
    <AppContext.Provider value={{ data, setData: handleSetData, isSynced, setIsSynced, coupleId, setCoupleId, loading }}>
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
