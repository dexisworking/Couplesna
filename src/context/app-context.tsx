
'use client';
import * as React from 'react';
import { doc, getFirestore, onSnapshot, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { DashboardData } from '@/lib/types';
import { dashboardData as initialData } from '@/lib/data';
import { getClientSideFirebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, getRedirectResult } from 'firebase/auth';

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
  const [data, setDataState] = React.useState<DashboardData | null>(initialData);
  const [isSynced, setIsSynced] = React.useState(false);
  const [coupleId, setCoupleIdState] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const [user, setUser] = React.useState<FirebaseAuthUser | null>(null);
  
  const [userId, setUserId] = React.useState<string | null>(null);
  const [partnerId, setPartnerId] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const findCoupleIdForUser = async (uid: string) => {
    const app = getClientSideFirebaseApp();
    if (!app) return;
    const db = getFirestore(app);
    const couplesRef = collection(db, 'couples');
    const q = query(couplesRef, where('users', 'array-contains', uid));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const coupleDoc = querySnapshot.docs[0];
             setCoupleId(coupleDoc.id);
        } else {
             console.log("No existing couple found for this user.");
             setDataState(initialData);
             setIsSynced(false);
        }
    } catch (error) {
        console.error("Error finding couple ID:", error);
    } finally {
        setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!isClient) return;

    const app = getClientSideFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // This function ensures a user document exists.
    const ensureUserDocument = async (gUser: FirebaseAuthUser) => {
        const userDocRef = doc(db, 'users', gUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
              name: gUser.displayName,
              email: gUser.email,
          }, { merge: true });
        }
    };
  
    // Handle the result of a Google Sign-In redirect.
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          await ensureUserDocument(result.user);
          toast({ title: 'Logged In Successfully!' });
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
           // This case is handled in profile-menu.tsx now
        } else {
           toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message,
          });
        }
      });
  
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        await ensureUserDocument(authUser);
        setUser(authUser);
        setUserId(authUser.uid);
        const savedCoupleId = localStorage.getItem('coupleId');
        if (savedCoupleId) {
          setCoupleIdState(savedCoupleId);
        } else {
          await findCoupleIdForUser(authUser.uid);
        }
      } else {
        setUser(null);
        setUserId(null);
        setPartnerId(null);
        setCoupleId(null);
        setIsSynced(false);
        setDataState(initialData);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

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
    if (!isClient) return;
    const savedCoupleId = localStorage.getItem('coupleId');
    if (savedCoupleId && !coupleId) {
      setCoupleIdState(savedCoupleId);
    }
  }, [isClient, coupleId]);


  React.useEffect(() => {
    if (!isClient || !user || !coupleId) {
      if (!user) setLoading(false);
      return;
    };

    const app = getClientSideFirebaseApp();
    if (!app) return;
    const db = getFirestore(app);

    setIsSynced(true);
    setLoading(true);
    const docRef = doc(db, 'couples', coupleId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data() as DashboardData;
        setDataState(docData);
      } else {
        console.log("Couple document not found. This might happen if a user logs out and the ID is cleared.");
        setIsSynced(false);
        setDataState(initialData);
        setCoupleId(null); // Clear invalid coupleId
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
  }, [coupleId, user, isClient]);

  const handleSetData = async (newData: Partial<DashboardData>) => {
    const app = getClientSideFirebaseApp();
    if (!app || !coupleId || !data) {
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
    data: data || initialData,
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
