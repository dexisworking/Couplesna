
'use client';
import * as React from 'react';
import { doc, getFirestore, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { DashboardData } from '@/lib/types';
import { dashboardData as initialData } from '@/lib/data';
import { app, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface AppContextType {
  data: DashboardData | null;
  setData: (data: Partial<DashboardData>) => Promise<void>;
  isSynced: boolean;
  setIsSynced: React.Dispatch<React.SetStateAction<boolean>>;
  coupleId: string | null;
  setCoupleId: (id: string | null) => void;
  loading: boolean;
  user: FirebaseAuthUser | null;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  partnerId: string | null;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = React.useState<DashboardData | null>(null);
  const [isSynced, setIsSynced] = React.useState(false);
  const [coupleId, setCoupleIdState] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseAuthUser | null>(null);
  
  // These represent the two users in the couple relationship
  const [userId, setUserId] = React.useState<string | null>(null);
  const [partnerId, setPartnerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        setUserId(authUser.uid);
        // Don't automatically set isSynced. Let couple connection logic handle it.
      } else {
        setUser(null);
        setUserId(null);
        setPartnerId(null);
        setCoupleIdState(null);
        setIsSynced(false);
        setDataState(initialData); // Show default data when logged out
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setCoupleId = (id: string | null) => {
    if (id) {
       localStorage.setItem('coupleId', id);
       setCoupleIdState(id);
    } else {
      localStorage.removeItem('coupleId');
      setCoupleIdState(null);
    }
  }

  React.useEffect(() => {
    const savedCoupleId = localStorage.getItem('coupleId');
    if (savedCoupleId) {
      setCoupleIdState(savedCoupleId);
    }
  }, []);


  React.useEffect(() => {
    if (!coupleId) {
      if (user) {
        // If user is logged in but no coupleId, try to find it
        findCoupleIdForUser(user.uid);
      } else {
        setDataState(initialData);
        setIsSynced(false);
        setLoading(false);
      }
      return;
    }

    setIsSynced(true);
    setLoading(true);
    const db = getFirestore(app);
    const docRef = doc(db, 'couples', coupleId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data() as DashboardData;
        const userIsUser1 = docData.user.username === user?.uid; // A simplified check
        // This logic is a placeholder. A robust implementation would involve UIDs.
        // For now, we assume if you are logged in, you are the 'user' in the data structure.
        setDataState(docData);
      } else {
        // This case might mean the couple document hasn't been created yet.
        // We could create it here, or handle it in the connection logic.
        console.log("Couple document not found. Waiting for connection.");
        setIsSynced(false);
        setDataState(initialData); // show default data
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
      setIsSynced(false);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId, user]);


  const findCoupleIdForUser = async (uid: string) => {
    const db = getFirestore(app);
    const couplesRef = collection(db, 'couples');
    
    // Query for couples where the user is either user1Id or user2Id
    const q1 = query(couplesRef, where("user1Id", "==", uid));
    const q2 = query(couplesRef, where("user2Id", "==", uid));

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const allDocs = [...snapshot1.docs, ...snapshot2.docs];

    if (allDocs.length > 0) {
      const coupleDoc = allDocs[0];
      setCoupleId(coupleDoc.id);
      const data = coupleDoc.data();
      setPartnerId(data.user1Id === uid ? data.user2Id : data.user1Id);
    } else {
      console.log("No existing couple found for this user.");
      setLoading(false);
    }
  }


  const handleSetData = async (newData: Partial<DashboardData>) => {
    if (!coupleId || !data) {
       toast({
        variant: 'destructive',
        title: 'Not Synced',
        description: "You must be connected to a partner to save changes."
      });
      return;
    }

    const db = getFirestore(app);
    const docRef = doc(db, 'couples', coupleId);

    try {
      // Create a deep copy to avoid issues with nested objects
      const currentData = JSON.parse(JSON.stringify(data));
      const updatedData = { ...currentData, ...newData };
      await setDoc(docRef, updatedData, { merge: true });
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        variant: 'destructive',
        title: 'Sync Error',
        description: "Could not save changes. Please try again."
      });
      throw error;
    }
  };
  
  const value = { 
    data: data || initialData, // Fallback to initial data if state is null
    setData: handleSetData, 
    isSynced, 
    setIsSynced, 
    coupleId, 
    setCoupleId, 
    loading, 
    user,
    userId,
    setUserId,
    partnerId
  };

  return (
    <AppContext.Provider value={value}>
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
