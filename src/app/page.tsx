
'use client';
import * as React from 'react';
import Image from 'next/image';
import Header from '@/components/header';
import CountdownCard from '@/components/countdown-card';
import NotesCard from '@/components/notes-card';
import GallerySection from '@/components/gallery-section';
import SyncStatusCards from '@/components/sync-status-cards';
import DateIdeaGenerator from '@/components/date-idea-generator';
import LocationMap from '@/components/location-map';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';

const creditsLinks = [
  { label: 'GitHub', href: 'https://github.com/dexisworking' },
  { label: 'Twitter', href: 'https://x.com/SekharDibyanshu' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dibyanshusekhar/' },
  { label: 'Instagram', href: 'https://instagram.com/dexisreal' },
  { label: 'Coffee', href: 'https://buymeacoffee.com/dexisworking' },
  { label: 'PORTFOLIO', href: 'https://iamdex.codes/' },
];

const creditsOwner = '© 2026 Dibyanshu Sekhar';

export default function Home() {
  const { data, loading, isSynced } = useAppContext();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading || !data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1d1b22_0%,#09090b_65%)] p-2 sm:p-4">
      <div className="mx-auto min-h-[95vh] w-full max-w-6xl rounded-2xl bg-background/95 p-3 sm:rounded-3xl sm:p-4 md:p-8">
        <Header user={data.user} partner={data.partner} />
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="widget lg:col-span-3 p-4 overflow-x-auto">
            <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-4 px-2">Always In Sync</h2>
            <div className="flex flex-row gap-4">
              <SyncStatusCards partner={data.partner} user={data.user} distanceApartKm={data.distanceApartKm} />
            </div>
          </div>

          <div className="widget lg:col-span-2 flex flex-col items-center justify-center gap-6 p-4 sm:p-6">
             <CountdownCard 
                nextMeetDate={data.nextMeetDate} 
              />
              <DateIdeaGenerator 
                userLocation={isSynced ? `${data.user.location.city}, ${data.user.location.country}`: 'Your Location'}
                partnerLocation={isSynced ? `${data.partner.location.city}, ${data.partner.location.country}` : 'Partner Location'}
              />
          </div>
          
          <div className="widget md:col-span-1 lg:col-span-1 text-white flex flex-col gap-6">
             <NotesCard notes={data.notes} />
          </div>

          <div className="widget lg:col-span-3 p-4 md:p-6 flex flex-col h-[400px]">
             <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                 <span className="w-2 h-6 bg-primary rounded-full" /> Their Location
             </h2>
             <div className="flex-1 rounded-xl overflow-hidden border border-white/10 shadow-xl">
               <LocationMap partnerLocation={data.partner.location} />
             </div>
          </div>

          <div className="widget lg:col-span-3 p-4 md:p-6">
             <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-4 text-center">Our Moments</h2>
             <GallerySection />
           </div>

        </main>

        <footer className="mt-6 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-xs">
              <Image
                src="/couplesna_favicon.png"
                alt="Couplesna favicon"
                width={16}
                height={16}
                className="h-[1em] w-[1em] rounded-sm"
              />
              {creditsOwner}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {creditsLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center uppercase tracking-wide transition ${
                    link.label === 'PORTFOLIO'
                      ? 'rounded-full border border-white/25 px-2 py-1 text-white/90 hover:border-white/50 hover:text-white'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1d1b22_0%,#09090b_65%)] p-2 sm:p-4">
    <div className="mx-auto min-h-[95vh] w-full max-w-6xl space-y-8 rounded-2xl bg-background/95 p-3 sm:rounded-3xl sm:p-4 md:p-8">
      {/* Keep the header part of the skeleton simple */}
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
