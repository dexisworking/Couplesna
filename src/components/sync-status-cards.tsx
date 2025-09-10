'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, InfinityIcon, Music } from 'lucide-react';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { dashboardData } from '@/lib/data';
import type { User, Partner } from '@/lib/types';

interface SyncStatusCardsProps {
  user: User;
  partner: Partner;
}

const InfoCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <Card className="flex-1 transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const PartnerTimeCard = ({ partner }: { partner: Partner }) => {
  const [partnerTime, setPartnerTime] = React.useState('');

  React.useEffect(() => {
    const getTime = () => {
      const zonedDate = utcToZonedTime(new Date(), partner.location.timezone);
      setPartnerTime(format(zonedDate, 'HH:mm:ss'));
    };
    getTime();
    const interval = setInterval(getTime, 1000);
    return () => clearInterval(interval);
  }, [partner.location.timezone]);

  return (
    <InfoCard icon={Clock} title="Partner's Time">
      <div className="text-2xl font-bold">{partnerTime}</div>
      <p className="text-xs text-muted-foreground">
        {partner.location.timezone.split('/')[1].replace('_', ' ')} Time ({partner.location.city})
      </p>
    </InfoCard>
  );
};

export default function SyncStatusCards({ partner }: SyncStatusCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PartnerTimeCard partner={partner} />
      <InfoCard icon={InfinityIcon} title="Distance Apart">
        <div className="text-2xl font-bold">{dashboardData.distanceApartKm.toLocaleString()} km</div>
        <p className="text-xs text-muted-foreground">Approx. {Math.round(dashboardData.distanceApartKm * 0.621371).toLocaleString()} miles</p>
      </InfoCard>
      <InfoCard icon={Music} title="Partner is Listening to">
        <div className="text-2xl font-bold truncate">{partner.media.track}</div>
        <p className="text-xs text-muted-foreground">on {partner.media.app}</p>
      </InfoCard>
    </div>
  );
}
