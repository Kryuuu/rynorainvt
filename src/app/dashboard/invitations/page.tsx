'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Sparkles, 
  Plus, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Layers, 
  Copy, 
  Check, 
  Trash2,
  Users
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/lib/data-store';
import { formatDateWITA } from '@/lib/utils';

export default function InvitationsListPage() {
  const [invitations, setInvitations] = useState(dataStore.getInvitationsByWorkspace('ws_personal_01'));
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (slug: string) => {
    const url = `${window.location.origin}/i/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Koleksi Undangan</span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
              Daftar Undangan Digital Anda
            </h1>
            <p className="text-xs sm:text-sm text-[#636965]">
              Buat undangan baru, edit seksi, dan publikasikan tautan khusus untuk setiap acara.
            </p>
          </div>

          <Link href="/editor/new">
            <Button variant="gold" size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Buat Undangan Baru
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map((inv) => (
            <div key={inv.id} className="luxury-card rounded-2xl p-6 bg-white border border-[#E8E3DA] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={inv.status === 'published' ? 'success' : 'outline'} className="text-[10px]">
                    {inv.status === 'published' ? 'Diterbitkan' : 'Draft'}
                  </Badge>
                  <span className="text-xs text-[#7A807C]">
                    {formatDateWITA(inv.event_data.event_date)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">{inv.title}</h3>
                  <p className="text-xs text-[#636965]">
                    Kategori: <span className="font-semibold capitalize">{inv.category}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-between text-xs">
                  <span className="font-mono text-[#7A807C] truncate">/i/{inv.slug}</span>
                  <button
                    onClick={() => handleCopy(inv.slug)}
                    className="text-[#9A7B4F] hover:text-[#1F2421] font-semibold text-xs flex items-center gap-1"
                  >
                    {copiedSlug === inv.slug ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E3DA] flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2">
                  <Link href={`/i/${inv.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/dashboard/guests?invitation=${inv.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Tamu
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-2">
                  <Link href={`/editor/${inv.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Simple
                    </Button>
                  </Link>
                  <Link href={`/editor/${inv.id}/visual`}>
                    <Button variant="gold" size="sm" className="text-xs">
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      Visual
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
