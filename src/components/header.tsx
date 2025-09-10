'use client';
import * as React from 'react';
import ProfileMenu from '@/components/profile-menu';
import type { User, Partner } from '@/lib/types';
import LocationMap from './location-map';
import WeatherCard from './weather-card';
import { Button } from './ui/button';
import { ArrowDownLeft, ArrowUpRight, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HeaderProps {
  user: User;
  partner: Partner;
  coupleId: string;
}

export default function Header({ user, partner, coupleId }: HeaderProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <header 
      id="header-container"
      className={cn(
        'relative overflow-hidden transition-[height] duration-500 ease-in-out -m-4 md:-m-8 mb-4 md:mb-8 rounded-t-2xl sm:rounded-t-3xl',
        isExpanded ? 'h-[70vh]' : 'h-[200px] md:h-[300px]'
      )}
    >
      <LocationMap partnerLocation={partner.location} />
      <div id="header-gradient" className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-background to-transparent z-10" />

      <div id="header-content" className="relative z-20 h-full flex flex-col justify-center items-center">
        {/* Top Bar for Weather and Profile */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
          <WeatherCard weather={partner.weather} />
          <ProfileMenu user={user} partner={partner} coupleId={coupleId} />
        </div>

        <div className={cn("flex flex-col items-center justify-center text-center transition-opacity duration-300", isExpanded && "opacity-0 pointer-events-none")}>
          <div className="flex items-center justify-center">
            <h1 className="text-4xl md:text-7xl font-bold text-white drop-shadow-lg select-none">couplesna</h1>
          </div>
          <p className="text-white/70 mt-2 text-sm md:text-base">Your private space, connecting hearts across any distance.</p>
        </div>
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
