
'use client';
import * as React from 'react';
import dynamic from 'next/dynamic';
import ProfileMenu from '@/components/profile-menu';
import type { User, Partner } from '@/lib/types';
import WeatherCard from './weather-card';
import { Button } from './ui/button';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <Skeleton className="absolute inset-0" />,
});

interface HeaderProps {
  user: User;
  partner: Partner;
  coupleId: string;
}

export default function Header({ user, partner, coupleId }: HeaderProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header 
      id="header-container"
      className={cn(
        'relative overflow-hidden transition-[height] duration-500 ease-in-out -m-4 md:-m-8 mb-4 md:mb-8 rounded-t-2xl sm:rounded-t-3xl',
        isExpanded ? 'h-[70vh]' : 'h-[200px] md:h-[300px]'
      )}
    >
      <div className="absolute inset-0 z-0">
        {isClient && <LocationMap partnerLocation={partner.location} />}
      </div>
      <div id="header-gradient" className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-background to-transparent z-10" />

      <div id="header-content" className="relative z-20 h-full flex flex-col justify-between items-center">
        {/* Top Bar for Weather and Profile */}
        <div className="w-full p-4 flex justify-between items-start z-10">
          <WeatherCard weather={partner.weather} />
          <ProfileMenu user={user} partner={partner} coupleId={coupleId} />
        </div>

        <div className={cn("flex flex-col items-center justify-center text-center transition-opacity duration-300 pb-8", isExpanded && "opacity-0 pointer-events-none")}>
          <div className="flex items-center justify-center">
             <Image src="/logo.png" alt="CouplesNA Logo" width={100} height={100} className="h-40 w-auto" priority />
          </div>
        </div>
        
        {/* This div is for spacing with flex-col justify-between */}
        <div></div>
      </div>

      <div id="map-controls" className="absolute bottom-4 right-4 z-30">
        <Button size="icon" variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm h-8 w-8 md:h-10 md:w-10">
          {isExpanded ? <Minimize className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize className="h-4 w-4 md:h-5 md:w-5" />}
          <span className="sr-only">{isExpanded ? "Collapse map" : "Expand map"}</span>
        </Button>
      </div>
    </header>
  );
}
