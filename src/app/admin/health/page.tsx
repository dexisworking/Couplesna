'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Server,
  Cloud,
  Database as DbIcon,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { getAdminHealth } from '@/actions/admin';
import { format } from 'date-fns';

interface HealthMetricProps {
  label: string;
  status: string;
  detail: string;
  icon: React.ElementType;
}

const HealthMetric = ({ label, status, detail, icon: Icon }: HealthMetricProps) => (
  <div className="premium-blur p-8 rounded-[2rem] border-white/5 flex items-center justify-between group">
     <div className="flex items-center gap-6">
        <div className={`p-4 rounded-2xl ${status === 'ok' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
           <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
           <div className="text-sm font-heading uppercase tracking-widest">{label}</div>
           <div className="text-sm font-serif text-white/40">{detail}</div>
        </div>
     </div>
     {status === 'ok' ? (
       <CheckCircle2 className="w-5 h-5 text-green-500" />
     ) : (
       <XCircle className="w-5 h-5 text-red-500" />
     )}
  </div>
);

export default function AdminHealthPage() {
  const [health, setHealth] = useState<{
    supabase: { status: string; message: string };
    auth: { status: string; message: string };
    storage: { status: string; message: string };
    activity: {
      last24hEvents: number;
      last24hErrors: number;
      topEvents: { eventType: string; count: number }[];
      recentErrors: { id: string; eventType: string; description: string | null; createdAt: string }[];
    };
  }>({
    supabase: { status: 'loading', message: 'Checking...' },
    auth: { status: 'loading', message: 'Checking...' },
    storage: { status: 'loading', message: 'Checking...' },
    activity: {
      last24hEvents: 0,
      last24hErrors: 0,
      topEvents: [],
      recentErrors: [],
    },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const result = await getAdminHealth();
        setHealth(result);
        setError(null);
      } catch (healthError) {
        setError(healthError instanceof Error ? healthError.message : 'Failed to run health checks.');
      }
    }

    void checkHealth();
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-100">
        <h1 className="mb-2 text-2xl font-heading">Health checks unavailable</h1>
        <p className="text-sm text-red-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-heading text-gradient-purple">Operational Health</h1>
        <p className="text-white/40 font-serif">Monitoring the ethereal planes and infrastructure stability.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <HealthMetric 
            label="Database Core" 
            status={health.supabase.status} 
            detail={health.supabase.message}
            icon={DbIcon}
         />
         <HealthMetric 
            label="Authentication Layer" 
            status={health.auth.status} 
            detail={health.auth.message}
            icon={Server}
         />
         <HealthMetric 
            label="Content Storage" 
            status={health.storage.status} 
            detail={health.storage.message}
            icon={Cloud}
         />
         <HealthMetric 
            label="Edge Network" 
            status="ok" 
            detail="Global Availability (Vercel)"
            icon={Globe}
         />
      </div>

      <div className="premium-blur p-12 rounded-[2.5rem] border-white/5 space-y-6">
         <div className="flex items-center gap-4 text-primary">
            <Activity className="w-6 h-6 animate-pulse" />
            <span className="font-heading tracking-[0.2em] uppercase text-sm">Real-time pulse</span>
         </div>
         <p className="font-serif text-white/40 leading-relaxed italic">
            &quot;The architecture remains stable as long as the connection endures. We monitor all vital signs of the bond to ensure zero interruptions in the sanctuary.&quot;
         </p>
      </div>

      <div className="premium-blur p-8 rounded-[2.5rem] border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading">Admin Activity (Last 24h)</h2>
          <span className="text-xs uppercase tracking-widest text-white/40">Ops visibility</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Events</p>
            <p className="mt-2 text-3xl font-heading">{health.activity.last24hEvents}</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-200/70">Errors</p>
            <p className="mt-2 text-3xl font-heading text-red-100">{health.activity.last24hErrors}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm uppercase tracking-widest text-white/45">Top event types</h3>
            <div className="space-y-2">
              {health.activity.topEvents.map((entry) => (
                <div key={entry.eventType} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <span className="text-sm text-white/80">{entry.eventType}</span>
                  <span className="text-sm text-white/50">{entry.count}</span>
                </div>
              ))}
              {health.activity.topEvents.length === 0 && (
                <p className="text-sm text-white/35">No activity in the last 24 hours.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm uppercase tracking-widest text-white/45">Recent errors</h3>
            <div className="space-y-2">
              {health.activity.recentErrors.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-red-200/80">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{entry.eventType}</span>
                    <span>•</span>
                    <span>{format(new Date(entry.createdAt), 'MMM d, HH:mm')}</span>
                  </div>
                  <p className="mt-1 text-sm text-red-100/90">{entry.description || 'No description'}</p>
                </div>
              ))}
              {health.activity.recentErrors.length === 0 && (
                <p className="text-sm text-white/35">No recent errors recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
