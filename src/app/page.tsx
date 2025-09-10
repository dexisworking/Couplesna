import Header from '@/components/header';
import CountdownCard from '@/components/countdown-card';
import NotesCard from '@/components/notes-card';
import GallerySection from '@/components/gallery-section';
import { dashboardData } from '@/lib/data';
import SyncStatusCards from '@/components/sync-status-cards';
import DateIdeaGenerator from '@/components/date-idea-generator';

export default function Home() {
  return (
    <div className="min-h-screen p-2 sm:p-4 bg-black">
      <div className="w-full max-w-5xl mx-auto bg-background rounded-2xl sm:rounded-3xl p-4 md:p-8 min-h-[95vh]">
        <Header user={dashboardData.user} partner={dashboardData.partner} coupleId={dashboardData.coupleId} />
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="widget lg:col-span-3 p-4">
            <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-4 px-2">Always In Sync</h2>
            <SyncStatusCards partner={dashboardData.partner} user={dashboardData.user} />
          </div>

          <div className="widget lg:col-span-2 flex flex-col items-center justify-center p-6 gap-6">
             <CountdownCard 
                nextMeetDate={dashboardData.nextMeetDate} 
              />
              <DateIdeaGenerator 
                userLocation={`${dashboardData.user.location.city}, ${dashboardData.user.location.country}`}
                partnerLocation={`${dashboardData.partner.location.city}, ${dashboardData.partner.location.country}`}
              />
          </div>
          
          <div className="widget md:col-span-1 lg:col-span-1 text-white flex flex-col">
             <NotesCard notes={dashboardData.notes} />
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
