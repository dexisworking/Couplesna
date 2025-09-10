import Header from '@/components/header';
import LocationMap from '@/components/location-map';
import WeatherCard from '@/components/weather-card';
import SyncStatusCards from '@/components/sync-status-cards';
import CountdownCard from '@/components/countdown-card';
import NotesCard from '@/components/notes-card';
import GallerySection from '@/components/gallery-section';
import { dashboardData } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header user={dashboardData.user} partner={dashboardData.partner} coupleId={dashboardData.coupleId} />
      <main className="flex-1 container mx-auto px-4 py-8 md:p-8 space-y-12">
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <LocationMap partnerLocation={dashboardData.partner.location} />
          <WeatherCard weather={dashboardData.partner.weather} />
        </div>
        
        <div className="space-y-6">
           <h2 className="text-3xl font-bold font-headline tracking-tight text-center md:text-left">Always in Sync</h2>
           <SyncStatusCards partner={dashboardData.partner} user={dashboardData.user} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          <div className="lg:col-span-7">
             <h2 className="text-3xl font-bold font-headline tracking-tight mb-4">Countdown to Our Next Moment</h2>
             <CountdownCard 
                nextMeetDate={dashboardData.nextMeetDate} 
                userLocation={dashboardData.user.location.city} 
                partnerLocation={dashboardData.partner.location.city} 
              />
          </div>
          <div className="lg:col-span-3">
             <h2 className="text-3xl font-bold font-headline tracking-tight mb-4">Heartbeat Notes</h2>
             <NotesCard notes={dashboardData.notes} />
          </div>
        </div>
        
        <div className="space-y-6">
           <h2 className="text-3xl font-bold font-headline tracking-tight">Our Moments</h2>
           <GallerySection />
        </div>
      </main>
    </div>
  );
}
