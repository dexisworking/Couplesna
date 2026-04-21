'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Heart,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { getAdminCouples } from '@/actions/admin';

interface Couple {
  id: string;
  created_at: string;
  next_meet_date: string | null;
  distance_apart_km: number | null;
  couple_members: {
    profile_id: string;
    profiles: {
      email: string | null;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    } | null;
  }[];
}

export default function AdminCouplesPage() {
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    async function fetchCouples() {
      setLoading(true);
      try {
        const response = await getAdminCouples({ page, pageSize });
        setCouples(response.records as unknown as Couple[]);
        setTotal(response.total);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load couples.');
      } finally {
        setLoading(false);
      }
    }

    void fetchCouples();
  }, [page, pageSize]);

  if (loading) {
     return <div className="animate-pulse space-y-4">
        <div className="h-12 bg-white/5 rounded-xl w-64" />
        <div className="h-[600px] bg-white/5 rounded-[2.5rem]" />
     </div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-100">
        <h1 className="mb-2 text-2xl font-heading">Couple directory unavailable</h1>
        <p className="text-sm text-red-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-heading text-gradient-purple">Sacred Bonds</h1>
        <p className="text-white/40 font-serif">Monitoring the connected hearts across the platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {couples.map((couple) => (
          <div key={couple.id} className="premium-blur p-8 rounded-[2.5rem] border-white/5 space-y-6 group hover:border-primary/20 transition-all">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary opacity-40">
                   <Heart className="w-4 h-4 fill-current" />
                   <span className="text-[10px] uppercase tracking-widest font-heading">Union {couple.id.slice(0, 8)}</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/20 font-serif tabular-nums">
                   Since {format(new Date(couple.created_at), 'MMM yyyy')}
                </div>
             </div>

             <div className="flex items-center justify-between gap-4">
                {couple.couple_members.map((member, i) => (
                  <React.Fragment key={member.profile_id}>
                    <div className="flex flex-col items-center gap-3 flex-1">
                       <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                          {member.profiles?.avatar_url ? (
                            <Image src={member.profiles.avatar_url} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <UserIcon className="w-6 h-6 text-white/20" />
                          )}
                       </div>
                       <div className="text-center">
                          <div className="text-sm font-heading text-white/80">{member.profiles?.full_name || 'Anonymous'}</div>
                          <div className="text-[10px] text-white/30 lowercase tracking-widest">@{member.profiles?.username || 'user'}</div>
                       </div>
                    </div>
                    {i === 0 && (
                       <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                    )}
                  </React.Fragment>
                ))}
             </div>

             <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 font-heading">
                      <Calendar className="w-3 h-3" />
                      Next Meet
                   </div>
                   <div className="text-sm text-white/60 tabular-nums">
                      {couple.next_meet_date ? format(new Date(couple.next_meet_date), 'MMM d, yyyy') : 'No date set'}
                   </div>
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 font-heading">
                      <MapPin className="w-3 h-3" />
                      Distance
                   </div>
                   <div className="text-sm text-white/60 tabular-nums">
                      {couple.distance_apart_km ? `${Math.round(couple.distance_apart_km)} km` : 'Calculating...'}
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {couples.length === 0 && (
         <div className="py-40 text-center opacity-20">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <div className="font-heading uppercase tracking-[0.3em] text-sm">No bonds formed yet</div>
         </div>
      )}

      <div className="flex items-center justify-between px-4 pb-12">
        <span className="text-xs text-white/20 font-serif">
          Showing {total} active couples
        </span>
        <div className="flex gap-2">
           <button
             onClick={() => setPage((p) => Math.max(1, p - 1))}
             disabled={page <= 1 || loading}
             className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/60 disabled:opacity-20 disabled:cursor-not-allowed"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           <button
             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
             disabled={page >= totalPages || loading}
             className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/60 disabled:opacity-20 disabled:cursor-not-allowed"
           >
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
