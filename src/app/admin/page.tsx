'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Users, 
  LayoutTemplate, 
  CreditCard, 
  Receipt, 
  Settings, 
  FileText, 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore, INITIAL_TEMPLATES } from '@/lib/data-store';
import { INITIAL_PLANS } from '@/lib/billing/plans';
import { formatIDR, formatDateWITA } from '@/lib/utils';
import { Plan } from '@/types';

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'templates' | 'plans' | 'transactions' | 'logs'>('overview');

  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [userList, setUserList] = useState(Object.values(dataStore.users));
  const auditLogs = dataStore.auditLogs;

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

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col">
      {/* Admin Header Bar */}
      <header className="h-16 bg-[#181A18] text-white px-6 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke App</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C5A880]" />
            <span className="font-serif-luxury font-bold text-sm">
              Rynora Control Center (Admin)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-[10px]">Super Administrator</Badge>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-[#E8E3DA] px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Ringkasan Sistem', icon: Sliders },
            { id: 'users', label: `Pengguna (${userList.length})`, icon: Users },
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

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6">
        
        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-[#7A807C]">Total Pengguna</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#1F2421]">{userList.length}</p>
                <p className="text-[11px] text-emerald-600 font-medium">100% Akun Aktif</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-[#7A807C]">Total Workspace</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#1F2421]">2</p>
                <p className="text-[11px] text-[#7A807C]">1 Personal, 1 Vendor</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E8E3DA] space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-[#7A807C]">Template Publik</span>
                <p className="font-serif-luxury text-3xl font-bold text-[#1F2421]">{templates.length}</p>
                <p className="text-[11px] text-[#C5A880] font-medium">3 Premium, 2 Gratis</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1F2421] text-white space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-400">Total Volume Transaksi</span>
                <p className="font-serif-luxury text-2xl font-bold text-[#C5A880]">Rp 2.029.000</p>
                <p className="text-[11px] text-gray-300">Sandbox Verified</p>
              </div>
            </div>

            {/* Quick Audit Trail */}
            <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-serif-luxury text-lg font-bold text-[#1F2421]">Aktivitas Sistem Terbaru</h3>
              <div className="divide-y divide-[#E8E3DA]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1F2421]">{log.action}</span>
                      <p className="text-[#7A807C]">Target: {log.target_type} ({log.target_id})</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatDateWITA(log.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Daftar Pengguna Platform</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#7A807C] border-b border-[#E8E3DA]">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">No. HP</th>
                    <th className="py-3 px-4">Tipe Akun</th>
                    <th className="py-3 px-4">Tanggal Daftar</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DA]">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-semibold text-[#1F2421]">{u.full_name}</td>
                      <td className="py-3 px-4 text-[#636965]">{u.phone || '-'}</td>
                      <td className="py-3 px-4">
                        {u.is_platform_admin ? (
                          <Badge variant="gold" className="text-[9px]">Admin</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px]">User</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#7A807C]">{formatDateWITA(u.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-600 font-semibold text-[11px]">Aktif</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: TEMPLATE MANAGEMENT */}
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
        {/* TAB 4: PLANS & GUEST LIMIT CONFIGURATION */}
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
                        {p.entitlements.is_unlimited_guests ? 'Unlimited Tamu' : `Maks. ${p.entitlements.max_guests_per_invitation} Tamu`}
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
        {/* TAB 5: AUDIT LOGS */}
        {/* ==================================================================== */}
        {activeTab === 'logs' && (
          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Sistem Audit Trail</h2>
            <div className="divide-y divide-[#E8E3DA]">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F2421]">{log.action}</span>
                    <span className="text-[10px] text-gray-400">{formatDateWITA(log.created_at)}</span>
                  </div>
                  <p className="text-[#636965]">Target: {log.target_type} ID: {log.target_id}</p>
                  {log.metadata && (
                    <pre className="text-[10px] bg-[#FAF8F5] p-2 rounded border border-[#E8E3DA] font-mono">
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
