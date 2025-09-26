
'use client';
import * as React from 'react';
import Header from '@/components/header';
import CountdownCard from '@/components/countdown-card';
import NotesCard from '@/components/notes-card';
import GallerySection from '@/components/gallery-section';
import SyncStatusCards from '@/components/sync-status-cards';
import DateIdeaGenerator from '@/components/date-idea-generator';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data, loading } = useAppContext();

  if (loading || !data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-black">
      <div className="w-full max-w-5xl mx-auto bg-background rounded-2xl sm:rounded-3xl p-4 md:p-8 min-h-[95vh]">
        <Header user={data.user} partner={data.partner} coupleId={data.coupleId} />
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="widget lg:col-span-3 p-4 overflow-x-auto">
            <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-4 px-2">Always In Sync</h2>
            <div className="flex flex-row gap-4">
              <SyncStatusCards partner={data.partner} user={data.user} distanceApartKm={data.distanceApartKm} />
            </div>
          </div>

          <div className="widget lg:col-span-2 flex flex-col items-center justify-center p-6 gap-6">
             <CountdownCard 
                nextMeetDate={data.nextMeetDate} 
              />
              <DateIdeaGenerator 
                userLocation={`${data.user.location.city}, ${data.user.location.country}`}
                partnerLocation={`${data.partner.location.city}, ${data.partner.location.country}`}
              />
          </div>
          
          <div className="widget md:col-span-1 lg:col-span-1 text-white flex flex-col">
             <NotesCard notes={data.notes} />
          </div>

          <div className="widget lg:col-span-3 p-4 md:p-6">
             <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-4 text-center">Our Moments</h2>
             <GallerySection />
          </div>
        </main>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="min-h-screen p-2 sm:p-4 bg-black">
    <div className="w-full max-w-5xl mx-auto bg-background rounded-2xl sm:rounded-3xl p-4 md:p-8 min-h-[95vh] space-y-8">
      <Skeleton className="h-[300px] w-full rounded-t-3xl -m-4 md:-m-8 mb-4 md:mb-8" />
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Skeleton className="lg:col-span-3 h-[220px] w-full" />
        <Skeleton className="lg:col-span-2 h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="lg:col-span-3 h-[300px] w-full" />
      </main>
    </div>
  </div>
);
