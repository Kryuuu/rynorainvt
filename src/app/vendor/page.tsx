'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  Layers, 
  CreditCard, 
  Sparkles, 
  Plus, 
  Search, 
  ExternalLink, 
  Eye, 
  Edit3, 
  UserPlus, 
  ShieldCheck, 
  Palette, 
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/lib/data-store';
import { VendorClient } from '@/types';
import { formatDateWITA } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function VendorPortalPage() {
  const { user, profile, isLoading } = useAuth();
  const vendorWorkspace = dataStore.workspaces.ws_vendor;
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'projects' | 'team' | 'branding'>('overview');

  const [clients, setClients] = useState<VendorClient[]>(dataStore.vendorClients);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [clientModalOpen, setClientModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-2xl bg-[#1F2421] text-[#C5A880] flex items-center justify-center mb-3 animate-spin">
          <Building2 className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-[#1F2421]">Memverifikasi akses Vendor Studio...</p>
      </div>
    );
  }

  if (!user && !profile) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-[#E8E3DA] rounded-3xl p-8 space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#1F2421] text-[#C5A880] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
              Login Vendor Diperlukan
            </h2>
            <p className="text-xs text-[#7A807C]">
              Akses Vendor Studio Portal khusus untuk mitra dan vendor terdaftar. Silakan masuk terlebih dahulu.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login?redirectTo=/vendor"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#1F2421] text-white text-xs font-semibold hover:bg-[#2D312E] transition-colors"
            >
              Masuk ke Portal Vendor
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center py-2 px-4 text-xs text-[#7A807C] hover:text-[#1F2421]"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vendor branding state
  const [brandName, setBrandName] = useState(vendorWorkspace.settings.brand_name || 'Lentera Creative Studio');
  const [brandPhone, setBrandPhone] = useState(vendorWorkspace.settings.contact_phone || '081233445566');
  const [brandColor, setBrandColor] = useState(vendorWorkspace.settings.brand_color || '#C5A880');
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Vendor Projects
  const vendorProjects = dataStore.invitations.filter(i => i.workspace_id === 'ws_vendor_01');
  const remainingCredits = 29; // Out of 30 monthly quota

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newC: VendorClient = {
      id: `vc_${Date.now()}`,
      workspace_id: 'ws_vendor_01',
      name: newClientName,
      phone: newClientPhone || null,
      email: newClientEmail || null,
      notes: newClientNotes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setClients([...clients, newC]);
    setClientModalOpen(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientNotes('');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    vendorWorkspace.settings.brand_name = brandName;
    vendorWorkspace.settings.contact_phone = brandPhone;
    vendorWorkspace.settings.brand_color = brandColor;
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col">
      {/* Top Vendor Header Bar */}
      <header className="h-16 bg-[#1F2421] text-white px-4 sm:px-8 flex items-center justify-between border-b border-[#E8E3DA] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Ke Dashboard Personal</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880] text-black font-serif-luxury font-bold flex items-center justify-center">
              L
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-sm leading-tight block">
                {brandName}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400">
                Vendor Studio Portal
              </span>
            </div>
          </div>
        </div>

        {/* Studio Credits Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs">
            <span className="text-gray-300">Sisa Kuota Publikasi:</span>
            <span className="font-bold text-[#C5A880]">{remainingCredits} / 30</span>
          </div>
          <Badge variant="gold" className="text-[10px] hidden sm:inline-flex">Vendor Studio Plan</Badge>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[#E8E3DA] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Ringkasan Studio', icon: Building2 },
            { id: 'clients', label: `Klien (${clients.length})`, icon: Users },
            { id: 'projects', label: `Proyek Undangan (${vendorProjects.length})`, icon: Layers },
            { id: 'team', label: 'Tim Studio (3 Seats)', icon: UserPlus },
            { id: 'branding', label: 'Vendor Branding', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#1F2421] text-[#1F2421]'
                    : 'border-transparent text-[#7A807C] hover:text-[#1F2421]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : 'text-[#7A807C]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Vendor Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A807C]">Total Klien Terdaftar</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#1F2421]">{clients.length}</p>
                <p className="text-[11px] text-[#7A807C]">Calon pengantin & acara</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A807C]">Proyek Undangan Aktif</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#1F2421]">{vendorProjects.length}</p>
                <p className="text-[11px] text-[#7A807C]">Unlimited kapasitas proyek</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A807C]">Kuota Tamu per Proyek</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#C5A880]">Unlimited</p>
                <p className="text-[11px] text-emerald-700 font-medium">Bebas batas tamu per undangan</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1F2421] text-white shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-300">Sisa Kredit Publikasi</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#C5A880]">{remainingCredits} / 30</p>
                <p className="text-[11px] text-gray-300">Reset periode berikutnya</p>
              </div>
            </div>

            {/* Recent Client Projects */}
            <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">Proyek Undangan Klien Terbaru</h3>
                <Button variant="gold" size="sm" onClick={() => setActiveTab('projects')} className="text-xs">
                  Semua Proyek
                </Button>
              </div>

              <div className="divide-y divide-[#E8E3DA]">
                {vendorProjects.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-[#1F2421]">{p.title}</h4>
                      <p className="text-xs text-[#7A807C]">Slug: /i/{p.slug} • Template: Elegant Floral</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/i/${p.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/editor/${p.id}/visual`}>
                        <Button variant="gold" size="sm" className="text-xs">
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Visual Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: CLIENT MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'clients' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                  Direktori Klien Studio
                </h2>
                <p className="text-xs text-[#7A807C]">
                  Daftar pasangan dan penyelenggara yang menggunakan jasa studio Anda.
                </p>
              </div>
              <Button variant="gold" size="sm" onClick={() => setClientModalOpen(true)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Klien Baru
              </Button>
            </div>

            <div className="divide-y divide-[#E8E3DA]">
              {clients.map((c) => (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[#1F2421]">{c.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-[#636965]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#C5A880]" />
                        {c.phone || '-'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#C5A880]" />
                        {c.email || '-'}
                      </span>
                    </div>
                    {c.notes && <p className="text-xs text-[#7A807C] italic">Catatan: {c.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Link href="/editor/new">
                      <Button variant="outline" size="sm" className="text-xs">
                        Buat Undangan Klien
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: PROJECTS */}
        {/* ==================================================================== */}
        {activeTab === 'projects' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Proyek Undangan Klien</h2>
                <p className="text-xs text-[#7A807C]">Semua proyek undangan vendor memiliki batas kuota Unlimited Tamu.</p>
              </div>
              <Link href="/editor/new">
                <Button variant="gold" size="sm" className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Mulai Proyek Baru
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-[#E8E3DA]">
              {vendorProjects.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-luxury font-bold text-lg text-[#1F2421]">{p.title}</h4>
                      <Badge variant="gold" className="text-[9px]">Unlimited Tamu</Badge>
                      <Badge variant="success" className="text-[9px]">{p.status}</Badge>
                    </div>
                    <p className="text-xs text-[#636965]">Tautan Publik: /i/{p.slug}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/i/${p.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                    </Link>
                    <Link href={`/editor/${p.id}/visual`}>
                      <Button variant="gold" size="sm" className="text-xs">
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Visual Editor
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: TEAM SEATS */}
        {/* ==================================================================== */}
        {activeTab === 'team' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden p-6 space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Manajemen Anggota Tim</h2>
              <p className="text-xs text-[#7A807C]">Paket Vendor Studio mencakup 3 kursi anggota tim (Owner, Admin, Editor).</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Budi Santoso', email: 'budi@lenterastudio.id', role: 'Owner', status: 'Aktif' },
                { name: 'Rina Wijaya', email: 'rina.design@lenterastudio.id', role: 'Editor', status: 'Aktif' },
                { name: 'Slot Tim Kosong', email: 'Undang desainer atau admin baru...', role: 'Editor', status: 'Tersedia' },
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[#1F2421]">{m.name}</h4>
                    <p className="text-xs text-[#7A807C]">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.role === 'Owner' ? 'gold' : 'secondary'} className="text-[10px]">
                      {m.role}
                    </Badge>
                    <span className="text-xs text-gray-500">{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: VENDOR BRANDING */}
        {/* ==================================================================== */}
        {activeTab === 'branding' && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 max-w-xl space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Pengaturan Vendor Branding</h2>
              <p className="text-xs text-[#7A807C]">Identitas studio Anda yang akan muncul pada footer undangan klien.</p>
            </div>

            {brandingSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan identitas vendor branding berhasil diperbarui!</span>
              </div>
            )}

            <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Nama Studio / Brand Vendor</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">No. Kontak WhatsApp Studio</label>
                <input
                  type="text"
                  value={brandPhone}
                  onChange={(e) => setBrandPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Warna Aksen Brand Studio</label>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full h-10 p-1 rounded-lg border border-[#E8E3DA]"
                />
              </div>

              <Button variant="gold" size="sm" type="submit" className="w-full">
                Simpan Perubahan Branding
              </Button>
            </form>
          </div>
        )}

      </main>

      {/* Modal: Tambah Klien */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E3DA] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#E8E3DA] pb-2">
              <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">Tambah Klien Baru</h3>
              <button onClick={() => setClientModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Nama Klien / Pasangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dimas & Anggi"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">No. WhatsApp</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Email Klien</label>
                <input
                  type="email"
                  placeholder="klien@gmail.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Catatan Paket Acara</label>
                <textarea
                  rows={2}
                  placeholder="Paket Akad & Resepsi..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setClientModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Simpan Klien
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
