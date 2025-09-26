
'use client';

import * as React from 'react';
import { Waves } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { User, Partner } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Input } from './ui/input';

interface SyncStatusCardsProps {
  user: User;
  partner: Partner;
  distanceApartKm: number;
}

const InfoTile = ({ icon: Icon, title, children, className }: { icon?: React.ElementType, title: string, children: React.ReactNode, className?: string }) => (
  <div className={`flex-shrink-0 w-[240px] md:w-[280px] h-[160px] md:h-[180px] bg-accent/50 backdrop-blur-lg border border-white/10 rounded-3xl p-4 flex flex-col text-white ${className}`}>
    <p className="text-sm text-white/70">{title}</p>
    {children}
  </div>
);

const PartnerTimeTile = ({ partner }: { partner: Partner }) => {
  const [partnerTime, setPartnerTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getTime = () => {
      try {
        const zonedDate = toZonedTime(new Date(), partner.location.timezone);
        setPartnerTime(format(zonedDate, 'HH:mm'));
      } catch (error) {
        console.error("Error getting partner's time:", error);
        setPartnerTime('--:--');
      }
    };
    
    getTime();
    const interval = setInterval(getTime, 1000);
    return () => clearInterval(interval);
  }, [partner.location.timezone]);

  return (
    <InfoTile title="Partner's Time">
       {partnerTime !== null ? (
        <>
          <p className="text-4xl md:text-5xl font-bold mt-auto">{partnerTime}</p>
          <p className="text-sm text-white/70">
            {partner.location.timezone.split('/')[1]?.replace('_', ' ') || 'Local Time'}
          </p>
        </>
      ) : (
        <p className="text-4xl md:text-5xl font-bold mt-auto">--:--</p>
      )}
    </InfoTile>
  );
};

export default function SyncStatusCards({ user, partner, distanceApartKm }: SyncStatusCardsProps) {
  return (
    <Carousel opts={{ align: "start", loop: false }} className="w-full">
      <CarouselContent className="-ml-4">
        <CarouselItem className="pl-4 basis-auto">
          <PartnerTimeTile partner={partner} />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto">
          <InfoTile title="Distance Apart">
            <div className="mt-auto text-center">
              <p className="text-4xl md:text-5xl font-bold">{distanceApartKm.toLocaleString()}</p>
              <p className="text-sm text-white/70">kilometers</p>
            </div>
          </InfoTile>
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto">
           <div className="w-[240px] md:w-[280px] h-[160px] md:h-[180px] bg-gradient-to-br from-rose-500 to-purple-600 rounded-3xl p-4 flex flex-col text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Waves className="h-6 w-6"/>
                    </div>
                    <div>
                        <p className="font-semibold">Shared Vibe</p>
                        <p className="text-xs text-white/80">What's your mood?</p>
                    </div>
                </div>
                <div className="mt-auto">
                    <Input className="w-full bg-transparent border-b border-white/30 focus:outline-none pb-1 h-auto rounded-none px-0" type="text" defaultValue={user.details.favoriteSong} placeholder="Listening to..."/>
                </div>
            </div>
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto">
          <InfoTile title="Partner is Listening to">
            <div className="mt-auto">
              <p className="text-lg md:text-xl font-semibold truncate">{partner.media.track}</p>
              <p className="text-xs text-white/50">on {partner.media.app}</p>
            </div>
          </InfoTile>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}
