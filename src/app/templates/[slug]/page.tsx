'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Smartphone, Monitor, Sparkles, ArrowLeft, Check, Music, Heart, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_TEMPLATES } from '@/lib/data-store';

function TemplateDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const template = INITIAL_TEMPLATES.find(t => t.slug === slug);

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF7] p-4 text-center space-y-4">
        <h1 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">Template Tidak Ditemukan</h1>
        <p className="text-sm text-[#7A807C]">Template dengan slug {slug} tidak terdaftar atau belum diterbitkan.</p>
        <Link href="/templates">
          <Button variant="outline">Kembali ke Katalog</Button>
        </Link>
      </div>
    );
  }

  const theme = template.default_configuration.theme;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EFE6]">
      {/* Top Controller Bar */}
      <header className="h-16 bg-[#1F2421] text-[#FCFBF7] px-4 sm:px-6 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/templates" className="flex items-center gap-2 text-xs text-[#C5A880] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Katalog</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate max-w-[120px] sm:max-w-none">{template.name}</span>
            {template.is_premium ? (
              <Badge variant="gold" className="text-[10px] hidden sm:inline-flex">Premium</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">Gratis</Badge>
            )}
          </div>
        </div>

        {/* Device Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-[#2C312E] p-1 rounded-lg">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
              deviceMode === 'mobile' ? 'bg-[#1F2421] text-[#C5A880] font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
              deviceMode === 'desktop' ? 'bg-[#1F2421] text-[#C5A880] font-semibold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* CTA */}
        <div>
          <Link href={`/dashboard?create=true&template=${template.id}`}>
            <Button variant="gold" size="sm">
              <Sparkles className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Gunakan Template Ini</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div
          className={`transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-[#E8E3DA] ${
            deviceMode === 'mobile'
              ? 'w-full max-w-[375px] h-[780px] bg-white'
              : 'w-full max-w-5xl h-[800px] bg-white'
          }`}
        >
          {/* Mock Template Live Render Screen */}
          <div 
            className="h-full overflow-y-auto"
            style={{ backgroundColor: theme.background_color, color: theme.text_primary }}
          >
            {/* Hero Cover */}
            <div className="relative min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-b border-black/10">
              <div className="absolute inset-0 z-0">
                <img
                  src={template.preview_image_url}
                  alt={template.name}
                  className="w-full h-full object-cover opacity-25 filter blur-[1px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent" />
              </div>

              <div className="relative z-10 space-y-4 max-w-md">
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.secondary_color }}>
                  The Wedding Celebration of
                </p>
                <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-tight">
                  Romeo & Juliet
                </h1>
                <p className="text-sm font-medium opacity-80">
                  Sabtu, 28 November 2026
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold border border-black/15 bg-white/70 backdrop-blur-sm">
                    Kepada Yth: Tamu Undangan
                  </span>
                </div>
              </div>
            </div>

            {/* Couple / Host Section */}
            <div className="p-8 sm:p-12 text-center space-y-8 max-w-2xl mx-auto">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-semibold opacity-70">
                  Mempelai Bahagia
                </p>
                <h2 className="font-serif-luxury text-3xl font-bold">
                  Dua Hati Satu Janji
                </h2>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                  Dengan penuh rasa syukur, kami mengundang kehadiran Bapak/Ibu/Saudara/i untuk merayakan momen berharga ini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
                      alt="Groom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif-luxury text-xl font-bold">Romeo Pratama</h3>
                  <p className="text-xs opacity-75">Putra Bpk. Pratama & Ibu Rahma</p>
                </div>

                <div className="p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                      alt="Bride"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif-luxury text-xl font-bold">Juliet Anindya</h3>
                  <p className="text-xs opacity-75">Putri Bpk. Anindya & Ibu Shinta</p>
                </div>
              </div>
            </div>

            {/* Event Schedule Section */}
            <div className="p-8 sm:p-12 border-t border-black/10 bg-black/[0.02]">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <h2 className="font-serif-luxury text-3xl font-bold">Jadwal & Lokasi</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="p-5 rounded-xl bg-white border border-black/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.secondary_color }}>
                      <Calendar className="w-4 h-4" />
                      <span>Akad Nikah</span>
                    </div>
                    <p className="text-sm font-semibold">08:00 - 10:00 WITA</p>
                    <p className="text-xs opacity-75">Masjid Agung Al-Falah, Makassar</p>
                  </div>

                  <div className="p-5 rounded-xl bg-white border border-black/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.secondary_color }}>
                      <Calendar className="w-4 h-4" />
                      <span>Resepsi</span>
                    </div>
                    <p className="text-sm font-semibold">19:00 - 22:00 WITA</p>
                    <p className="text-xs opacity-75">Ballroom The Rinra Hotel, Makassar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom preview note */}
            <div className="p-8 text-center text-xs opacity-60 border-t border-black/10">
              Pratinjau Desain Template — Semua teks, gambar, musik, dan form RSVP dapat disesuaikan di editor.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TemplateDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 text-xs text-[#7A807C] bg-[#F3EFE6]">Memuat pratinjau template...</div>}>
      <TemplateDetailContent />
    </Suspense>
  );
}
