'use client';

import { useState } from 'react';
import { Settings, Save, CheckCircle, User, Phone, Globe, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';

export default function AccountSettingsPage() {
  const [fullName, setFullName] = useState('Andi Pratama');
  const [phone, setPhone] = useState('081234567890');
  const [timezone, setTimezone] = useState('Asia/Makassar');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Preferensi Akun</span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
            Pengaturan Profil & Zona Waktu
          </h1>
          <p className="text-xs sm:text-sm text-[#636965]">
            Sesuaikan data profil pengguna dan zona waktu default untuk agenda acara Anda.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan profil berhasil diperbarui!</span>
          </div>
        )}

        <div className="luxury-card rounded-2xl p-6 sm:p-8 bg-white border border-[#E8E3DA]">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1F2421] uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] text-sm bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1F2421] uppercase tracking-wider">No. Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] text-sm bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1F2421] uppercase tracking-wider">Zona Waktu Standar</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] text-sm bg-white"
              >
                <option value="Asia/Makassar">Asia/Makassar (WITA) — Standar Rynora Invite</option>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
              <p className="text-[11px] text-[#7A807C]">
                Semua jam dan tanggal di undangan Anda akan diselaraskan dengan zona waktu ini.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E3DA] flex justify-end">
              <Button variant="gold" size="sm" type="submit">
                <Save className="w-3.5 h-3.5 mr-1" />
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
