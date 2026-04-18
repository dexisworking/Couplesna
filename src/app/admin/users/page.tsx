'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  MoreVertical,
  Link as LinkIcon,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

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
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          couple_members (
            couple_id
          )
        `)
        .order('created_at', { ascending: false });

      if (data) setUsers(data as User[]);
      setLoading(false);
    }

    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
     return <div className="animate-pulse space-y-4">
        <div className="h-12 bg-white/5 rounded-xl w-64" />
        <div className="h-[600px] bg-white/5 rounded-[2.5rem]" />
     </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading text-gradient-purple">User Directory</h1>
          <p className="text-white/40 font-serif">A census of all souls connected via Couplesna.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Filter by email, name or username..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-serif focus:ring-1 focus:ring-primary/40 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            {filteredUsers.map((user) => (
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
                <td className="px-8 py-6 text-right">
                   <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
