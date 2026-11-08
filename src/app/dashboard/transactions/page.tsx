'use client';

import { Receipt, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { formatIDR, formatDateWITA } from '@/lib/utils';

export default function TransactionsHistoryPage() {
  const transactions = [
    {
      id: 'txn_1001',
      orderId: 'RYNORA-20261025-PPLUS',
      planName: 'Personal Plus (Monthly)',
      amount: 39000,
      status: 'settlement',
      provider: 'Sandbox Gateway',
      date: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'txn_1002',
      orderId: 'RYNORA-20260925-PPLUS',
      planName: 'Personal Plus (Monthly)',
      amount: 39000,
      status: 'settlement',
      provider: 'Sandbox Gateway',
      date: '2026-09-15T10:00:00.000Z',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Riwayat Tagihan</span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
            Transaksi & Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-[#636965]">
            Daftar bukti pembayaran langganan workspace Anda yang telah terverifikasi sistem.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8E3DA] bg-white shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs text-[#4E5450]">
            <thead className="bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#7A807C] border-b border-[#E8E3DA]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">No. Order Transaksi</th>
                <th className="py-3.5 px-6">Item / Paket</th>
                <th className="py-3.5 px-6">Metode</th>
                <th className="py-3.5 px-6">Nominal</th>
                <th className="py-3.5 px-6">Tanggal</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DA]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#FCFBF7]">
                  <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#1F2421] whitespace-nowrap">{t.orderId}</td>
                  <td className="py-4 px-6 font-medium text-[#1F2421]">{t.planName}</td>
                  <td className="py-4 px-6">{t.provider}</td>
                  <td className="py-4 px-6 font-semibold text-[#1F2421]">{formatIDR(t.amount)}</td>
                  <td className="py-4 px-6 text-[#7A807C]">{formatDateWITA(t.date)}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Lunas / Terverifikasi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
