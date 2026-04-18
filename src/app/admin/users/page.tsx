'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Search, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Link as LinkIcon,
  ShieldCheck,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { exportAdminUsersCsv, getAdminUsers } from '@/actions/admin';

interface UserLocation {
  city?: string;
  country?: string;
}

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  location: UserLocation | null;
  couple_members: { couple_id: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await getAdminUsers({ page, pageSize, search: searchTerm });
        setUsers(response.records as User[]);
        setTotal(response.total);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, [page, pageSize, searchTerm]);

  const downloadCsv = async () => {
    try {
      setIsExporting(true);
      const csv = await exportAdminUsersCsv(searchTerm);
      const blob = new Blob([csv.content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = csv.filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-4">
        <div className="h-12 bg-white/5 rounded-xl w-64" />
        <div className="h-[600px] bg-white/5 rounded-[2.5rem]" />
     </div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-100">
        <h1 className="mb-2 text-2xl font-heading">User directory unavailable</h1>
        <p className="text-sm text-red-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading text-gradient-purple">User Directory</h1>
          <p className="text-white/40 font-serif">A census of all souls connected via Couplesna.</p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-[520px]">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Filter by email, name or username..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-serif focus:ring-1 focus:ring-primary/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={downloadCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/[0.08] disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="premium-blur rounded-[2.5rem] border-white/5 overflow-hidden">
        <table className="w-full text-left font-serif">
          <thead>
            <tr className="border-b border-white/5 text-white/20 text-[10px] uppercase tracking-[0.3em]">
               <th className="px-8 py-6">User</th>
               <th className="px-8 py-6">Details</th>
               <th className="px-8 py-6">Status</th>
               <th className="px-8 py-6">Joined</th>
               <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <UserIcon className="w-5 h-5 text-primary/40" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-heading">{user.full_name || 'Anonymous'}</span>
                      <span className="text-xs text-white/30">@{user.username}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <MapPin className="w-3 h-3" />
                      {user.location?.city || 'Unknown'}, {user.location?.country || '??'}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col gap-2">
                      {user.role === 'admin' && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] uppercase font-heading tracking-widest border border-green-500/20 w-fit">
                           <ShieldCheck className="w-3 h-3" />
                           Admin
                        </div>
                      )}
                      {user.couple_members?.length > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orchid/10 text-orchid text-[10px] uppercase font-heading tracking-widest border border-orchid/20 w-fit">
                           <LinkIcon className="w-3 h-3" />
                           Bonded
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-white/30 text-[10px] uppercase font-heading tracking-widest border border-white/10 w-fit">
                           Single
                        </div>
                      )}
                   </div>
                </td>
                <td className="px-8 py-6 text-sm tabular-nums text-white/40">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-8 py-6 text-right text-xs text-white/30">{user.id.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2 pb-4">
        <span className="text-xs text-white/30">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-white/70 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs text-white/40">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-white/70 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
