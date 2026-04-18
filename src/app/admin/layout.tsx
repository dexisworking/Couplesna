'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  ScrollText, 
  LogOut, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { getClientProjectVersion } from '@/actions/version';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAppContext();
  const [version, setVersion] = React.useState('...');

  React.useEffect(() => {
    getClientProjectVersion().then(setVersion);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: BarChart3, href: '/admin' },
    { label: 'User Directory', icon: Users, href: '/admin/users' },
    { label: 'System Logs', icon: ScrollText, href: '/admin/logs' },
    { label: 'Operational Health', icon: Activity, href: '/admin/health' },
  ];

  return (
    <div className="flex min-h-screen bg-[#070708] text-foreground font-serif">
      {/* Admin Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col fixed inset-y-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-heading tracking-tight text-gradient-purple">Couplesna Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                  isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-heading text-sm tracking-widest uppercase">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
           <button 
             onClick={signOut}
             className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
           >
             <LogOut className="w-5 h-5" />
             <span className="font-heading text-sm tracking-widest uppercase">Exit Control</span>
           </button>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
           <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/20 font-heading">
              <span>Project Sanctum</span>
              <span className="text-primary/40">{version}</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 flex-1 p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
