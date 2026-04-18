'use client';

import React, { useEffect, useState } from 'react';
import { 
  ScrollText, 
  ChevronLeft, 
  ChevronRight,
  Info,
  AlertTriangle,
  Zap,
  Map as MapIcon,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { getAdminLogs } from '@/actions/admin';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<{
    id: string;
    created_at: string;
    event_type: string;
    description: string | null;
    metadata: Record<string, unknown> | null;
    profiles: { email: string | null; username: string | null } | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getAdminLogs(filter);
        setLogs(data);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load logs.');
      } finally {
        setLoading(false);
      }
    }

    void fetchLogs();
  }, [filter]);

  const filteredLogs = logs.filter(log => 
    log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eventTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'ai_request', label: 'AI Genkit' },
    { value: 'map_request', label: 'Map Syncs' },
    { value: 'login_success', label: 'Success Logins' },
    { value: 'errors', label: 'Errors' },
  ];

  if (loading) {
    return <div className="animate-pulse space-y-8">
       <div className="h-20 bg-white/5 rounded-2xl" />
       <div className="h-[600px] bg-white/5 rounded-[2.5rem]" />
    </div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-100">
        <h1 className="mb-2 text-2xl font-heading">Logs unavailable</h1>
        <p className="text-sm text-red-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading text-gradient-purple">System Logs</h1>
          <p className="text-white/40 font-serif">The immutable ledger of all cosmic shifts within Couponsna.</p>
        </div>

        <div className="flex items-center gap-4">
           {eventTypes.map(t => (
             <button 
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-heading transition-all ${
                    filter === t.value 
                    ? 'bg-primary text-white' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
             >
                {t.label}
             </button>
           ))}
        </div>
      </div>

      <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search within logs..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-serif focus:ring-1 focus:ring-primary/40 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="premium-blur rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="flex flex-col divide-y divide-white/[0.02]">
            {filteredLogs.map((log) => (
               <div key={log.id} className="p-8 hover:bg-white/[0.01] transition-all group flex flex-col md:flex-row gap-8">
                  <div className="w-40 shrink-0">
                     <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-heading mb-1">Timestamp</div>
                     <div className="text-sm font-serif tabular-nums text-white/60">
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                     </div>
                  </div>
                  
                  <div className="w-48 shrink-0">
                     <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-heading mb-1">Event</div>
                     <div className="flex items-center gap-2">
                        {log.event_type.includes('ai') ? <Zap className="w-3 h-3 text-orchid" /> : 
                         log.event_type.includes('map') ? <MapIcon className="w-3 h-3 text-lavender" /> :
                         log.event_type.includes('error') ? <AlertTriangle className="w-3 h-3 text-red-500" /> :
                         <Info className="w-3 h-3 text-primary" />}
                        <span className="text-xs font-heading uppercase tracking-widest">{log.event_type}</span>
                     </div>
                  </div>

                  <div className="flex-1">
                     <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-heading mb-1">Details</div>
                     <div className="text-sm font-serif text-white/80 leading-relaxed italic">
                        &quot;{log.description}&quot;
                     </div>
                     {log.profiles && (
                       <div className="mt-2 text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          Initiated by {log.profiles.email}
                       </div>
                     )}
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="w-32 shrink-0 flex items-center justify-end">
                       <button 
                          className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                          onClick={() => console.log(log.metadata)}
                       >
                          Meta
                       </button>
                    </div>
                  )}
               </div>
            ))}
        </div>
        
        {filteredLogs.length === 0 && (
           <div className="py-40 text-center flex flex-col items-center gap-4 opacity-20">
              <ScrollText className="w-12 h-12" />
              <div className="font-heading uppercase tracking-[0.3em] text-sm">No echoes found</div>
           </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pb-12">
        <span className="text-xs text-white/20 font-serif">Showing latest {filteredLogs.length} events</span>
        <div className="flex gap-2">
           <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
           <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
