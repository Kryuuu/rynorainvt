'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  CreditCard, 
  Receipt, 
  Settings, 
  Sparkles, 
  LogOut, 
  ExternalLink, 
  ChevronDown, 
  Building2, 
  ShieldAlert, 
  Menu, 
  X, 
  Lock,
  AlertTriangle,
  ArrowLeft,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_WORKSPACES, MOCK_SUBSCRIPTIONS } from '@/lib/data-store';
import { Workspace } from '@/types';
import { useAuth } from '@/lib/auth-context';

function UnauthorizedAdminWatcher({ onDetected }: { onDetected: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.get('error') === 'unauthorized_admin') {
      onDetected();
    }
  }, [searchParams, onDetected]);
  return null;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, currentWorkspace, isLoading, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(currentWorkspace || MOCK_WORKSPACES.ws_personal);

  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [showUnauthorizedBanner, setShowUnauthorizedBanner] = useState(false);

  const handleUnauthorizedDetected = useCallback(() => {
    setShowUnauthorizedModal(true);
    setShowUnauthorizedBanner(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'unauthorized_admin') {
        setShowUnauthorizedModal(true);
        setShowUnauthorizedBanner(true);
      }
    }
  }, []);

  const handleDismissUnauthorized = () => {
    setShowUnauthorizedModal(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleCloseBanner = () => {
    setShowUnauthorizedBanner(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleSwitchToAdmin = async () => {
    await signOut();
    router.push('/login?redirectTo=/admin');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Pengguna Rynora';
  const displayEmail = user?.email || profile?.email || 'user@rynora.id';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const sub = Object.values(MOCK_SUBSCRIPTIONS).find(s => s.workspace_id === activeWorkspace.id);
  const planName = sub?.plan?.name || 'Personal Plus';

  const navLinks = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/dashboard/invitations', label: 'Undangan Saya', icon: Mail },
    { href: '/dashboard/guests', label: 'Daftar Tamu & RSVP', icon: Users },
    { href: '/dashboard/subscription', label: 'Paket & Langganan', icon: CreditCard },
    { href: '/dashboard/transactions', label: 'Riwayat Transaksi', icon: Receipt },
    { href: '/dashboard/settings', label: 'Pengaturan Akun', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-2xl bg-[#1F2421] text-[#C5A880] flex items-center justify-center mb-3 animate-spin">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-[#1F2421]">Memuat sesi pengguna...</p>
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
              Login Diperlukan
            </h2>
            <p className="text-xs text-[#7A807C]">
              Silakan masuk ke akun Rynora Anda untuk mengakses dashboard dan mengelola undangan digital.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#1F2421] text-white text-xs font-semibold hover:bg-[#2D312E] transition-colors"
            >
              Masuk Sekarang
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

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex">
      <Suspense fallback={null}>
        <UnauthorizedAdminWatcher onDetected={handleUnauthorizedDetected} />
      </Suspense>

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#E8E3DA] bg-[#FCFBF7] p-5">
        <div className="space-y-6">
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F2421] flex items-center justify-center text-[#FCFBF7]">
              <span className="font-serif-luxury text-lg font-bold italic text-[#C5A880]">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                Rynora<span className="text-[#C5A880]">.</span>Invite
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#7A807C] font-semibold -mt-0.5">
                Workspace
              </span>
            </div>
          </Link>

          {/* Workspace Switcher Pill */}
          <div className="p-3 rounded-xl border border-[#E8E3DA] bg-white shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A807C]">Workspace Aktif</span>
              <Badge variant="gold" className="text-[9px] px-1.5 py-0">{planName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                <span className="text-xs font-semibold text-[#1F2421] truncate">{activeWorkspace.name}</span>
              </div>
            </div>

            {/* Quick Portal Switch Links */}
            <div className="pt-2 border-t border-[#E8E3DA] flex items-center justify-between text-[11px] text-[#7A807C]">
              <Link href="/vendor" className="hover:text-[#1F2421] transition-colors flex items-center gap-1">
                <span>Vendor Portal</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#C5A880]" />
              </Link>
              <Link href="/admin" className="hover:text-[#1F2421] transition-colors flex items-center gap-1">
                <span>Admin</span>
                <ShieldAlert className="w-2.5 h-2.5 text-[#C5A880]" />
              </Link>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1F2421] text-[#FCFBF7] font-semibold shadow-sm'
                      : 'text-[#555C57] hover:bg-[#F3EFE6] hover:text-[#1F2421]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : 'text-[#7A807C]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Create Button */}
        <div className="space-y-4 pt-4 border-t border-[#E8E3DA]">
          <Link href="/editor/new">
            <Button variant="gold" className="w-full text-xs shadow-sm justify-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Buat Undangan Baru
            </Button>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#E8DFD8] flex items-center justify-center text-xs font-bold text-[#1F2421] flex-shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1F2421] leading-tight truncate">{displayName}</span>
                <span className="text-[10px] text-[#7A807C] truncate">{displayEmail}</span>
              </div>
            </div>
            <button onClick={handleLogout} title="Keluar dari Akun" className="p-1 hover:bg-red-50 rounded-lg">
              <LogOut className="w-4 h-4 text-[#7A807C] hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden sticky top-0 h-16 bg-[#FCFBF7] border-b border-[#E8E3DA] px-4 flex items-center justify-between z-30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F2421] flex items-center justify-center text-[#FCFBF7]">
              <span className="font-serif-luxury font-bold text-[#C5A880]">R</span>
            </div>
            <span className="font-serif-luxury font-bold text-[#1F2421]">Rynora Invite</span>
          </Link>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg text-[#1F2421] hover:bg-[#F3EFE6]"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-[#FCFBF7] border-b border-[#E8E3DA] p-4 space-y-3">
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                      isActive ? 'bg-[#1F2421] text-white' : 'text-[#4E5450]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#C5A880]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Link href="/editor/new" onClick={() => setMobileNavOpen(false)}>
              <Button variant="gold" className="w-full text-xs shadow-sm justify-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Buat Undangan Baru
              </Button>
            </Link>
            <div className="pt-2 border-t border-[#E8E3DA] flex gap-2">
              <Link href="/vendor" className="text-xs text-[#C5A880] underline font-medium">Vendor Portal</Link>
              <span className="text-gray-300">|</span>
              <Link href="/admin" className="text-xs text-[#C5A880] underline font-medium">Admin Portal</Link>
            </div>
          </div>
        )}

        {/* Modal Penolakan Akses (403 Forbidden Dialog) */}
        {showUnauthorizedModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="max-w-lg w-full bg-[#181A18] text-white border border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 space-y-6">
              {/* Decorative radial glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/15 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full filter blur-2xl pointer-events-none -ml-10 -mb-10" />

              {/* Close button at top right */}
              <button
                onClick={handleDismissUnauthorized}
                className="absolute top-5 right-5 text-stone-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors z-20 cursor-pointer"
                title="Tutup dialog penolakan akses"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Pulsing Shield Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center pt-2">
                <div className="absolute inset-0 rounded-full bg-rose-600/25 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-950 to-rose-900 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-xl relative z-10">
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                </div>
              </div>

              {/* Header Info */}
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-sm">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>403 Forbidden • Penolakan Akses</span>
                </span>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#FCFBF7]">
                  Akses Administrator Ditolak
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                  Sistem keamanan Rynora menolak permintaan akses ke halaman <span className="font-mono text-rose-300 font-semibold">/admin</span> (Rynora Control Center) karena akun Anda tidak memiliki hak wewenang Super Administrator.
                </p>
              </div>

              {/* Account Details Box */}
              <div className="rounded-2xl border border-rose-900/50 bg-[#121413] p-4 text-left space-y-2.5 text-xs relative z-10">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-stone-400">Akun Anda Saat Ini:</span>
                  <span className="font-semibold text-stone-200">{displayName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-stone-400">Email Terdaftar:</span>
                  <span className="font-mono text-rose-300 font-semibold">{displayEmail}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-stone-400">Peran Akun:</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300">
                    Pengguna Standar (Non-Admin)
                  </span>
                </div>
                <div className="pt-1 text-[11px] text-stone-400 leading-relaxed space-y-1">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Alasan Penolakan:</span>
                  </div>
                  <p className="pl-5 text-stone-400">
                    Halaman Control Center mencakup manipulasi kuota database, override paket langganan secara manual, serta audit transaksi finansial Midtrans yang diproteksi khusus.
                  </p>
                </div>
              </div>

              {/* Official Admin Account Notice */}
              <div className="bg-[#1F2421]/80 border border-[#C5A880]/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-stone-300 relative z-10">
                <Info className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span>Akun Super Administrator resmi yang terotorisasi: </span>
                  <span className="font-mono font-bold text-[#C5A880] block sm:inline">ahmadshawity@gmail.com</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1 relative z-10">
                <button
                  onClick={handleSwitchToAdmin}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#C5A880] text-[#181A18] font-bold text-xs hover:bg-[#D4AF37] transition-all shadow-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Ganti Akun & Masuk Sebagai Super Admin</span>
                </button>

                <button
                  onClick={handleDismissUnauthorized}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-stone-300 text-xs hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Kembali ke Dashboard Personal Saya</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Unauthorized Admin Access Warning Banner */}
          {showUnauthorizedBanner && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#1A1214] text-white border border-rose-500/60 shadow-xl flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center shrink-0 text-rose-400 mt-0.5 shadow-md">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/60">
                      403 Forbidden • Penolakan Akses
                    </span>
                    <span className="text-[11px] text-stone-400">Rynora Control Center</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Akses ke Halaman /admin Ditolak
                  </h4>
                  <p className="text-xs text-rose-200 leading-relaxed max-w-2xl">
                    Akun Anda saat ini (<span className="font-semibold text-white">{displayEmail}</span>) tidak memiliki hak wewenang Super Administrator. Untuk mengelola database pengguna, mengubah paket langganan secara manual, atau melihat log transaksi finansial, silakan masuk dengan akun Super Admin (<span className="font-mono text-amber-300 font-semibold">ahmadshawity@gmail.com</span>).
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handleSwitchToAdmin}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#C5A880] text-[#181A18] hover:bg-[#D4AF37] transition-colors shadow-sm cursor-pointer"
                    >
                      Masuk Sebagai Super Admin
                    </button>
                    <button
                      onClick={handleCloseBanner}
                      className="text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Tutup Peringatan
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseBanner}
                className="text-stone-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
