import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Heart, 
  Calendar, 
  Users, 
  QrCode, 
  Music, 
  Layout, 
  Sliders, 
  Palette, 
  ShieldCheck, 
  Briefcase, 
  Zap, 
  Smartphone,
  Eye
} from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { INITIAL_PLANS } from '@/lib/billing/plans';
import { INITIAL_TEMPLATES } from '@/lib/data-store';
import { formatIDR } from '@/lib/utils';

export default function HomePage() {
  const weddingTemplates = INITIAL_TEMPLATES.filter(t => t.category === 'wedding').slice(0, 3);
  const otherTemplates = INITIAL_TEMPLATES.filter(t => t.category !== 'wedding').slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1">
        {/* ==================================================================== */}
        {/* 1. HERO SECTION */}
        {/* ==================================================================== */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-[#E8E3DA]">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E8DFD8]/40 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EFE6] border border-[#E2DBD0] text-xs font-medium text-[#1F2421]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>SaaS Undangan Digital Generasi Baru Indonesia</span>
                </div>

                <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1F2421] leading-[1.15]">
                  Keanggunan Abadi untuk Momen Paling <span className="italic font-normal gold-gradient-text">Istimewa</span> Anda.
                </h1>

                <p className="text-base sm:text-lg text-[#555C57] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Buat website undangan pernikahan, ulang tahun, dan acara eksklusif dalam hitungan menit. Dilengkapi dua mode editor canggih, manajemen RSVP, buku tamu, musik latar, serta kuota tamu terukur untuk personal maupun vendor studio.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link href="/templates" className="w-full sm:w-auto">
                    <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-md">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Buat Undangan Sekarang
                    </Button>
                  </Link>
                  <Link href="/templates" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Lihat Katalog Template
                      <ArrowRight className="w-4 h-4 ml-2 text-[#C5A880]" />
                    </Button>
                  </Link>
                </div>

                {/* Micro social proof */}
                <div className="pt-6 border-t border-[#E8E3DA] grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                  <div>
                    <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">5.000+</p>
                    <p className="text-xs text-[#7A807C]">Undangan Diterbitkan</p>
                  </div>
                  <div>
                    <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">99.9%</p>
                    <p className="text-xs text-[#7A807C]">Uptime Server Cepat</p>
                  </div>
                  <div>
                    <p className="font-serif-luxury text-2xl font-bold text-[#1F2421]">WITA</p>
                    <p className="text-xs text-[#7A807C]">Standar Asia/Makassar</p>
                  </div>
                </div>
              </div>

              {/* Right Live Interactive Phone Mockup Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-[320px] sm:w-[350px] rounded-[40px] border-[8px] border-[#222523] bg-[#FCFBF7] shadow-2xl overflow-hidden">
                  {/* Speaker notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#222523] rounded-b-xl z-20" />

                  {/* Phone screen content */}
                  <div className="pt-8 pb-6 px-4 space-y-5 h-[580px] overflow-y-auto">
                    {/* Live banner */}
                    <div className="text-center space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">
                        The Wedding Celebration
                      </p>
                      <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                        Andi & Siti
                      </h3>
                      <p className="text-xs text-[#636965]">Minggu, 15 Desember 2026</p>
                    </div>

                    {/* Cover photo */}
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-[#E8E3DA] shadow-inner">
                      <img
                        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80"
                        alt="Andi & Siti Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[11px] text-white/90 font-medium">
                          Kepada Yth: Tamu Undangan Terhormat
                        </span>
                      </div>
                    </div>

                    {/* Floating Audio preview pill */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E3DA] shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F3EFE6] flex items-center justify-center text-[#C5A880]">
                          <Music className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1F2421]">A Thousand Years</p>
                          <p className="text-[10px] text-[#7A807C]">Acoustic Instrumental</p>
                        </div>
                      </div>
                      <Badge variant="gold" className="text-[10px]">Playing</Badge>
                    </div>

                    {/* Quick RSVP CTA within preview */}
                    <div className="p-3 rounded-xl bg-[#F6F3EE] border border-[#E4DEC9] text-center space-y-2">
                      <p className="text-xs font-medium text-[#1F2421]">Konfirmasi Kehadiran</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-[#1F2421] text-white">
                          Hadir
                        </button>
                        <button className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-white border border-[#D5CEC0] text-[#1F2421]">
                          Tidak Hadir
                        </button>
                      </div>
                    </div>

                    {/* Preview action button */}
                    <div className="pt-1">
                      <Link href="/i/andi-siti" target="_blank">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                          Buka Halaman Undangan Penuh
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. DUAL EDITOR EXPERIENCE (SIMPLE vs VISUAL) */}
        {/* ==================================================================== */}
        <section id="features" className="py-20 bg-white border-b border-[#E8E3DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="gold">Inovasi Editor Rynora</Badge>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F2421]">
                Dua Mode Pembuatan: Sederhana atau Visual Penuh
              </h2>
              <p className="text-[#555C57] text-base">
                Dirancang untuk memudahkan siapa saja: panduan bertahap untuk pemula, atau kanvas visual terstruktur untuk studio vendor yang membutuhkan kendali bebas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Simple Guided Editor Card */}
              <div id="editor-simple" className="luxury-card rounded-2xl p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F3EFE6] flex items-center justify-center text-[#1F2421]">
                    <Sliders className="w-6 h-6 text-[#C5A880]" />
                  </div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                    Simple Guided Editor
                  </h3>
                  <p className="text-sm text-[#555C57] leading-relaxed">
                    Alur 8 langkah terpandu tanpa ribet. Cukup masukkan nama pengantin, jadwal akad & resepsi, lokasi Google Maps, dan foto Anda. Sistem kami yang menata keindahannya secara otomatis.
                  </p>
                  <ul className="space-y-2.5 text-sm text-[#3A403C] pt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Formulir terstruktur per sesi acara</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Upload cover, galeri foto, dan lagu otomatis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Preview instan mobile & desktop</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Sangat ramah pengguna awam & non-teknis</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#E8E3DA]">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Coba Simple Editor</span>
                      <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Advanced Visual Builder Card */}
              <div id="editor-visual" className="luxury-card rounded-2xl p-8 space-y-6 flex flex-col justify-between border-[#C5A880]/40 bg-gradient-to-b from-white to-[#FCFBF7]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#1F2421] flex items-center justify-center text-[#FCFBF7]">
                      <Layout className="w-6 h-6 text-[#C5A880]" />
                    </div>
                    <Badge variant="gold">Visual Section Builder</Badge>
                  </div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                    Advanced Visual Editor
                  </h3>
                  <p className="text-sm text-[#555C57] leading-relaxed">
                    Kontrol penuh tata letak seksi per seksi. Susun ulang, sembunyikan atau gandakan blok, sesuaikan palet warna, tipografi serif, padding, dan tampilan cover secara interaktif dengan autosave otomatis.
                  </p>
                  <ul className="space-y-2.5 text-sm text-[#3A403C] pt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                      <span>Reorder, duplicate, dan hide/show komponen</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                      <span>Pilihan tipografi luxury serif & sans-serif modern</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                      <span>Live responsive canvas switch (Mobile / Tablet / Desktop)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                      <span>Riwayat perubahan Undo / Redo & Autosave</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#E8E3DA]">
                  <Link href="/dashboard">
                    <Button variant="gold" className="w-full justify-between">
                      <span>Buka Visual Editor</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. FEATURED TEMPLATES CATALOG PREVIEW */}
        {/* ==================================================================== */}
        <section className="py-20 border-b border-[#E8E3DA] bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="gold">Koleksi Desain Eksklusif</Badge>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F2421]">
                  Pilihan Template Terpopuler
                </h2>
                <p className="text-[#555C57] text-sm sm:text-base">
                  Dibuat oleh desainer profesional dengan estetika visual mewah, tipografi anggun, dan responsif.
                </p>
              </div>
              <Link href="/templates">
                <Button variant="outline">
                  Lihat Semua Template
                  <ArrowRight className="w-4 h-4 ml-2 text-[#C5A880]" />
                </Button>
              </Link>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {weddingTemplates.map(tpl => (
                <div key={tpl.id} className="luxury-card rounded-2xl overflow-hidden group">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={tpl.preview_image_url}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      {tpl.is_premium ? (
                        <Badge variant="gold">Premium</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">
                        {tpl.category}
                      </span>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-[#636965] mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E3DA]">
                      <Link href={`/templates/${tpl.slug}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/dashboard?create=true&template=${tpl.id}`}>
                        <Button variant="gold" size="sm" className="text-xs">
                          Gunakan
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. EVENT CATEGORIES */}
        {/* ==================================================================== */}
        <section className="py-20 bg-white border-b border-[#E8E3DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="gold">Fleksibel & Serbaguna</Badge>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F2421]">
                Mendukung Berbagai Kategori Acara
              </h2>
              <p className="text-[#555C57] text-sm">
                Skema data yang fleksibel disesuaikan dengan kebutuhan setiap momen berharga Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Pernikahan', desc: 'Akad & Resepsi', icon: Heart, cat: 'wedding' },
                { name: 'Ulang Tahun', desc: 'Sweet 17 & Milad', icon: Sparkles, cat: 'birthday' },
                { name: 'Aqiqah', desc: 'Tasyakuran & Khitan', icon: Users, cat: 'aqiqah' },
                { name: 'Wisuda', desc: 'Kelulusan Kampus', icon: Calendar, cat: 'graduation' },
                { name: 'Korporat', desc: 'Gala & Konferensi', icon: Briefcase, cat: 'corporate' },
                { name: 'Seminar', desc: 'Workshop & Kelas', icon: Layout, cat: 'seminar' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={`/templates?category=${item.cat}`}
                    className="p-5 rounded-2xl border border-[#E8E3DA] bg-[#FCFBF7] hover:border-[#C5A880] hover:bg-white text-center space-y-3 transition-all group"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-[#E8E3DA] flex items-center justify-center text-[#1F2421] group-hover:bg-[#1F2421] group-hover:text-[#FCFBF7] transition-colors">
                      <Icon className="w-5 h-5 text-[#C5A880]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#1F2421]">{item.name}</h4>
                      <p className="text-[11px] text-[#7A807C] mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. GUEST LIMIT RULES & PRICING COMPARISON */}
        {/* ==================================================================== */}
        <section id="pricing" className="py-24 bg-[#FAF8F5] border-b border-[#E8E3DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="gold">Investasi Transparan</Badge>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F2421]">
                Paket Langganan & Kebijakan Kuota Tamu
              </h2>
              <p className="text-[#555C57] text-base">
                Pilih paket yang paling sesuai. Batas tamu berlaku independen untuk setiap undangan, bukan akumulasi akun.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 1. FREE PLAN */}
              <div className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Free</h3>
                    <p className="text-xs text-[#7A807C]">Eksplorasi & coba fitur</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif-luxury text-3xl font-bold text-[#1F2421]">Rp 0</span>
                    <span className="text-xs text-[#7A807C]"> / selamanya</span>
                  </div>

                  {/* Crucial guest limit highlight */}
                  <div className="p-3 rounded-xl bg-[#F6F3EE] border border-[#E9E3D8] text-center">
                    <p className="text-xs font-semibold text-[#1F2421]">Batas Tamu Terdaftar:</p>
                    <p className="font-serif-luxury text-lg font-bold text-[#9A7B4F]">Maks. 100 Tamu</p>
                    <p className="text-[10px] text-[#7A807C]">Per satu undangan</p>
                  </div>

                  <ul className="space-y-2 text-xs text-[#4E5450]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>1 draft undangan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Template standar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Simple Editor</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Watermark Rynora</span>
                    </li>
                  </ul>
                </div>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full text-xs">
                    Mulai Gratis
                  </Button>
                </Link>
              </div>

              {/* 2. PERSONAL PLUS */}
              <div className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6 border-[#C5A880]/50 relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Personal Plus</h3>
                      <p className="text-xs text-[#7A807C]">Momen pernikahan intim</p>
                    </div>
                    <Badge variant="gold" className="text-[10px]">Populer</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif-luxury text-3xl font-bold text-[#1F2421]">Rp 39.000</span>
                    <span className="text-xs text-[#7A807C]"> / bulan</span>
                    <p className="text-[10px] text-[#C5A880] font-medium">atau Rp 299.000 / tahun</p>
                  </div>

                  {/* Crucial guest limit highlight */}
                  <div className="p-3 rounded-xl bg-[#F6F3EE] border border-[#E9E3D8] text-center">
                    <p className="text-xs font-semibold text-[#1F2421]">Batas Tamu Terdaftar:</p>
                    <p className="font-serif-luxury text-lg font-bold text-[#9A7B4F]">Maks. 1.000 Tamu</p>
                    <p className="text-[10px] text-[#7A807C]">Per satu undangan</p>
                  </div>

                  <ul className="space-y-2 text-xs text-[#4E5450]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Hingga 3 undangan aktif</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Simple & Visual Editor</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>RSVP, Galeri Foto & Musik</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Tanpa watermark Rynora</span>
                    </li>
                  </ul>
                </div>

                <Link href="/dashboard/subscription?plan=personal-plus">
                  <Button variant="gold" className="w-full text-xs">
                    Pilih Personal Plus
                  </Button>
                </Link>
              </div>

              {/* 3. CREATOR PRO */}
              <div className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Creator Pro</h3>
                    <p className="text-xs text-[#7A807C]">Acara besar & seremonial</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif-luxury text-3xl font-bold text-[#1F2421]">Rp 79.000</span>
                    <span className="text-xs text-[#7A807C]"> / bulan</span>
                    <p className="text-[10px] text-[#C5A880] font-medium">atau Rp 599.000 / tahun</p>
                  </div>

                  {/* Crucial guest limit highlight */}
                  <div className="p-3 rounded-xl bg-[#F6F3EE] border border-[#E9E3D8] text-center">
                    <p className="text-xs font-semibold text-[#1F2421]">Batas Tamu Terdaftar:</p>
                    <p className="font-serif-luxury text-lg font-bold text-[#9A7B4F]">Unlimited Tamu</p>
                    <p className="text-[10px] text-[#7A807C]">Tanpa batas buatan per undangan</p>
                  </div>

                  <ul className="space-y-2 text-xs text-[#4E5450]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Hingga 10 undangan aktif</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Semua template premium</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>QR Check-in scanner</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Duplikasi & Ekspor Data Tamu</span>
                    </li>
                  </ul>
                </div>

                <Link href="/dashboard/subscription?plan=creator-pro">
                  <Button variant="primary" className="w-full text-xs">
                    Pilih Creator Pro
                  </Button>
                </Link>
              </div>

              {/* 4. VENDOR STUDIO */}
              <div className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6 bg-[#1F2421] text-[#FCFBF7]">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-white">Vendor Studio</h3>
                      <p className="text-xs text-[#A0A5A2]">Untuk WO & Creative Studio</p>
                    </div>
                    <Badge variant="gold" className="text-[10px]">Agency</Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif-luxury text-3xl font-bold text-white">Rp 199.000</span>
                    <span className="text-xs text-[#A0A5A2]"> / bulan</span>
                    <p className="text-[10px] text-[#C5A880] font-medium">atau Rp 1.990.000 / tahun</p>
                  </div>

                  {/* Crucial guest limit highlight */}
                  <div className="p-3 rounded-xl bg-[#2C312E] border border-[#3E4541] text-center">
                    <p className="text-xs font-semibold text-[#FCFBF7]">Batas Tamu Terdaftar:</p>
                    <p className="font-serif-luxury text-lg font-bold text-[#C5A880]">Unlimited Tamu</p>
                    <p className="text-[10px] text-[#A0A5A2]">Tanpa batas buatan per undangan</p>
                  </div>

                  <ul className="space-y-2 text-xs text-[#D8DDD9]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                      <span>30 Kuota Publikasi Baru / bulan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                      <span>Multi-client workspace & manajemen tim (3 seats)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                      <span>Vendor branding (logo & profil studio)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                      <span>Laporan analitik & ekspor data lengkap</span>
                    </li>
                  </ul>
                </div>

                <Link href="/vendor">
                  <Button variant="gold" className="w-full text-xs">
                    Masuk Portal Vendor
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) */}
        {/* ==================================================================== */}
        <section id="faq" className="py-20 bg-white border-b border-[#E8E3DA]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <Badge variant="gold">Pertanyaan Umum</Badge>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                Hal yang Sering Ditanyakan
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Bagaimana penghitungan kuota tamu undangan di Rynora Invite?',
                  a: 'Batas tamu dihitung berdasarkan jumlah baris data tamu yang didaftarkan pada masing-masing undangan secara independen. Satu baris data (misal: "Bpk. Syamsuddin & Keluarga" dengan pax 4) hanya menghitung 1 data tamu terdaftar, bukan 4. Respon RSVP dari tamu juga tidak menambah kuota tamu Anda.',
                },
                {
                  q: 'Berapa batas tamu untuk paket Free dan Personal Plus?',
                  a: 'Paket Free memiliki batas maksimal 100 tamu per undangan. Paket Personal Plus memiliki batas hingga 1.000 tamu per undangan. Paket Creator Pro dan Vendor Studio memiliki kuota Unlimited tamu.',
                },
                {
                  q: 'Apa yang terjadi jika saya downgrade atau masa langganan berakhir?',
                  a: 'Data tamu dan undangan yang sudah ada tersimpan aman dan tidak akan dihapus secara otomatis. Namun penambahan data tamu baru akan dibatasi jika jumlah tamu yang ada sudah melebihi batas paket baru.',
                },
                {
                  q: 'Bagaimana cara kerja pembayaran subscription?',
                  a: 'Kami mengintegrasikan payment gateway resmi Indonesia (Midtrans / Xendit) yang mendukung QRIS, Virtual Account BCA/Mandiri/BRI, dan kartu. Pembaruan dilakukan melalui konfirmasi otomatis maupun manual yang aman.',
                },
                {
                  q: 'Apakah bisa menggunakan domain sendiri untuk website undangan?',
                  a: 'Ya, paket Creator Pro dan Vendor Studio mendukung penyesuaian domain dan subdomain independen dari merek Rynora.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-[#E8E3DA] bg-[#FCFBF7] space-y-2">
                  <h4 className="font-semibold text-base text-[#1F2421]">{faq.q}</h4>
                  <p className="text-sm text-[#555C57] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
