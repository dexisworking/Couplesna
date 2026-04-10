
'use client';

import * as React from 'react';
import { Waves } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { User, Partner } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface SyncStatusCardsProps {
  user: User;
  partner: Partner;
  distanceApartKm: number;
}

const InfoTile = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`flex h-[160px] w-[220px] flex-shrink-0 flex-col rounded-3xl border border-white/10 bg-accent/50 p-4 text-white backdrop-blur-lg md:h-[180px] md:w-[280px] ${className}`}>
    <p className="text-sm text-white/70">{title}</p>
    {children}
  </div>
);

const PartnerTimeTile = ({ partner }: { partner: Partner }) => {
  const [partnerTime, setPartnerTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!partner?.location?.timezone) return;
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
  }, [partner?.location?.timezone]);

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
              <p className="text-4xl md:text-5xl font-bold">
                {distanceApartKm ? distanceApartKm.toLocaleString() : '...'}
              </p>
              <p className="text-sm text-white/70">kilometers</p>
            </div>
          </InfoTile>
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto">
           <div className="flex h-[160px] w-[220px] flex-shrink-0 flex-col rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white md:h-[180px] md:w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Waves className="h-6 w-6"/>
                    </div>
                    <div>
                        <p className="font-semibold">Shared Vibe</p>
                        <p className="text-xs text-white/80">Now playing on your side</p>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="text-lg font-semibold md:text-xl">
                      {user.media?.track || user.details.favoriteSong || 'Nothing synced yet'}
                    </p>
                    <p className="text-xs text-white/70">{user.media?.app || 'Favorite track'}</p>
                </div>
            </div>
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto">
          <InfoTile title="Partner is Listening to">
            <div className="mt-auto">
              {partner?.media ? (
                <>
                  <p className="text-lg md:text-xl font-semibold truncate">{partner.media.track}</p>
                  <p className="text-xs text-white/50">on {partner.media.app}</p>
                </>
              ) : (
                <p className="text-lg md:text-xl font-semibold">Not available</p>
              )}
            </div>
          </InfoTile>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}
