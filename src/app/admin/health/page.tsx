'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Server,
  Cloud,
  Database as DbIcon,
  Globe
} from 'lucide-react';
import { getAdminHealth } from '@/actions/admin';

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
  const [health, setHealth] = useState<Record<string, { status: string; message: string }>>({
    supabase: { status: 'loading', message: 'Checking...' },
    auth: { status: 'loading', message: 'Checking...' },
    storage: { status: 'loading', message: 'Checking...' }
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
    </div>
  );
}
