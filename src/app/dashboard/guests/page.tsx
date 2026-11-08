'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Upload, 
  Download, 
  QrCode, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Mail,
  ShieldAlert,
  Camera,
  Share2
} from 'lucide-react';
import QRCode from 'qrcode';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/lib/data-store';
import { Guest, RsvpResponse } from '@/types';
import { formatGuestUsageBadge, checkGuestCreationLimit } from '@/lib/billing/entitlements';
import { DEFAULT_PERSONAL_PLUS_ENTITLEMENTS } from '@/lib/billing/plans';
import { formatDateWITA } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { errorMessage as toErrorMessage, copyText } from '@/lib/feedback';

export default function GuestManagementPage() {
  const invitationId = 'inv_andi_siti';
  const invitation = dataStore.getInvitationById(invitationId);
  const [guests, setGuests] = useState<Guest[]>(dataStore.getGuestsByInvitation(invitationId));
  const [rsvps, setRsvps] = useState<RsvpResponse[]>(dataStore.rsvps.filter(r => r.invitation_id === invitationId));

  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps'>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [qrModalGuest, setQrModalGuest] = useState<Guest | null>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedScannerLink, setCopiedScannerLink] = useState(false);
  const toast = useToast();

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestCategory, setNewGuestCategory] = useState('Sahabat');
  const [newGuestPax, setNewGuestPax] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CSV Import State
  const [csvInput, setCsvInput] = useState('');
  const [csvValidationResult, setCsvValidationResult] = useState<any>(null);

  // Effective entitlements for Andi & Siti (Personal Plus: 1,000 max guests)
  const entitlements = DEFAULT_PERSONAL_PLUS_ENTITLEMENTS;
  const usageBadge = formatGuestUsageBadge(guests.length, entitlements);

  // Filtered lists
  const filteredGuests = guests.filter(g => {
    const matchesQuery = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.phone && g.phone.includes(searchQuery));
    const matchesCat = categoryFilter === 'all' || g.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const created = dataStore.addGuest(invitationId, {
        name: newGuestName,
        phone: newGuestPhone || null,
        email: null,
        category: newGuestCategory,
        pax_limit: newGuestPax,
      });

      setGuests([...guests, created]);
      setAddGuestModalOpen(false);
      setNewGuestName('');
      setNewGuestPhone('');
      toast.success('Tamu berhasil ditambahkan!', `${created.name} tersimpan dan tetap ada setelah halaman di-refresh.`);
    } catch (err: unknown) {
      const msg = toErrorMessage(err, 'Gagal menambahkan tamu');
      setErrorMessage(msg);
      toast.error('Gagal menambahkan tamu', msg);
    }
  };

  const handleValidateCsv = () => {
    const lines = csvInput.trim().split('\n').filter(l => l.trim().length > 0);
    const parsed = lines.map(line => {
      const parts = line.split(',');
      return {
        name: parts[0]?.trim() || '',
        phone: parts[1]?.trim() || '',
        category: parts[2]?.trim() || 'Tamu',
        pax_limit: parts[3] ? parseInt(parts[3].trim()) : 1,
      };
    }).filter(p => p.name.length > 0);

    const limitCheck = checkGuestCreationLimit(guests.length, entitlements, parsed.length);

    setCsvValidationResult({
      totalRows: parsed.length,
      parsed,
      allowed: limitCheck.allowed,
      errorMessage: limitCheck.errorMessage,
      remainingCapacity: limitCheck.remainingCapacity,
    });
  };

  const handleCommitCsvImport = () => {
    if (!csvValidationResult || !csvValidationResult.allowed) return;

    try {
      const added = dataStore.batchAddGuests(invitationId, csvValidationResult.parsed);
      setGuests([...guests, ...added]);
      setCsvModalOpen(false);
      setCsvInput('');
      setCsvValidationResult(null);
      toast.success('Import CSV berhasil!', `${added.length} tamu berhasil ditambahkan dan tersimpan.`);
    } catch (err: unknown) {
      toast.error('Gagal import CSV', toErrorMessage(err, 'Gagal import') + ' — tidak ada tamu yang ditambahkan, silakan coba lagi.');
    }
  };

  const handleGuestCheckIn = (guest: Guest) => {
    try {
      const res = dataStore.checkInGuestById(guest.id, 'dashboard_host');
      if (res.success) {
        setGuests([...dataStore.getGuestsByInvitation(invitationId)]);
        toast.success('Check-in berhasil!', `${guest.name} telah dicatat hadir.`);
      } else {
        toast.error('Check-in gagal', res.error || 'Gagal memproses check-in.');
      }
    } catch (err) {
      toast.error('Check-in gagal', toErrorMessage(err, 'Gagal memproses check-in.'));
    }
  };

  const handleGuestUndoCheckIn = (guest: Guest) => {
    try {
      dataStore.undoCheckIn(guest.id);
      setGuests([...dataStore.getGuestsByInvitation(invitationId)]);
      toast.success('Presensi dibatalkan', `Status kehadiran ${guest.name} dikembalikan ke Belum Hadir.`);
    } catch (err) {
      toast.error('Gagal membatalkan presensi', toErrorMessage(err, 'Gagal membatalkan presensi.'));
    }
  };

  const handleOpenQrModal = (guest: Guest) => {
    setQrModalGuest(guest);
    QRCode.toDataURL(guest.qr_code_token, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1F2421',
        light: '#FFFFFF',
      },
    }).then(setQrModalDataUrl).catch(console.error);
  };

  const handleCopyScannerLink = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/checkin/andi-siti`;
    if (await copyText(url)) {
      setCopiedScannerLink(true);
      setTimeout(() => setCopiedScannerLink(false), 2000);
      toast.success('Tautan meja panitia berhasil disalin!', 'Bagikan tautan ini ke panitia/usher.');
    } else {
      toast.error('Gagal menyalin tautan', 'Browser tidak mengizinkan akses clipboard. Salin URL secara manual dari address bar.');
    }
  };

  const handleCopyPersonalLink = async (guest: Guest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/i/andi-siti?to=${encodeURIComponent(guest.name)}&u=${guest.invitation_token}`;
    if (await copyText(url)) {
      setCopiedToken(guest.invitation_token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success('Tautan personal berhasil disalin!', `Tautan undangan untuk ${guest.name} siap dibagikan.`);
    } else {
      toast.error('Gagal menyalin tautan', 'Browser tidak mengizinkan akses clipboard. Salin URL secara manual dari address bar.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header & Guest Entitlement Progress Bar */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
                  Manajemen Undangan & Tamu
                </span>
                <Badge variant="gold" className="text-[10px]">The Wedding of Andi & Siti</Badge>
              </div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
                Daftar Tamu, RSVP & QR Check-in
              </h1>
              <p className="text-xs sm:text-sm text-[#636965]">
                Kelola daftar penerima undangan personal, kirim tautan khusus, dan pantau status kehadiran tamu secara real-time.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/checkin/andi-siti" target="_blank">
                <Button variant="gold" size="sm" className="text-xs shadow-sm">
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Buka Scanner QR (Buku Tamu)
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyScannerLink}
                className="text-xs"
                title="Salin tautan meja penerima tamu untuk dibagikan ke panitia/usher"
              >
                {copiedScannerLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                    <span>Link Meja Panitia</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCsvModalOpen(true)}
                className="text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setErrorMessage(null); setAddGuestModalOpen(true); }}
                className="text-xs"
                disabled={usageBadge.isFull}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5 text-[#C5A880]" />
                Tambah Tamu
              </Button>
            </div>
          </div>

          {/* CRITICAL GUEST LIMIT USAGE BAR */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1F2421]">
                Penggunaan Kuota Tamu: <span className="font-bold text-[#9A7B4F]">{usageBadge.text}</span>
              </span>
              <span className="text-[#7A807C]">
                {usageBadge.isUnlimited ? 'Unlimited (Bebas Batas)' : `${usageBadge.percent}% terpakai`}
              </span>
            </div>
            {!usageBadge.isUnlimited && (
              <div className="w-full h-2 rounded-full bg-[#EAE5DC] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usageBadge.percent >= 90 ? 'bg-red-500' : 'bg-[#C5A880]'
                  }`}
                  style={{ width: `${usageBadge.percent}%` }}
                />
              </div>
            )}
            {usageBadge.isFull && (
              <div className="flex items-center gap-2 text-xs text-red-600 font-medium pt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Batas kuota tamu untuk undangan ini telah tercapai. Tingkatkan paket ke Creator Pro untuk kuota Unlimited tamu.
                </span>
                <Link href="/dashboard/subscription" className="underline font-bold ml-1">
                  Upgrade Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tab switchers: Tamu vs Respon RSVP */}
        <div className="flex items-center gap-3 border-b border-[#E8E3DA] pb-2">
          <button
            onClick={() => setActiveTab('guests')}
            className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'guests'
                ? 'border-[#1F2421] text-[#1F2421]'
                : 'border-transparent text-[#7A807C] hover:text-[#1F2421]'
            }`}
          >
            <Users className="w-4 h-4 text-[#C5A880]" />
            <span>Daftar Tamu ({guests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'rsvps'
                ? 'border-[#1F2421] text-[#1F2421]'
                : 'border-transparent text-[#7A807C] hover:text-[#1F2421]'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Respon RSVP Masuk ({rsvps.length})</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: GUESTS TABLE */}
        {/* ==================================================================== */}
        {activeTab === 'guests' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden space-y-4">
            {/* Search & Filter Header */}
            <div className="p-4 sm:p-6 border-b border-[#E8E3DA] flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A807C]" />
                <input
                  type="text"
                  placeholder="Cari nama atau no. telepon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="VIP">VIP</option>
                  <option value="Sahabat">Sahabat</option>
                  <option value="Teman Kantor">Teman Kantor</option>
                  <option value="Keluarga">Keluarga</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs text-[#4E5450]">
                <thead className="bg-[#FAF8F5] text-[#1F2421] uppercase text-[10px] font-bold tracking-wider border-b border-[#E8E3DA]">
                  <tr>
                    <th className="py-3.5 px-6">Nama Tamu</th>
                    <th className="py-3.5 px-6">Kontak</th>
                    <th className="py-3.5 px-6">Kategori & Pax</th>
                    <th className="py-3.5 px-6">Check-in Status</th>
                    <th className="py-3.5 px-6 text-right">Tautan & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DA]">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-[#FCFBF7] transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-[#1F2421] whitespace-nowrap">
                        {guest.name}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-[#7A807C] whitespace-nowrap">
                        {guest.phone || '-'}
                      </td>
                      <td className="py-4 px-6 space-x-2">
                        <Badge variant="gold" className="text-[10px]">
                          {guest.category || 'Tamu'}
                        </Badge>
                        <span className="text-[11px] text-[#7A807C]">
                          Maks {guest.pax_limit} Pax
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {guest.checked_in_at ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hadir ({new Date(guest.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})</span>
                            </div>
                            <button
                              onClick={() => handleGuestUndoCheckIn(guest)}
                              className="text-[10px] text-gray-400 hover:text-red-600 underline"
                            >
                              Batalkan Presensi
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[#8A908C] text-[11px] block">Belum Hadir</span>
                            <button
                              onClick={() => handleGuestCheckIn(guest)}
                              className="text-[10px] text-[#C5A880] hover:underline font-semibold"
                            >
                              + Check-in Manual
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap space-x-2">
                        {/* Copy Personalized Link Button */}
                        <button
                          onClick={() => handleCopyPersonalLink(guest)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E8E3DA] bg-white hover:bg-[#F3EFE6] text-[11px] inline-flex items-center gap-1 text-[#1F2421]"
                          title="Salin tautan personal dengan nama tamu otomatis"
                        >
                          {copiedToken === guest.invitation_token ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#C5A880]" />
                              <span>Link Personal</span>
                            </>
                          )}
                        </button>

                        {/* View QR Code Button */}
                        <button
                          onClick={() => handleOpenQrModal(guest)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E8E3DA] bg-white hover:bg-[#F3EFE6] text-[11px] inline-flex items-center gap-1 text-[#1F2421]"
                          title="Lihat QR Code Tamu"
                        >
                          <QrCode className="w-3 h-3 text-[#C5A880]" />
                          <span>QR Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: RSVP RESPONSES FEED */}
        {/* ==================================================================== */}
        {activeTab === 'rsvps' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden p-6 space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                Daftar Respon RSVP Tamu
              </h2>
              <p className="text-xs text-[#7A807C]">
                Catatan: Respon RSVP tidak mengurangi atau menambah jumlah kuota tamu Anda.
              </p>
            </div>

            <div className="space-y-3">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1F2421]">{rsvp.guest_name}</span>
                      {rsvp.attendance_status === 'attending' && (
                        <Badge variant="success" className="text-[10px]">Hadir ({rsvp.attendee_count} Pax)</Badge>
                      )}
                      {rsvp.attendance_status === 'not_attending' && (
                        <Badge variant="danger" className="text-[10px]">Tidak Hadir</Badge>
                      )}
                      {rsvp.attendance_status === 'uncertain' && (
                        <Badge variant="warning" className="text-[10px]">Ragu-ragu</Badge>
                      )}
                    </div>
                    {rsvp.message && (
                      <p className="text-xs text-[#555C57] italic">
                        "{rsvp.message}"
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8A908C] whitespace-nowrap">
                    {formatDateWITA(rsvp.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD GUEST */}
        {/* ==================================================================== */}
        {addGuestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E3DA] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                  Tambah Tamu Undangan
                </h3>
                <button onClick={() => setAddGuestModalOpen(false)} className="text-gray-400 hover:text-black">
                  ✕
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleAddGuest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1F2421]">Nama Tamu / Pasangan / Keluarga</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bapak Ir. H. Syamsuddin & Keluarga"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E3DA] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1F2421]">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="08123456789"
                      value={newGuestPhone}
                      onChange={(e) => setNewGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E3DA] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1F2421]">Kategori Tamu</label>
                    <input
                      type="text"
                      placeholder="VIP, Sahabat, Keluarga"
                      value={newGuestCategory}
                      onChange={(e) => setNewGuestCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E3DA] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1F2421]">Maksimal Pax / Kursi</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newGuestPax}
                    onChange={(e) => setNewGuestPax(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E3DA] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                  <p className="text-[10px] text-[#7A807C]">
                    Satu kartu undangan untuk satu keluarga tetap dihitung 1 kuota tamu terdaftar.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setAddGuestModalOpen(false)}>
                    Batal
                  </Button>
                  <Button variant="gold" size="sm" type="submit">
                    Simpan Data Tamu
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: CSV IMPORT WITH CAPACITY VALIDATION */}
        {/* ==================================================================== */}
        {csvModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E3DA] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                    Import Tamu dari Data CSV
                  </h3>
                  <p className="text-[11px] text-[#7A807C]">Format: Nama, No Telepon, Kategori, Pax</p>
                </div>
                <button onClick={() => setCsvModalOpen(false)} className="text-gray-400 hover:text-black">
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={`Budi Santoso, 0812345678, VIP, 2\nSiti Rahma, 0819876543, Sahabat, 1\nKeluarga Bpk. H. Dahlan, 0811223344, Keluarga, 4`}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-[#E8E3DA] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />

                <Button variant="outline" size="sm" onClick={handleValidateCsv} className="w-full text-xs">
                  Validasi Kapasitas Kuota Tamu
                </Button>

                {csvValidationResult && (
                  <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    csvValidationResult.allowed 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {csvValidationResult.allowed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Validasi Berhasil: {csvValidationResult.totalRows} data siap diimpor.</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>Batas Kuota Terlampaui</span>
                        </>
                      )}
                    </div>
                    {!csvValidationResult.allowed && (
                      <p className="text-[11px] leading-relaxed">
                        {csvValidationResult.errorMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E3DA]">
                <Button variant="outline" size="sm" onClick={() => setCsvModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  disabled={!csvValidationResult || !csvValidationResult.allowed}
                  onClick={handleCommitCsvImport}
                >
                  Proses Import Tamu
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: QR CODE DISPLAY */}
        {/* ==================================================================== */}
        {qrModalGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E3DA] p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-[#E8E3DA] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
                  QR Check-in Pass
                </span>
                <button onClick={() => setQrModalGuest(null)} className="text-gray-400 hover:text-black">
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                  {qrModalGuest.name}
                </h4>
                <p className="text-xs text-[#7A807C]">Maks. {qrModalGuest.pax_limit} Pax</p>
              </div>

              {/* Real QR Code Canvas */}
              <div className="w-52 h-52 mx-auto p-3 rounded-2xl border border-[#E8E3DA] bg-white flex flex-col items-center justify-center shadow-inner">
                {qrModalDataUrl ? (
                  <img
                    src={qrModalDataUrl}
                    alt="QR Pass"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-36 h-36 text-[#1F2421]" />
                )}
                <span className="font-mono text-[9px] text-[#7A807C] mt-1">
                  {qrModalGuest.qr_code_token}
                </span>
              </div>

              <p className="text-[11px] text-[#7A807C]">
                Tunjukkan QR Code ini kepada panitia resepsi di meja registrasi untuk proses check-in kehadiran.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQrModalGuest(null)} 
                  className="text-xs"
                >
                  Tutup
                </Button>
                <Button 
                  variant="gold" 
                  size="sm" 
                  onClick={() => {
                    if (qrModalDataUrl) {
                      const a = document.createElement('a');
                      a.href = qrModalDataUrl;
                      a.download = `QR-Tamu-${qrModalGuest.name}.png`;
                      a.click();
                    }
                  }} 
                  className="text-xs font-semibold"
                >
                  Unduh QR
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
