'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Users, 
  LayoutTemplate, 
  CreditCard, 
  Receipt, 
  FileText, 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Sparkles,
  Sliders,
  DollarSign,
  Filter,
  Check,
  Ban,
  Calendar,
  UserCheck,
  RefreshCw,
  Info,
  ExternalLink,
  Edit3,
  Lock,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { dataStore, INITIAL_TEMPLATES } from '@/lib/data-store';
import { INITIAL_PLANS } from '@/lib/billing/plans';
import { formatIDR, formatDateWITA } from '@/lib/utils';
import { Plan, PaymentTransaction, PaymentStatus, SubscriptionStatus } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();

  const isPlatformAdmin = Boolean(
    profile?.is_platform_admin === true || 
    user?.email === 'ahmadshawity@gmail.com' || 
    profile?.email === 'ahmadshawity@gmail.com'
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'templates' | 'plans' | 'logs'>('overview');

  const [plans] = useState<Plan[]>(INITIAL_PLANS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  
  // Data Store dynamic state
  const [userList, setUserList] = useState(() => dataStore.getAllUsers());
  const [paymentList, setPaymentList] = useState(() => dataStore.getAllTransactions());
  const [auditLogs, setAuditLogs] = useState(() => [...dataStore.auditLogs]);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('all');
  const [selectedUserForOverride, setSelectedUserForOverride] = useState<any | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    planId: 'plan_personal_plus_monthly',
    status: 'active' as SubscriptionStatus,
    durationMonths: 1,
    notes: '',
  });

  // Payment Log State
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<'all' | 'settlement' | 'failed' | 'cancel' | 'pending'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [selectedPaymentForDetail, setSelectedPaymentForDetail] = useState<PaymentTransaction | null>(null);

  // Filter Users
  const filteredUsers = userList.filter((u) => {
    const matchesSearch = 
      (u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || false) ||
      (u.email?.toLowerCase().includes(userSearch.toLowerCase()) || false) ||
      (u.phone?.includes(userSearch) || false);
    
    const matchesPlan = 
      userPlanFilter === 'all' || 
      (userPlanFilter === 'free' && (!u.plan || u.plan.id === 'plan_free')) ||
      (userPlanFilter === 'personal-plus' && u.plan?.slug === 'personal-plus') ||
      (userPlanFilter === 'creator-pro' && u.plan?.slug === 'creator-pro') ||
      (userPlanFilter === 'vendor-studio' && u.plan?.slug === 'vendor-studio');

    return matchesSearch && matchesPlan;
  });

  // Filter Payments
  const filteredPayments = paymentList.filter((p) => {
    const matchesSearch = 
      (p.order_id?.toLowerCase().includes(paymentSearch.toLowerCase()) || false) ||
      (p.id?.toLowerCase().includes(paymentSearch.toLowerCase()) || false) ||
      (p.user_name?.toLowerCase().includes(paymentSearch.toLowerCase()) || false) ||
      (p.user_email?.toLowerCase().includes(paymentSearch.toLowerCase()) || false) ||
      (p.payment_method?.toLowerCase().includes(paymentSearch.toLowerCase()) || false);

    let matchesStatus = true;
    if (paymentFilterStatus === 'settlement') {
      matchesStatus = p.status === 'settlement' || p.status === 'capture';
    } else if (paymentFilterStatus === 'failed') {
      matchesStatus = p.status === 'expire' || p.status === 'deny' || p.status === 'failed';
    } else if (paymentFilterStatus === 'cancel') {
      matchesStatus = p.status === 'cancel';
    } else if (paymentFilterStatus === 'pending') {
      matchesStatus = p.status === 'pending';
    }

    return matchesSearch && matchesStatus;
  });

  // Payment Counts for Filter Badges
  const paymentCounts = {
    all: paymentList.length,
    settlement: paymentList.filter(p => p.status === 'settlement' || p.status === 'capture').length,
    failed: paymentList.filter(p => p.status === 'expire' || p.status === 'deny' || p.status === 'failed').length,
    cancel: paymentList.filter(p => p.status === 'cancel').length,
    pending: paymentList.filter(p => p.status === 'pending').length,
  };

  // Total Settled Amount
  const totalSettledAmount = paymentList
    .filter(p => p.status === 'settlement' || p.status === 'capture')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Handlers for Template Management
  const handleToggleTemplateStatus = (templateId: string) => {
    setTemplates(templates.map(t => {
      if (t.id === templateId) {
        return {
          ...t,
          status: t.status === 'published' ? 'draft' : 'published',
        };
      }
      return t;
    }));
  };

  const handleToggleTemplatePremium = (templateId: string) => {
    setTemplates(templates.map(t => {
      if (t.id === templateId) {
        return {
          ...t,
          is_premium: !t.is_premium,
        };
      }
      return t;
    }));
  };

  // Open User Subscription Override Modal
  const handleOpenUserOverride = (user: any) => {
    setSelectedUserForOverride(user);
    setOverrideForm({
      planId: user.plan?.id || 'plan_personal_plus_monthly',
      status: (user.subscription?.status as SubscriptionStatus) || 'active',
      durationMonths: user.subscription?.billing_period === 'annual' ? 12 : 1,
      notes: '',
    });
  };

  // Save User Subscription Override
  const handleSaveSubscriptionOverride = () => {
    if (!selectedUserForOverride) return;

    try {
      const res = dataStore.updateUserSubscription(
        selectedUserForOverride.id,
        overrideForm.planId,
        overrideForm.status,
        overrideForm.durationMonths,
        overrideForm.notes || 'Admin manual subscription override',
        'user_admin_01'
      );

      // Refresh data
      setUserList(dataStore.getAllUsers());
      setAuditLogs([...dataStore.auditLogs]);
      setSelectedUserForOverride(null);

      setNotification({
        type: 'success',
        message: `Langganan pengguna ${res.user.full_name} berhasil diubah ke paket ${res.plan.name} (${overrideForm.status.toUpperCase()})!`,
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal mengubah langganan',
      });
    }
  };

  // Manual Transaction Status Update
  const handleUpdatePaymentStatus = (transactionId: string, newStatus: PaymentStatus, note?: string) => {
    try {
      dataStore.updateTransactionStatus(
        transactionId,
        newStatus,
        note || `Status diubah menjadi ${newStatus} oleh Administrator`,
        'user_admin_01'
      );

      // Refresh data
      setPaymentList(dataStore.getAllTransactions());
      setUserList(dataStore.getAllUsers());
      setAuditLogs([...dataStore.auditLogs]);

      if (selectedPaymentForDetail && selectedPaymentForDetail.id === transactionId) {
        setSelectedPaymentForDetail(dataStore.getAllTransactions().find(t => t.id === transactionId) || null);
      }

      setNotification({
        type: 'success',
        message: `Status transaksi #${transactionId} berhasil diperbarui menjadi ${newStatus.toUpperCase()}!`,
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal memperbarui status transaksi',
      });
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181A18] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#262A26] border border-[#C5A880]/30 flex items-center justify-center mb-4 animate-spin">
          <ShieldAlert className="w-6 h-6 text-[#C5A880]" />
        </div>
        <h2 className="font-serif-luxury text-xl font-bold">Memverifikasi Otorisasi Super Administrator...</h2>
        <p className="text-xs text-stone-400 mt-1">Menghubungkan ke layanan otentikasi Rynora Control Center.</p>
      </div>
    );
  }

  // 2. Unauthenticated State (Not Logged In)
  if (!user && !profile) {
    return (
      <div className="min-h-screen bg-[#121413] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-[#1C1F1D] border border-red-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="text-red-400 border-red-500/40 uppercase tracking-widest text-[10px]">
              Akses Terkunci • Belum Login
            </Badge>
            <h2 className="font-serif-luxury text-2xl font-bold text-[#FCFBF7]">
              Otorisasi Admin Diperlukan
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Halaman ini adalah area terproteksi khusus Super Administrator platform Rynora. Anda belum masuk ke sistem. Silakan login terlebih dahulu dengan akun administrator resmi.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link 
              href="/login?redirectTo=/admin" 
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#C5A880] text-[#181A18] font-bold text-xs hover:bg-[#D4AF37] transition-all shadow-md"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Masuk Sebagai Administrator</span>
            </Link>

            <Link 
              href="/" 
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-stone-400 text-xs hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Rynora</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized State (Logged in as regular user/vendor)
  if (!isPlatformAdmin) {
    const currentEmail = user?.email || profile?.email || 'Akun Pengguna';
    const currentName = profile?.full_name || 'Pengguna Rynora';

    return (
      <div className="min-h-screen bg-[#0F1110] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-600/5 rounded-full filter blur-2xl pointer-events-none" />

        <div className="max-w-xl w-full bg-[#181A18] border border-rose-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Pulsing Alert Icon */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-rose-600/20 animate-ping" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-950 to-rose-900 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-lg">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
          </div>

          {/* Heading & Badge */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-rose-950/80 text-rose-300 border border-rose-700/50">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>403 Forbidden • Penolakan Akses</span>
            </span>

            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#FCFBF7]">
              Akses Ditolak: Control Center
            </h1>

            <p className="text-xs text-stone-400 leading-relaxed max-w-md mx-auto">
              Sistem keamanan Rynora menolak permintaan akses Anda ke halaman <strong>/admin</strong>. Halaman ini diproteksi secara eksklusif untuk Super Administrator platform.
            </p>
          </div>

          {/* User Details & Reason Card */}
          <div className="rounded-2xl border border-rose-900/50 bg-[#121413] p-4 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-stone-400">Akun Anda Saat Ini:</span>
              <span className="font-semibold text-stone-200">{currentName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-stone-400">Alamat Email:</span>
              <span className="font-mono text-rose-300 font-semibold">{currentEmail}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-stone-400">Peran Akun:</span>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300">
                Pengguna Standar (Non-Admin)
              </span>
            </div>

            <div className="pt-1 text-[11px] text-stone-400 leading-normal space-y-1">
              <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Penyebab Penolakan:</span>
              </p>
              <p className="pl-5 text-stone-400">
                Anda tidak memiliki otorisasi untuk mengubah langganan pengguna, mengonfigurasi kuota tamu, atau mengakses pembukuan transaksi pembayaran Midtrans.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={async () => {
                await signOut();
                router.push('/login?redirectTo=/admin');
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#C5A880] text-[#181A18] font-bold text-xs hover:bg-[#D4AF37] transition-all shadow-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Ganti Akun & Masuk Sebagai Super Admin</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-stone-300 text-xs hover:text-white hover:bg-white/5 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Dashboard Saya</span>
              </Link>

              <Link 
                href="/" 
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-stone-300 text-xs hover:text-white hover:bg-white/5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Beranda Utama</span>
              </Link>
            </div>
          </div>

          {/* Admin Notice */}
          <p className="text-[10px] text-stone-400 border-t border-white/5 pt-3">
            Akun Super Administrator resmi yang terotorisasi: <span className="font-mono text-amber-300 font-semibold">ahmadshawity@gmail.com</span>
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col font-sans">
      {/* Admin Header Bar */}
      <header className="h-16 bg-[#181A18] text-white px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke App</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-5 h-5 text-[#C5A880] shrink-0" />
            <span className="font-serif-luxury font-bold text-sm tracking-wide truncate hidden md:inline">
              Rynora Control Center (Admin)
            </span>
            <span className="font-serif-luxury font-bold text-sm tracking-wide truncate md:hidden">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Operasional Normal</span>
          </div>
          <Badge variant="gold" className="text-[10px] tracking-wider uppercase font-semibold hidden sm:inline-flex">Super Administrator</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="text-stone-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 ml-1"
            title="Keluar dari Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      {/* Floating Alert Notification */}
      {notification && (
        <div className={`fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 z-50 sm:max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border-emerald-700' 
            : notification.type === 'error'
            ? 'bg-rose-950 text-rose-100 border-rose-700'
            : 'bg-stone-900 text-stone-100 border-stone-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : notification.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-[#E8E3DA] px-6 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Ringkasan Sistem', icon: Sliders },
            { id: 'users', label: `Semua Pengguna (${userList.length})`, icon: Users },
            { id: 'payments', label: `Log Pembayaran (${paymentList.length})`, icon: Receipt },
            { id: 'templates', label: `Kelola Template (${templates.length})`, icon: LayoutTemplate },
            { id: 'plans', label: 'Paket & Batas Tamu', icon: DollarSign },
            { id: 'logs', label: `Audit Trail (${auditLogs.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-[#7A807C] tracking-wider">Total Pengguna Terdaftar</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#1F2421]">{userList.length}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{userList.filter(u => u.status !== 'suspended').length} Akun Aktif</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-[#7A807C] tracking-wider">Transaksi Berhasil</span>
                <p className="font-serif-luxury text-3xl font-bold text-emerald-700">{paymentCounts.settlement}</p>
                <p className="text-[11px] text-[#7A807C]">Dari total {paymentList.length} transaksi</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-[#7A807C] tracking-wider">Gagal & Batal</span>
                <p className="font-serif-luxury text-3xl font-bold text-rose-700">
                  {paymentCounts.failed + paymentCounts.cancel}
                </p>
                <p className="text-[11px] text-[#7A807C]">
                  {paymentCounts.failed} Gagal • {paymentCounts.cancel} Batal
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1F2421] text-white space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Total Volume Transaksi</span>
                <p className="font-serif-luxury text-2xl font-bold text-[#C5A880]">{formatIDR(totalSettledAmount)}</p>
                <p className="text-[11px] text-gray-300">Midtrans & Sandbox Verified</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">Aktivitas Sistem Terbaru</h3>
                    <p className="text-xs text-[#7A807C]">Riwayat audit trail operasional platform secara real-time.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('logs')} className="text-xs">
                    Lihat Semua
                  </Button>
                </div>
                <div className="divide-y divide-[#E8E3DA]">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between text-xs gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1F2421]">{log.action}</span>
                          <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">{log.target_type}</Badge>
                        </div>
                        {Boolean(log.metadata && (log.metadata as any).notes) && (
                          <p className="text-xs text-stone-600 mt-1 italic bg-[#FAF8F5] p-1.5 rounded border border-[#E8E3DA]">
                            "{String((log.metadata as any).notes)}"
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDateWITA(log.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump Panel */}
              <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">Aksi Cepat Admin</h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left p-3.5 rounded-xl border border-[#E8E3DA] hover:bg-[#FAF8F5] hover:border-[#C5A880] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2421] group-hover:text-[#C5A880]">Ubah Langganan Akun</h4>
                      <p className="text-[11px] text-[#7A807C]">Override paket pengguna secara manual</p>
                    </div>
                    <Users className="w-4 h-4 text-[#7A807C] group-hover:text-[#C5A880]" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('payments'); setPaymentFilterStatus('pending'); }}
                    className="w-full text-left p-3.5 rounded-xl border border-[#E8E3DA] hover:bg-[#FAF8F5] hover:border-[#C5A880] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2421] group-hover:text-[#C5A880]">Cek Transaksi Pending</h4>
                      <p className="text-[11px] text-[#7A807C]">{paymentCounts.pending} transaksi menunggu verifikasi</p>
                    </div>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('payments'); setPaymentFilterStatus('failed'); }}
                    className="w-full text-left p-3.5 rounded-xl border border-[#E8E3DA] hover:bg-[#FAF8F5] hover:border-rose-400 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2421] group-hover:text-rose-600">Investigasi Pembayaran Gagal</h4>
                      <p className="text-[11px] text-[#7A807C]">{paymentCounts.failed} transaksi bermasalah/kadaluwarsa</p>
                    </div>
                    <XCircle className="w-4 h-4 text-rose-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('templates')}
                    className="w-full text-left p-3.5 rounded-xl border border-[#E8E3DA] hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2421]">Katalog Template</h4>
                      <p className="text-[11px] text-[#7A807C]">Atur status draft & premium template</p>
                    </div>
                    <LayoutTemplate className="w-4 h-4 text-[#7A807C]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: USER MANAGEMENT & SUBSCRIPTION OVERRIDE */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E3DA] pb-4">
                <div>
                  <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                    Daftar Semua Akun Terdaftar & Langganan
                  </h2>
                  <p className="text-xs text-[#7A807C] mt-0.5">
                    Kelola status pengguna, pantau workspace terkait, dan ubah paket langganan (manual subscription override) sewaktu-waktu.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gold" className="text-xs px-3 py-1">
                    {userList.length} Total Akun
                  </Badge>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A807C]" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama lengkap, email, atau nomor HP..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={userPlanFilter}
                    onChange={(e) => setUserPlanFilter(e.target.value)}
                    aria-label="Filter berdasarkan paket langganan"
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  >
                    <option value="all">Semua Paket</option>
                    <option value="free">Free Tier</option>
                    <option value="personal-plus">Personal Plus</option>
                    <option value="creator-pro">Creator Pro</option>
                    <option value="vendor-studio">Vendor Studio</option>
                  </select>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setUserSearch(''); setUserPlanFilter('all'); }}
                    className="text-xs shrink-0"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E8E3DA]">
                <table className="w-full min-w-[960px] text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#7A807C] border-b border-[#E8E3DA]">
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap">Pengguna</th>
                      <th className="py-3 px-4">Kontak & Email</th>
                      <th className="py-3 px-4">Tipe Akun</th>
                      <th className="py-3 px-4">Workspace</th>
                      <th className="py-3 px-4">Paket Langganan</th>
                      <th className="py-3 px-4">Batas Kuota Tamu</th>
                      <th className="py-3 px-4">Status & Masa Aktif</th>
                      <th className="py-3 px-4 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3DA]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          Tidak ada pengguna yang cocok dengan kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSubActive = u.subscription?.status === 'active';
                        const planSlug = u.plan?.slug || 'free';
                        const isUnlimited = u.plan?.entitlements?.is_unlimited_guests;
                        const guestLimit = u.plan?.entitlements?.max_guests_per_invitation;

                        return (
                          <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            {/* User details */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {u.avatar_url ? (
                                  <img 
                                    src={u.avatar_url} 
                                    alt={u.full_name} 
                                    className="w-8 h-8 rounded-full object-cover border border-[#E8E3DA]" 
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#1F2421] text-white flex items-center justify-center font-bold text-xs">
                                    {u.full_name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-[#1F2421]">{u.full_name}</p>
                                  <p className="text-[10px] text-gray-400">ID: {u.id}</p>
                                </div>
                              </div>
                            </td>

                            {/* Contact & Email */}
                            <td className="py-3 px-4">
                              <p className="text-[#1F2421] font-medium">{u.email || '-'}</p>
                              <p className="text-[#7A807C] text-[11px]">{u.phone || '-'}</p>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-4">
                              {u.is_platform_admin ? (
                                <Badge variant="gold" className="text-[9px]">Admin Platform</Badge>
                              ) : u.workspace?.type === 'vendor' ? (
                                <Badge variant="default" className="text-[9px]">Vendor Studio</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[9px]">Personal User</Badge>
                              )}
                            </td>

                            {/* Workspace */}
                            <td className="py-3 px-4">
                              <p className="font-medium text-[#1F2421]">{u.workspace?.name || 'Workspace Pribadi'}</p>
                              <p className="text-[10px] text-gray-400">slug: {u.workspace?.slug || '-'}</p>
                            </td>

                            {/* Current Subscription Plan */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {planSlug === 'vendor-studio' ? (
                                  <Badge variant="gold" className="text-[9px] font-bold">Vendor Studio</Badge>
                                ) : planSlug === 'creator-pro' ? (
                                  <Badge variant="gold" className="text-[9px] font-bold">Creator Pro</Badge>
                                ) : planSlug === 'personal-plus' ? (
                                  <Badge variant="default" className="text-[9px] font-bold">Personal Plus</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[9px]">Free Plan</Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-[#7A807C] mt-0.5 capitalize">
                                Periode: {u.subscription?.billing_period || 'monthly'}
                              </p>
                            </td>

                            {/* Guest Limit Entitlement */}
                            <td className="py-3 px-4">
                              <span className={`font-semibold ${isUnlimited ? 'text-amber-700' : 'text-stone-700'}`}>
                                {isUnlimited ? '✨ Unlimited Tamu' : `Maks. ${guestLimit} Tamu`}
                              </span>
                            </td>

                            {/* Status & Period */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  isSubActive ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                                <span className={`font-semibold capitalize text-[11px] ${
                                  isSubActive ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                  {u.subscription?.status || 'active'}
                                </span>
                              </div>
                              {u.subscription?.current_period_end && (
                                <p className="text-[10px] text-[#7A807C] mt-0.5">
                                  s/d {u.subscription.current_period_end.startsWith('2099') ? 'Lifetime' : formatDateWITA(u.subscription.current_period_end)}
                                </p>
                              )}
                            </td>

                            {/* Action: Manual Override */}
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenUserOverride(u)}
                                className="text-xs border-[#C5A880] text-[#8C6D3F] hover:bg-[#C5A880]/10 flex items-center gap-1.5 ml-auto"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Ubah Paket</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Dialog: Manual Subscription Override */}
            {selectedUserForOverride && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-[#E8E3DA] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between border-b border-[#E8E3DA] pb-3">
                    <div>
                      <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                        Ubah Langganan Manual (Admin Override)
                      </h3>
                      <p className="text-xs text-[#7A807C]">
                        Perubahan paket akan langsung aktif dan berlaku bagi seluruh undangan di workspace pengguna.
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedUserForOverride(null)}
                      className="text-gray-400 hover:text-black font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Target User Info */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1F2421] text-white flex items-center justify-center font-bold text-sm">
                      {selectedUserForOverride.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2421]">{selectedUserForOverride.full_name}</h4>
                      <p className="text-xs text-[#7A807C]">{selectedUserForOverride.email || '-'}</p>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Workspace: {selectedUserForOverride.workspace?.name || 'Workspace Pribadi'}
                      </p>
                    </div>
                  </div>

                  {/* Form Override */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#1F2421] mb-1">
                        Pilih Paket Langganan Baru:
                      </label>
                      <select
                        value={overrideForm.planId}
                        onChange={(e) => setOverrideForm({ ...overrideForm, planId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] focus:ring-2 focus:ring-[#C5A880]"
                      >
                        <option value="plan_free">Free Tier (Maks. 100 Tamu - 1 Undangan Aktif)</option>
                        <option value="plan_personal_plus_monthly">Personal Plus - Bulanan (Maks. 1.000 Tamu)</option>
                        <option value="plan_personal_plus_annual">Personal Plus - Tahunan (Maks. 1.000 Tamu)</option>
                        <option value="plan_creator_pro_monthly">Creator Pro - Bulanan (Unlimited Tamu)</option>
                        <option value="plan_creator_pro_annual">Creator Pro - Tahunan (Unlimited Tamu)</option>
                        <option value="plan_vendor_studio_monthly">Vendor Studio - Bulanan (Unlimited Tamu & Multi-client)</option>
                        <option value="plan_vendor_studio_annual">Vendor Studio - Tahunan (Unlimited Tamu & Multi-client)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#1F2421] mb-1">
                          Status Langganan:
                        </label>
                        <select
                          value={overrideForm.status}
                          onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value as SubscriptionStatus })}
                          className="w-full px-3.5 py-2 bg-white border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] focus:ring-2 focus:ring-[#C5A880]"
                        >
                          <option value="active">Active (Aktif Penuh)</option>
                          <option value="past_due">Past Due (Menunggu Pembayaran)</option>
                          <option value="canceled">Canceled (Dibatalkan)</option>
                          <option value="incomplete">Incomplete (Belum Selesai)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#1F2421] mb-1">
                          Masa Berlaku / Durasi:
                        </label>
                        <select
                          value={overrideForm.durationMonths}
                          onChange={(e) => setOverrideForm({ ...overrideForm, durationMonths: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 bg-white border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] focus:ring-2 focus:ring-[#C5A880]"
                        >
                          <option value={1}>1 Bulan</option>
                          <option value={3}>3 Bulan</option>
                          <option value={6}>6 Bulan</option>
                          <option value={12}>1 Tahun (12 Bulan)</option>
                          <option value={999}>Permanen / Lifetime (2099)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#1F2421] mb-1">
                        Alasan / Catatan Override (Tercatat di Audit Trail):
                      </label>
                      <textarea
                        value={overrideForm.notes}
                        onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
                        placeholder="Contoh: Bukti transfer Bank Mandiri manual telah diverifikasi via WhatsApp..."
                        rows={2}
                        className="w-full p-2.5 bg-white border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>
                  </div>

                  {/* Modal CTA Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E3DA]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserForOverride(null)}
                      className="text-xs"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handleSaveSubscriptionOverride}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Langganan</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: PAYMENT TRANSACTIONS LOG (BERHASIL, GAGAL, BATAL, PENDING) */}
        {/* ==================================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A807C] tracking-wider">Total Transaksi</span>
                <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">{paymentCounts.all}</p>
                <p className="text-[11px] text-[#7A807C]">Semua catatan pembayaran</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Pembayaran Berhasil</span>
                <p className="font-serif-luxury text-2xl font-bold text-emerald-700">{paymentCounts.settlement}</p>
                <p className="text-[11px] text-emerald-600 font-medium">{formatIDR(totalSettledAmount)}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-200 bg-rose-50/30 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider">Transaksi Gagal</span>
                <p className="font-serif-luxury text-2xl font-bold text-rose-700">{paymentCounts.failed}</p>
                <p className="text-[11px] text-rose-600">Kadaluwarsa / Ditolak Bank</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Transaksi Dibatalkan</span>
                <p className="font-serif-luxury text-2xl font-bold text-amber-700">{paymentCounts.cancel}</p>
                <p className="text-[11px] text-amber-600">Batal checkout oleh pembeli</p>
              </div>
            </div>

            {/* Main Transactions Log Table Card */}
            <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E3DA] pb-4">
                <div>
                  <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                    Log Transaksi & Pembayaran Gateway
                  </h2>
                  <p className="text-xs text-[#7A807C] mt-0.5">
                    Monitoring riwayat pembayaran Midtrans & Sandbox: status Berhasil, Gagal, Batal, serta Menunggu Pembayaran.
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'Semua Transaksi', count: paymentCounts.all, color: 'border-stone-300 text-stone-800' },
                    { id: 'settlement', label: 'Berhasil (Settled)', count: paymentCounts.settlement, color: 'border-emerald-500 text-emerald-700 bg-emerald-50/50' },
                    { id: 'failed', label: 'Gagal (Failed/Expired)', count: paymentCounts.failed, color: 'border-rose-500 text-rose-700 bg-rose-50/50' },
                    { id: 'cancel', label: 'Batal (Canceled)', count: paymentCounts.cancel, color: 'border-amber-500 text-amber-700 bg-amber-50/50' },
                    { id: 'pending', label: 'Menunggu (Pending)', count: paymentCounts.pending, color: 'border-yellow-500 text-yellow-700 bg-yellow-50/50' },
                  ].map((filter) => {
                    const isSelected = paymentFilterStatus === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setPaymentFilterStatus(filter.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F2421] text-white border-[#1F2421] shadow-xs'
                            : 'bg-white hover:bg-stone-50 ' + filter.color
                        }`}
                      >
                        <span>{filter.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A807C]" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Cari transaksi berdasarkan Order ID, nama pembeli, email, atau metode bayar..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl text-xs text-[#1F2421] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E8E3DA]">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#7A807C] border-b border-[#E8E3DA]">
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap">Order ID & Waktu</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Paket Rynora</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Metode Bayar</th>
                      <th className="py-3 px-4">Status Pembayaran</th>
                      <th className="py-3 px-4 text-right">Rincian & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3DA]">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          Tidak ada log transaksi yang memenuhi kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => {
                        const isSuccess = p.status === 'settlement' || p.status === 'capture';
                        const isFailed = p.status === 'expire' || p.status === 'deny' || p.status === 'failed';
                        const isCanceled = p.status === 'cancel';
                        const isPending = p.status === 'pending';

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            {/* Order ID & Time */}
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-[#1F2421]">
                                {p.order_id || p.id}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDateWITA(p.created_at)}</span>
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-[#1F2421]">{p.user_name || 'Pelanggan Rynora'}</p>
                              <p className="text-[11px] text-[#7A807C]">{p.user_email || '-'}</p>
                            </td>

                            {/* Plan */}
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-[#1F2421]">{p.plan_name || 'Langganan Rynora'}</span>
                              <p className="text-[10px] text-gray-400">Gateway: {p.provider.toUpperCase()}</p>
                            </td>

                            {/* Nominal */}
                            <td className="py-3.5 px-4 font-serif-luxury font-bold text-sm text-[#1F2421]">
                              {formatIDR(p.amount)}
                            </td>

                            {/* Payment Method */}
                            <td className="py-3.5 px-4">
                              <span className="text-xs text-stone-800 font-medium">
                                {p.payment_method || 'Midtrans Snap'}
                              </span>
                            </td>

                            {/* Status with Color Badge & Icon */}
                            <td className="py-3.5 px-4">
                              {isSuccess && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Berhasil</span>
                                </span>
                              )}
                              {isFailed && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Gagal</span>
                                </span>
                              )}
                              {isCanceled && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                  <Ban className="w-3 h-3 text-amber-600" />
                                  <span>Batal</span>
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                  <Clock className="w-3 h-3 text-yellow-600" />
                                  <span>Menunggu</span>
                                </span>
                              )}
                              {p.failure_reason && (
                                <p className="text-[10px] text-rose-600 mt-1 max-w-[160px] truncate" title={p.failure_reason}>
                                  {p.failure_reason}
                                </p>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPaymentForDetail(p)}
                                  className="text-xs"
                                >
                                  Detail
                                </Button>
                                {(isPending || isFailed) && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleUpdatePaymentStatus(p.id, 'settlement', 'Diverifikasi manual oleh Admin')}
                                    className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                                    title="Tandai transaksi Berhasil dan aktifkan langganan"
                                  >
                                    Verifikasi
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Detail Transaksi */}
            {selectedPaymentForDetail && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-[#E8E3DA] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between border-b border-[#E8E3DA] pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A807C]">Bukti Transaksi Digital</span>
                      <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                        {selectedPaymentForDetail.order_id || selectedPaymentForDetail.id}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setSelectedPaymentForDetail(null)}
                      className="text-gray-400 hover:text-black font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Receipt Card */}
                  <div className="rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-[#E8E3DA] pb-2">
                      <span className="text-[#7A807C]">Status Transaksi</span>
                      <span className={`font-bold uppercase px-2 py-0.5 rounded text-[11px] ${
                        selectedPaymentForDetail.status === 'settlement' || selectedPaymentForDetail.status === 'capture'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedPaymentForDetail.status === 'cancel'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedPaymentForDetail.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedPaymentForDetail.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#7A807C]">Nama Pelanggan</span>
                      <span className="font-semibold text-[#1F2421]">{selectedPaymentForDetail.user_name || '-'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#7A807C]">Email Pelanggan</span>
                      <span className="font-semibold text-[#1F2421]">{selectedPaymentForDetail.user_email || '-'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#7A807C]">Paket Dibeli</span>
                      <span className="font-semibold text-[#1F2421]">{selectedPaymentForDetail.plan_name || '-'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#7A807C]">Metode Pembayaran</span>
                      <span className="font-semibold text-[#1F2421]">{selectedPaymentForDetail.payment_method || 'Midtrans'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#7A807C]">Provider Gateway</span>
                      <span className="font-semibold text-[#1F2421] uppercase">{selectedPaymentForDetail.provider}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#7A807C]">Waktu Dibuat</span>
                      <span className="font-semibold text-[#1F2421]">{formatDateWITA(selectedPaymentForDetail.created_at)}</span>
                    </div>

                    {selectedPaymentForDetail.paid_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#7A807C]">Waktu Lunas (Paid)</span>
                        <span className="font-semibold text-emerald-700">{formatDateWITA(selectedPaymentForDetail.paid_at)}</span>
                      </div>
                    )}

                    {selectedPaymentForDetail.failure_reason && (
                      <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Penyebab Gagal / Batal:</span>
                        </p>
                        <p>{selectedPaymentForDetail.failure_reason}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-[#E8E3DA] text-sm">
                      <span className="font-bold text-[#1F2421]">Total Pembayaran</span>
                      <span className="font-serif-luxury font-bold text-lg text-[#C5A880]">
                        {formatIDR(selectedPaymentForDetail.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Manual State Modification */}
                  <div className="space-y-2 pt-2 border-t border-[#E8E3DA]">
                    <span className="text-[11px] font-bold uppercase text-[#7A807C]">Aksi Status Administrator:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => handleUpdatePaymentStatus(selectedPaymentForDetail.id, 'settlement', 'Admin konfirmasi transfer berhasil')}
                        className="text-xs"
                      >
                        Set Berhasil (Settlement)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdatePaymentStatus(selectedPaymentForDetail.id, 'expire', 'Admin tandai kadaluwarsa')}
                        className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                      >
                        Set Gagal (Expired)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdatePaymentStatus(selectedPaymentForDetail.id, 'cancel', 'Admin batalkan pesanan')}
                        className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Set Batal (Canceled)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: TEMPLATE MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'templates' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E8E3DA] pb-3">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Manajemen Koleksi Template</h2>
                <p className="text-xs text-[#7A807C]">Publikasikan, sembunyikan, atau atur status free/premium template.</p>
              </div>
            </div>

            <div className="divide-y divide-[#E8E3DA]">
              {templates.map((tpl) => (
                <div key={tpl.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={tpl.preview_image_url} alt={tpl.name} className="w-16 h-12 object-cover rounded-lg border border-[#E8E3DA]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2421]">{tpl.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="default" className="text-[9px] uppercase">{tpl.category}</Badge>
                        {tpl.is_premium ? (
                          <Badge variant="gold" className="text-[9px]">Premium</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px]">Gratis</Badge>
                        )}
                        <span className="text-[10px] text-gray-400">Status: {tpl.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleTemplatePremium(tpl.id)}
                      className="text-xs"
                    >
                      {tpl.is_premium ? 'Ubah ke Gratis' : 'Ubah ke Premium'}
                    </Button>
                    <Button
                      variant={tpl.status === 'published' ? 'secondary' : 'gold'}
                      size="sm"
                      onClick={() => handleToggleTemplateStatus(tpl.id)}
                      className="text-xs"
                    >
                      {tpl.status === 'published' ? 'Sembunyikan' : 'Publikasikan'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: PLANS & GUEST LIMIT CONFIGURATION */}
        {/* ==================================================================== */}
        {activeTab === 'plans' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                Konfigurasi Paket & Batas Kuota Tamu
              </h2>
              <p className="text-xs text-[#7A807C]">
                Semua batasan kuota tamu di bawah ini diatur secara sentral dan diterapkan pada seluruh alur pendaftaran tamu.
              </p>
            </div>

            <div className="divide-y divide-[#E8E3DA]">
              {plans.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1F2421]">{p.name} ({p.billing_period})</h4>
                      <Badge variant="gold" className="text-[10px]">
                        {p.entitlements.is_unlimited_guests ? '✨ Unlimited Tamu' : `Maks. ${p.entitlements.max_guests_per_invitation} Tamu`}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#636965]">
                      Harga: {formatIDR(p.price_amount)} • Undangan Aktif: {p.entitlements.max_active_invitations || 'Unlimited'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 font-semibold">Terkonfigurasi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: AUDIT TRAIL */}
        {/* ==================================================================== */}
        {activeTab === 'logs' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E8E3DA] pb-3">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Sistem Audit Trail Platform</h2>
                <p className="text-xs text-[#7A807C]">Rekaman setiap aksi manual, override langganan, dan perubahan status transaksi.</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {auditLogs.length} Entri Log
              </Badge>
            </div>

            <div className="divide-y divide-[#E8E3DA]">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1F2421]">{log.action}</span>
                      <Badge variant={log.action.includes('OVERRIDE') ? 'gold' : 'secondary'} className="text-[9px]">
                        {log.target_type}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatDateWITA(log.created_at)}</span>
                  </div>
                  <p className="text-[#636965]">Target ID: <span className="font-mono text-[11px]">{log.target_id}</span></p>
                  {log.metadata && (
                    <pre className="text-[10px] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E8E3DA] font-mono overflow-x-auto text-stone-700">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
