'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Users, 
  Sparkles, 
  Map as MapIcon, 
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="premium-blur p-8 rounded-[2rem] border-white/5 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-heading">{title}</span>
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-4xl font-heading tracking-tight">{value}</div>
  </div>
);

export default function AdminDashboard() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState({
    totalUsers: 0,
    aiRequestsToday: 0,
    mapRequestsToday: 0,
    recentLogs: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Total Users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. AI Requests Today
      const { count: aiCount } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'ai_request')
        .gte('created_at', today.toISOString());

      // 3. Map Requests Today
      const { count: mapCount } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'map_request')
        .gte('created_at', today.toISOString());

      // 4. Recent Logs
      const { data: logs } = await supabase
        .from('system_logs')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: usersCount || 0,
        aiRequestsToday: aiCount || 0,
        mapRequestsToday: mapCount || 0,
        recentLogs: logs || []
      });
      setLoading(false);
    }

    fetchStats();
  }, [supabase]);

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
