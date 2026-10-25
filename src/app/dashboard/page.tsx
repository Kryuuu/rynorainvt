'use client';

import Link from 'next/link';
import { 
  Sparkles, 
  Mail, 
  Users, 
  CheckCircle, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Layers, 
  Copy, 
  Clock, 
  PlusCircle, 
  Check 
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataStore } from '@/lib/data-store';
import { formatDateWITA } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardOverviewPage() {
  const { user, profile } = useAuth();
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Andi Pratama';

  const invitations = dataStore.getInvitationsByWorkspace('ws_personal_01');
  const guests = dataStore.getGuestsByInvitation('inv_andi_siti');
  const rsvps = dataStore.rsvps.filter(r => r.invitation_id === 'inv_andi_siti');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const attendingCount = rsvps.filter(r => r.attendance_status === 'attending').length;

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/i/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
              Dashboard Personal
            </span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
              Selamat Datang, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-[#636965]">
              Kelola undangan pernikahan Anda, pantau konfirmasi tamu, dan sesuaikan desain website digital Anda.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/editor/new">
              <Button variant="gold" size="sm" className="shadow-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Buat Undangan Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Active Invitations */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A807C] uppercase tracking-wider">Undangan Aktif</span>
              <div className="w-8 h-8 rounded-lg bg-[#F3EFE6] flex items-center justify-center text-[#1F2421]">
                <Mail className="w-4 h-4 text-[#C5A880]" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                {invitations.length} / 3
              </p>
              <p className="text-[11px] text-[#7A807C]">Kuota paket Personal Plus</p>
            </div>
          </div>

          {/* Card 2: Registered Guests (Highlighting Critical Guest Limits) */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A807C] uppercase tracking-wider">Tamu Terdaftar</span>
              <div className="w-8 h-8 rounded-lg bg-[#F3EFE6] flex items-center justify-center text-[#1F2421]">
                <Users className="w-4 h-4 text-[#C5A880]" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                {guests.length} / 1.000
              </p>
              <p className="text-[11px] text-[#9A7B4F] font-medium">Batas per undangan (Maks 1.000)</p>
            </div>
          </div>

          {/* Card 3: RSVP Confirmations */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7A807C] uppercase tracking-wider">Konfirmasi RSVP</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                {attendingCount} Hadir
              </p>
              <p className="text-[11px] text-[#7A807C]">{rsvps.length} total respon masuk</p>
            </div>
          </div>

          {/* Card 4: Active Plan */}
          <div className="p-5 rounded-2xl bg-[#1F2421] text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Paket Langganan</span>
              <Badge variant="gold" className="text-[9px]">Aktif</Badge>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif-luxury text-xl font-bold text-[#C5A880]">Personal Plus</p>
              <p className="text-[11px] text-gray-300">Berlaku s.d. 14 Nov 2026</p>
            </div>
          </div>

        </div>

        {/* Invitations Management Table */}
        <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-[#E8E3DA] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                Daftar Undangan Anda
              </h2>
              <p className="text-xs text-[#7A807C]">
                Pilih undangan untuk mengedit data, membuka visual editor, atau mengelola buku tamu.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E8E3DA]">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                      {inv.title}
                    </h3>
                    {inv.status === 'published' ? (
                      <Badge variant="success" className="text-[10px]">Diterbitkan</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Draft</Badge>
                    )}
                    <span className="text-xs text-[#7A807C]">
                      • {formatDateWITA(inv.event_data.event_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#636965]">
                    <span>Tautan Publik:</span>
                    <a
                      href={`/i/${inv.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9A7B4F] underline flex items-center gap-1 font-mono"
                    >
                      /i/{inv.slug}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Actions Button Group */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(inv.slug)}
                    className="p-2 rounded-lg border border-[#E8E3DA] bg-white hover:bg-[#F3EFE6] text-xs text-[#1F2421] flex items-center gap-1"
                    title="Salin Tautan"
                  >
                    {copiedSlug === inv.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#C5A880]" />
                    )}
                    <span>{copiedSlug === inv.slug ? 'Tersalin' : 'Salin Link'}</span>
                  </button>

                  <Link href={`/dashboard/guests?invitation=${inv.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Tamu & RSVP ({guests.length})
                    </Button>
                  </Link>

                  <Link href={`/editor/${inv.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Simple Edit
                    </Button>
                  </Link>

                  <Link href={`/editor/${inv.id}/visual`}>
                    <Button variant="gold" size="sm" className="text-xs">
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      Visual Editor
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
