'use client';

import * as React from 'react';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage from '@/components/landing-page';
import DashboardView from '@/components/dashboard-view';

export default function Home() {
  const { user, loading } = useAppContext();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return <DashboardView />;
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1d1b22_0%,#09090b_65%)] p-2 sm:p-4">
    <div className="mx-auto min-h-[95vh] w-full max-w-6xl space-y-8 rounded-2xl bg-background/95 p-3 sm:rounded-3xl sm:p-4 md:p-8">
      <Skeleton className="h-[300px] md:h-[400px] w-full rounded-t-2xl sm:rounded-t-3xl -m-4 md:-m-8" />
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-8">
        <Skeleton className="lg:col-span-3 h-[220px] w-full" />
        <Skeleton className="lg:col-span-2 h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="lg:col-span-3 h-[300px] w-full" />
      </main>
    </div>
  </div>
);
