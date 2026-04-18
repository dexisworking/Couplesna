'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  ScrollText, 
  LogOut, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { getClientProjectVersion } from '@/actions/version';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [version, setVersion] = React.useState('...');
  const handleLogout = async () => {
    await fetch('/api/admin-auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };


  React.useEffect(() => {
    getClientProjectVersion().then(setVersion);
  }, []);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

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
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading tracking-tight text-gradient-purple">Couplesna Admin</span>
          </div>
          <div className="dex-panel p-3">
            <p className="dex-kicker mb-2">Ops Console</p>
            <div className="dex-mono text-xs text-white/60 space-y-1">
              <p>admin@couplesna ~ control</p>
              <p>&gt; monitor users --logs --health</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-heading text-sm tracking-widest uppercase">{item.label}</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button
            onClick={handleLogout}
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
          <div className="mb-8 flex items-center justify-between">
            <p className="dex-kicker">Admin Operations Surface</p>
            <p className="dex-mono text-xs text-white/35">coupleadmin.iamdex.codes</p>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
