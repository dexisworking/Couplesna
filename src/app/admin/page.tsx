'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Map as MapIcon, 
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { getAdminDashboardSnapshot } from '@/actions/admin';

const statColorClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  orchid: 'bg-orchid/10 text-orchid',
  lavender: 'bg-lavender/10 text-lavender',
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
  <div className="premium-blur p-8 rounded-[2rem] border-white/5 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-heading">{title}</span>
      <div className={`p-3 rounded-xl ${statColorClasses[color] || statColorClasses.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-4xl font-heading tracking-tight">{value}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    aiRequestsToday: number;
    mapRequestsToday: number;
    recentLogs: {
      id: string;
      event_type: string;
      created_at: string;
      description: string | null;
      profiles: { email: string | null } | null;
    }[];
  }>({
    totalUsers: 0,
    aiRequestsToday: 0,
    mapRequestsToday: 0,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const snapshot = await getAdminDashboardSnapshot();
        setStats(snapshot);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-40 bg-white/5 rounded-[2rem]" />
      <div className="grid grid-cols-3 gap-8">
         <div className="h-40 bg-white/5 rounded-[2rem]" />
         <div className="h-40 bg-white/5 rounded-[2rem]" />
         <div className="h-40 bg-white/5 rounded-[2rem]" />
      </div>
    </div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-100">
        <h1 className="mb-2 text-2xl font-heading">Admin dashboard unavailable</h1>
        <p className="text-sm text-red-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-5xl font-heading text-gradient-purple">Intelligence Hub</h1>
        <p className="text-white/40 font-serif text-lg italic">Overseeing the connection architecture.</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Active Souls" value={stats.totalUsers} icon={Users} color="primary" />
        <StatCard title="AI Muses Summoned" value={stats.aiRequestsToday} icon={Sparkles} color="orchid" />
        <StatCard title="Coordinate Lookups" value={stats.mapRequestsToday} icon={MapIcon} color="lavender" />
      </div>

      {/* Logs Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-heading tracking-tight">Incidents & Events</h3>
           <TrendingUp className="w-5 h-5 text-primary opacity-40" />
        </div>

        <div className="premium-blur rounded-[2.5rem] border-white/5 overflow-hidden">
           <table className="w-full text-left font-serif">
              <thead>
                <tr className="border-b border-white/5 text-white/20 text-[10px] uppercase tracking-[0.3em]">
                   <th className="px-8 py-6">Timestamp</th>
                   <th className="px-8 py-6">Identity</th>
                   <th className="px-8 py-6">Event Type</th>
                   <th className="px-8 py-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {stats.recentLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 text-sm tabular-nums text-white/40">
                       {format(new Date(log.created_at), 'HH:mm:ss • MMM d')}
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-heading">{log.profiles?.email || 'System'}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${
                         log.event_type.includes('error') 
                         ? 'border-red-500/20 text-red-500 bg-red-500/5' 
                         : log.event_type.includes('ai')
                         ? 'border-orchid/20 text-orchid bg-orchid/5'
                         : 'border-white/10 text-white/60 bg-white/5'
                       }`}>
                         {log.event_type}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-white/40 italic">
                       {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
