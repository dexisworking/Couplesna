'use client';

import * as React from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { acceptInvite, declineInvite, getAppSnapshot, requestConnection, saveDashboardData } from '@/actions/app';
import { buildFallbackDashboard } from '@/lib/data';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { AppDataSnapshot, ConnectionInvite, DashboardData, DashboardPerson } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type DashboardPatch = Partial<Pick<DashboardData, 'nextMeetDate' | 'notes' | 'distanceApartKm'>>;

interface AppContextType {
  data: DashboardData | null;
  setData: (data: DashboardPatch) => Promise<void>;
  refreshData: () => Promise<void>;
  isSynced: boolean;
  coupleId: string | null;
  loading: boolean;
  user: SupabaseUser | null;
  invites: ConnectionInvite[];
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestConnection: (partnerIdentifier: string) => Promise<{ autoAccepted: boolean }>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  supabaseReady: boolean;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

function buildAuthFallbackProfile(user: SupabaseUser | null): Partial<DashboardPerson> | undefined {
  if (!user) {
    return undefined;
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Couplesna User';

  return {
    id: user.id,
    name,
    email: user.email,
    username:
      (user.user_metadata?.user_name as string | undefined) ||
      user.email?.split('@')[0] ||
      user.id.slice(0, 8),
    profilePic:
      (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const supabaseReady = isSupabaseConfigured();
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [data, setDashboard] = React.useState<DashboardData | null>(
    buildFallbackDashboard()
  );
  const [coupleId, setCoupleId] = React.useState<string | null>(null);
  const [invites, setInvites] = React.useState<ConnectionInvite[]>([]);
  const [loading, setLoading] = React.useState(true);

  const applySnapshot = React.useCallback((snapshot: AppDataSnapshot) => {
    setDashboard(snapshot.dashboard);
    setCoupleId(snapshot.coupleId);
    setInvites(snapshot.invites);
  }, []);

  const refreshData = React.useCallback(async () => {
    if (!user) {
      setDashboard(buildFallbackDashboard());
      setCoupleId(null);
      setInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const snapshot = await getAppSnapshot();
      applySnapshot(snapshot);
    } catch (error) {
      console.error('Failed to refresh app data:', error);
      setDashboard(buildFallbackDashboard(buildAuthFallbackProfile(user)));
      setCoupleId(null);
      setInvites([]);
      toast({
        variant: 'destructive',
        title: 'Sync unavailable',
        description: error instanceof Error ? error.message : 'Unable to load Couplesna data.',
      });
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, toast, user]);

  React.useEffect(() => {
    if (!supabaseReady) {
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    let active = true;

    const initialize = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (active) {
        React.startTransition(() => {
          setUser(currentUser);
        });
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      React.startTransition(() => {
        setUser(session?.user ?? null);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabaseReady]);

  React.useEffect(() => {
    void refreshData();
  }, [refreshData]);

  React.useEffect(() => {
    if (!user) {
      return;
    }

    const interval = window.setInterval(() => {
      void refreshData();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [refreshData, user]);

  const setData = React.useCallback(
    async (patch: DashboardPatch) => {
      const previous = data;
      if (previous) {
        setDashboard({
          ...previous,
          ...patch,
          notes: patch.notes
            ? {
                ...previous.notes,
                ...patch.notes,
              }
            : previous.notes,
        });
      }

      try {
        const snapshot = await saveDashboardData(patch);
        applySnapshot(snapshot);
      } catch (error) {
        if (previous) {
          setDashboard(previous);
        }

        throw error;
      }
    },
    [applySnapshot, data]
  );

  const signInWithGoogle = React.useCallback(async () => {
    if (!supabaseReady) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Add your Supabase environment variables to enable Google sign-in.',
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  }, [supabaseReady, toast]);

  const signInWithEmail = React.useCallback(async (email: string, password: string) => {
    if (!supabaseReady) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Add your Supabase environment variables to enable sign-in.',
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }, [supabaseReady, toast]);

  const signUpWithEmail = React.useCallback(async (email: string, password: string) => {
    if (!supabaseReady) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Add your Supabase environment variables to enable sign-up.',
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
    });

    if (error) {
      throw error;
    }
  }, [supabaseReady, toast]);

  const handleSignOut = React.useCallback(async () => {
    if (!supabaseReady) {
      setUser(null);
      setDashboard(buildFallbackDashboard());
      setCoupleId(null);
      setInvites([]);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setUser(null);
    setDashboard(buildFallbackDashboard());
    setCoupleId(null);
    setInvites([]);
  }, [supabaseReady]);

  const handleRequestConnection = React.useCallback(
    async (partnerIdentifier: string) => {
      const result = await requestConnection(partnerIdentifier);
      await refreshData();
      return result;
    },
    [refreshData]
  );

  const handleAcceptInvite = React.useCallback(
    async (inviteId: string) => {
      await acceptInvite(inviteId);
      await refreshData();
    },
    [refreshData]
  );

  const handleDeclineInvite = React.useCallback(
    async (inviteId: string) => {
      await declineInvite(inviteId);
      await refreshData();
    },
    [refreshData]
  );

  const value = React.useMemo(
    () => ({
      data,
      setData,
      refreshData,
      isSynced: Boolean(user && coupleId),
      coupleId,
      loading,
      user,
      invites,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut: handleSignOut,
      requestConnection: handleRequestConnection,
      acceptInvite: handleAcceptInvite,
      declineInvite: handleDeclineInvite,
      supabaseReady,
    }),
    [
      coupleId,
      data,
      handleAcceptInvite,
      handleDeclineInvite,
      handleRequestConnection,
      handleSignOut,
      invites,
      loading,
      refreshData,
      setData,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      supabaseReady,
      user,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
