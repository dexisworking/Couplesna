import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Partner } from '@/lib/types';

interface LocationMapProps {
  partnerLocation: Partner['location'];
}

export default function LocationMap({ partnerLocation }: LocationMapProps) {
  const mapImageUrl = PlaceHolderImages.find(img => img.id === 'map-background')?.imageUrl || '';

  return (
    <div className="absolute inset-0 z-0">
      <Image
        src={mapImageUrl}
        alt="World map"
        fill
        className="object-cover opacity-30"
        data-ai-hint="abstract map"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {/* The map functionality will be handled by a script, 
            this is a placeholder for partner location pin */}
        <div className="flex flex-col items-center text-white/90 animate-pulse">
          <span className="px-3 py-1 text-sm font-semibold bg-primary rounded-full shadow-lg mb-2">
            {partnerLocation.city}, {partnerLocation.country}
          </span>
          <MapPin className="h-10 w-10 text-primary drop-shadow-lg" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}
