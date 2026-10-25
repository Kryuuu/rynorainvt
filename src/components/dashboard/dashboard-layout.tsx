'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_WORKSPACES, MOCK_SUBSCRIPTIONS } from '@/lib/data-store';
import { Workspace } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, currentWorkspace, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(currentWorkspace || MOCK_WORKSPACES.ws_personal);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Pengguna Rynora';
  const displayEmail = user?.email || 'user@rynora.id';
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

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex">
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
        <header className="lg:hidden h-16 bg-[#FCFBF7] border-b border-[#E8E3DA] px-4 flex items-center justify-between z-30">
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
            <div className="pt-2 border-t border-[#E8E3DA] flex gap-2">
              <Link href="/vendor" className="text-xs text-[#C5A880] underline font-medium">Vendor Portal</Link>
              <span className="text-gray-300">|</span>
              <Link href="/admin" className="text-xs text-[#C5A880] underline font-medium">Admin Portal</Link>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
