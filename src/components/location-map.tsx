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
    <Card className="w-full aspect-[3/1] relative overflow-hidden bg-muted">
      <Image
        src={mapImageUrl}
        alt="World map"
        fill
        className="object-cover opacity-30"
        data-ai-hint="abstract map"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <span className="px-3 py-1 text-sm font-semibold text-primary-foreground bg-primary rounded-md shadow-lg mb-2">
            {partnerLocation.city}, {partnerLocation.country}
          </span>
          <MapPin className="h-10 w-10 text-primary drop-shadow-lg" fill="currentColor" />
        </div>
      </div>
    </Card>
  );
}
