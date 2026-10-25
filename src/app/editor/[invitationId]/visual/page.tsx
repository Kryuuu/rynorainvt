'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Save, 
  Eye, 
  Layers, 
  Sliders, 
  Plus, 
  Copy, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Check, 
  Sparkles,
  Volume2,
  Music,
  Film,
  Heart,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Gift,
  MessageSquare,
  ChevronDown,
  Upload,
  X,
  Play,
  Pause,
  Edit3,
  Image as ImageIcon,
  CheckCircle,
  Crown,
  Share2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore, INITIAL_INVITATIONS } from '@/lib/data-store';
import { InvitationSectionConfig, ThemeConfiguration, EventData } from '@/types';
import { formatDateWITA } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

// Audio Presets
const AUDIO_PRESETS = [
  { title: 'A Thousand Years (Acoustic)', url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3', category: 'Klasik Elegan' },
  { title: 'Canon in D (Orchestral)', url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3', category: 'Orkestra Khidmat' },
  { title: 'Moonlight Piano (Romantic)', url: 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-1005.mp3', category: 'Piano Lembut' },
  { title: 'Melodi Cinta Nusantara', url: 'https://assets.mixkit.co/music/preview/mixkit-gentle-acoustics-49.mp3', category: 'Akustik Romantis' },
  { title: 'Celebration Joy (Uplifting)', url: 'https://assets.mixkit.co/music/preview/mixkit-happy-bells-1006.mp3', category: 'Gembira & Ceria' },
];

function AdvancedVisualEditorContent() {
  const params = useParams();
  const invitationId = (params?.invitationId as string) || 'inv_andi_siti';
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181A18] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-10 h-10 rounded-2xl bg-[#2D312E] text-[#C5A880] flex items-center justify-center mb-3 animate-spin">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold">Memuat kanvas visual editor...</p>
      </div>
    );
  }

  if (!user && !profile) {
    return (
      <div className="min-h-screen bg-[#181A18] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full bg-[#1F2421] border border-white/10 rounded-3xl p-8 space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2D312E] text-[#C5A880] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif-luxury text-xl font-bold text-white">
              Login Diperlukan
            </h2>
            <p className="text-xs text-stone-400">
              Silakan masuk ke akun Rynora Anda untuk menggunakan visual canvas editor.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href={`/login?redirectTo=/editor/${invitationId}/visual`}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#C5A880] text-[#181A18] text-xs font-bold hover:bg-[#D4AF37] transition-colors"
            >
              Masuk Sekarang
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center py-2 px-4 text-xs text-stone-400 hover:text-white"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initialInvitation = dataStore.getInvitationById(invitationId) || INITIAL_INVITATIONS[0];

  // Canvas Mode & Inspector Navigation
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('hero');
  const [inspectorTab, setInspectorTab] = useState<'section' | 'theme'>('section');
  const [isSaved, setIsSaved] = useState(true);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Audio preview in editor
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Editable Invitation State
  const [eventData, setEventData] = useState<EventData>({
    ...initialInvitation.event_data,
    bride_photo_url: initialInvitation.event_data.bride_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    groom_photo_url: initialInvitation.event_data.groom_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    video_url: initialInvitation.event_data.video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_title: initialInvitation.event_data.video_title || 'Sinematik Prewedding Kami',
    enable_video: initialInvitation.event_data.enable_video ?? true,
    love_story: initialInvitation.event_data.love_story || [
      { year: '2022', title: 'Pertemuan Pertama', story: 'Berawal dari ruang perkuliahan yang sama di kampus, kami mulai mengenal satu sama lain.' },
      { year: '2024', title: 'Momen Lamaran', story: 'Dengan restu kedua orang tua, kami mengikat janji suci untuk melangkah ke jenjang pernikahan.' },
      { year: '2026', title: 'Menuju Pelaminan', story: 'Menyatukan cinta, harapan, dan doa dalam ikatan pernikahan yang suci selamanya.' },
    ],
    digital_gifts: initialInvitation.event_data.digital_gifts || [
      { id: 'gift_1', bank_name: 'BCA', account_number: '7880992314', account_holder: 'Siti Nurhaliza' },
      { id: 'gift_2', bank_name: 'Bank Mandiri', account_number: '137001928374', account_holder: 'Andi Pratama' },
    ],
    gift_delivery_address: initialInvitation.event_data.gift_delivery_address || 'Jl. H. Bau No. 45, Ujung Pandang, Makassar, Sulawesi Selatan (90113)',
  });

  const [theme, setTheme] = useState<ThemeConfiguration>(initialInvitation.theme_configuration);

  const [sections, setSections] = useState<InvitationSectionConfig[]>([
    { id: 'sec_1', section_key: 'hero', component_type: 'HeroSection', sort_order: 1, is_visible: true, custom_title: 'Sampul & Hero' },
    { id: 'sec_2', section_key: 'couple', component_type: 'CoupleSection', sort_order: 2, is_visible: true, custom_title: 'Profil Mempelai' },
    { id: 'sec_3', section_key: 'video', component_type: 'VideoSection', sort_order: 3, is_visible: true, custom_title: 'Video Prewedding (MP4)' },
    { id: 'sec_4', section_key: 'events', component_type: 'EventsSection', sort_order: 4, is_visible: true, custom_title: 'Jadwal & Lokasi Acara' },
    { id: 'sec_5', section_key: 'story', component_type: 'StorySection', sort_order: 5, is_visible: true, custom_title: 'Kisah Cinta (Love Story)' },
    { id: 'sec_6', section_key: 'gallery', component_type: 'GallerySection', sort_order: 6, is_visible: true, custom_title: 'Galeri Foto' },
    { id: 'sec_7', section_key: 'rsvp', component_type: 'RsvpSection', sort_order: 7, is_visible: true, custom_title: 'Konfirmasi Kehadiran (RSVP)' },
    { id: 'sec_8', section_key: 'wishes', component_type: 'WishesSection', sort_order: 8, is_visible: true, custom_title: 'Buku Tamu & Ucapan' },
    { id: 'sec_9', section_key: 'gifts', component_type: 'GiftsSection', sort_order: 9, is_visible: true, custom_title: 'Amplop Digital / Hadiah' },
    { id: 'sec_10', section_key: 'closing', component_type: 'ClosingSection', sort_order: 10, is_visible: true, custom_title: 'Penutup & Salam' },
  ]);

  // Debounced Autosave Simulator
  useEffect(() => {
    setIsSaved(false);
    const timeout = setTimeout(() => {
      dataStore.saveInvitation({
        ...initialInvitation,
        event_data: eventData,
        theme_configuration: theme,
        sections,
        updated_at: new Date().toISOString(),
      });
      setIsSaved(true);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [eventData, theme, sections]);

  // Section Manipulation Handlers
  const handleToggleVisibility = (secKey: string) => {
    setSections(sections.map(s => s.section_key === secKey ? { ...s, is_visible: !s.is_visible } : s));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...sections];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    setSections(newArr);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newArr = [...sections];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setSections(newArr);
  };

  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s.id !== secId));
  };

  const handleAddSection = (type: string, title: string) => {
    const newSection: InvitationSectionConfig = {
      id: `sec_${Date.now()}`,
      section_key: type,
      component_type: `${type.charAt(0).toUpperCase() + type.slice(1)}Section`,
      sort_order: sections.length + 1,
      is_visible: true,
      custom_title: title,
    };
    setSections([...sections, newSection]);
    setSelectedSectionKey(type);
    setShowAddSectionModal(false);
  };

  // Media File Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSuccess(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (urls: string[]) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    let loaded = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          newUrls.push(ev.target.result);
        }
        loaded++;
        if (loaded === files.length) {
          onSuccess(newUrls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Toggle Audio Preview
  const toggleAudio = (url?: string) => {
    const targetUrl = url || theme.background_music_url;
    if (!targetUrl) return;

    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = targetUrl;
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(console.error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#141614] text-[#FCFBF7] overflow-hidden select-none">
      {/* Background Audio Player */}
      <audio
        ref={audioRef}
        src={theme.background_music_url || ''}
        loop
        onEnded={() => setIsPlayingAudio(false)}
      />

      {/* TOP HEADER NAVIGATION */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between z-30 bg-[#1A1D1A] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury text-sm font-bold truncate max-w-[200px] sm:max-w-xs">
              {initialInvitation.title}
            </span>
            <Badge variant="gold" className="text-[9px] bg-[#C5A880] text-[#1F2421]">Full Visual Editor</Badge>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              deviceMode === 'mobile' ? 'bg-[#C5A880] text-[#1F2421] font-bold' : 'text-gray-400 hover:text-white'
            }`}
            title="Tampilan Ponsel (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              deviceMode === 'tablet' ? 'bg-[#C5A880] text-[#1F2421] font-bold' : 'text-gray-400 hover:text-white'
            }`}
            title="Tampilan Tablet (640px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              deviceMode === 'desktop' ? 'bg-[#C5A880] text-[#1F2421] font-bold' : 'text-gray-400 hover:text-white'
            }`}
            title="Tampilan Desktop (Penuh)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
        </div>

        {/* Actions & Autosave Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1.5">
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Tersimpan otomatis</span>
              </>
            ) : (
              <span className="text-amber-400 animate-pulse font-medium">Menyimpan...</span>
            )}
          </div>

          <Link href={`/i/${initialInvitation.slug}`} target="_blank">
            <Button variant="gold" size="sm" className="text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Lihat Publik
            </Button>
          </Link>
        </div>
      </header>

      {/* MAIN BUILDER BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: STRUKTUR SEKSI & REORDER */}
        <aside className="w-64 sm:w-72 border-r border-white/10 bg-[#181A18] flex flex-col justify-between flex-shrink-0">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#C5A880]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Struktur Seksi</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
              {sections.length} Seksi
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
            {sections.map((sec, idx) => {
              const isSelected = selectedSectionKey === sec.section_key;
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionKey(sec.section_key)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[#C5A880] bg-white/10 font-bold text-white shadow-md ring-1 ring-[#C5A880]/50'
                      : 'border-white/5 bg-white/[0.02] text-gray-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sec.is_visible ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="truncate">{sec.custom_title}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 hover:opacity-100 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleMoveUp(idx)} className="p-1 hover:text-[#C5A880]" title="Pindah ke Atas">
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleMoveDown(idx)} className="p-1 hover:text-[#C5A880]" title="Pindah ke Bawah">
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleToggleVisibility(sec.section_key)} className="p-1 hover:text-white" title={sec.is_visible ? 'Sembunyikan' : 'Tampilkan'}>
                      <Eye className={`w-3 h-3 ${sec.is_visible ? 'text-[#C5A880]' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => handleDeleteSection(sec.id)} className="p-1 hover:text-red-400" title="Hapus Seksi">
                      <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => setShowAddSectionModal(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[#C5A880]/60 text-xs font-semibold text-[#C5A880] hover:bg-[#C5A880]/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Seksi Kustom</span>
            </button>
          </div>
        </aside>

        {/* CENTER LIVE CANVAS (REAL WYSIWYG PREVIEW OF ALL 10 SECTIONS) */}
        <main className="flex-1 bg-[#0D0F0E] p-3 sm:p-6 flex items-center justify-center overflow-hidden">
          <div
            className={`transition-all duration-300 rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#FCFBF7] ${
              deviceMode === 'mobile'
                ? 'w-[390px] h-[780px]'
                : deviceMode === 'tablet'
                ? 'w-[640px] h-[780px]'
                : 'w-full max-w-4xl h-full'
            }`}
          >
            {/* Scrollable Canvas Viewport */}
            <div
              className="h-full overflow-y-auto space-y-6 scrollbar-thin select-text"
              style={{
                backgroundColor: theme.background_color || '#FCFBF7',
                color: theme.text_primary || '#1F2421',
              }}
            >
              {/* Loop over active visible sections */}
              {sections
                .filter((s) => s.is_visible)
                .map((sec) => {
                  const isSelected = selectedSectionKey === sec.section_key;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionKey(sec.section_key)}
                      className={`relative transition-all cursor-pointer group ${
                        isSelected
                          ? 'ring-2 ring-[#C5A880] ring-offset-2 ring-offset-black/20 shadow-xl'
                          : 'hover:ring-1 hover:ring-[#C5A880]/40'
                      }`}
                    >
                      {/* Active Section Floating Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-20 bg-[#1F2421] text-[#C5A880] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-[#C5A880]/50 flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          <span>Seksi Aktif: {sec.custom_title}</span>
                        </div>
                      )}

                      {/* 1. HERO SECTION */}
                      {sec.section_key === 'hero' && (
                        <div className="relative min-h-[420px] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
                          <div className="absolute inset-0 z-0">
                            <img
                              src={eventData.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'}
                              alt="Cover"
                              className="w-full h-full object-cover opacity-30 filter blur-[1px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/70" />
                          </div>

                          <div className="relative z-10 space-y-3 pt-6">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">
                              The Wedding Celebration
                            </span>
                            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-tight">
                              {eventData.bride_nickname || 'Siti'} <span className="font-normal italic text-[#C5A880]">&</span> {eventData.groom_nickname || 'Andi'}
                            </h1>
                            <p className="text-xs font-semibold opacity-75">
                              {formatDateWITA(eventData.event_date)}
                            </p>
                          </div>

                          {/* Countdown Timer Preview */}
                          {eventData.enable_countdown && (
                            <div className="relative z-10 grid grid-cols-4 gap-2 mt-6 max-w-xs w-full">
                              {[
                                { label: 'Hari', val: '28' },
                                { label: 'Jam', val: '14' },
                                { label: 'Menit', val: '45' },
                                { label: 'Detik', val: '00' },
                              ].map((item, idx) => (
                                <div key={idx} className="p-2 rounded-xl bg-white/90 border border-[#E8E3DA] shadow-sm text-center">
                                  <span className="font-serif-luxury text-lg font-bold text-[#1F2421]">{item.val}</span>
                                  <p className="text-[9px] uppercase font-bold text-[#9A7B4F]">{item.label}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. COUPLE / PROFIL MEMPELAI */}
                      {sec.section_key === 'couple' && (
                        <div className="py-12 px-6 text-center space-y-8 border-b border-black/5" style={{ backgroundColor: theme.card_color }}>
                          <div className="space-y-1 max-w-md mx-auto">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">
                              Assalamu’alaikum Warahmatullahi Wabarakatuh
                            </span>
                            <p className="text-xs text-gray-600">
                              Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk merayakan pernikahan kami:
                            </p>
                          </div>

                          <div className="space-y-8">
                            {/* Mempelai Wanita */}
                            <div className="space-y-3">
                              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/60 shadow-md">
                                <img src={eventData.bride_photo_url} alt="Bride" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-serif-luxury text-2xl font-bold">{eventData.bride_name}</h3>
                                <p className="text-xs text-gray-500 max-w-xs mx-auto">{eventData.bride_parents}</p>
                              </div>
                            </div>

                            <div className="font-serif-luxury text-2xl font-bold text-[#C5A880] italic">&</div>

                            {/* Mempelai Pria */}
                            <div className="space-y-3">
                              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/60 shadow-md">
                                <img src={eventData.groom_photo_url} alt="Groom" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-serif-luxury text-2xl font-bold">{eventData.groom_name}</h3>
                                <p className="text-xs text-gray-500 max-w-xs mx-auto">{eventData.groom_parents}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. VIDEO PREWEDDING (MP4 / YOUTUBE) */}
                      {sec.section_key === 'video' && eventData.enable_video && (
                        <div className="py-10 px-6 text-center space-y-5 bg-[#1F2421] text-white">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880]">
                              Sinematik Prewedding
                            </span>
                            <h3 className="font-serif-luxury text-2xl font-bold">
                              {eventData.video_title || 'Video Teaser Prewedding'}
                            </h3>
                          </div>

                          <div className="aspect-video max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black relative">
                            {eventData.video_url?.includes('youtube.com') || eventData.video_url?.includes('youtu.be') ? (
                              <iframe
                                src={
                                  eventData.video_url.includes('watch?v=')
                                    ? eventData.video_url.replace('watch?v=', 'embed/')
                                    : eventData.video_url.includes('youtu.be/')
                                    ? eventData.video_url.replace('youtu.be/', 'youtube.com/embed/')
                                    : eventData.video_url
                                }
                                title={eventData.video_title}
                                className="w-full h-full border-0"
                              />
                            ) : (
                              <video src={eventData.video_url} controls playsInline className="w-full h-full object-contain" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4. EVENTS / JADWAL & LOKASI ACARA */}
                      {sec.section_key === 'events' && (
                        <div className="py-10 px-6 text-center space-y-6">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Waktu & Tempat</span>
                            <h2 className="font-serif-luxury text-2xl font-bold">Rangkaian Acara</h2>
                          </div>

                          <div className="space-y-4 max-w-md mx-auto">
                            {eventData.sessions.map((s, idx) => (
                              <div key={idx} className="p-5 rounded-2xl border border-black/10 bg-white/80 shadow-sm text-left space-y-3">
                                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                                  <h4 className="font-serif-luxury font-bold text-lg text-[#1F2421]">{s.title}</h4>
                                  <Badge variant="gold" className="text-[10px]">{formatDateWITA(s.date)}</Badge>
                                </div>
                                <div className="space-y-1.5 text-xs text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                                    <span>{s.start_time} - {s.end_time || 'Selesai'} WITA</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[#C5A880] mt-0.5" />
                                    <div>
                                      <p className="font-semibold text-[#1F2421]">{s.venue_name}</p>
                                      <p className="text-[11px] text-gray-500">{s.venue_address}</p>
                                    </div>
                                  </div>
                                </div>
                                {s.maps_url && (
                                  <Button variant="outline" size="sm" className="w-full text-[11px] h-8 mt-1">
                                    <MapPin className="w-3 h-3 mr-1 text-[#C5A880]" />
                                    Petunjuk Arah Google Maps
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. STORY / KISAH CINTA */}
                      {sec.section_key === 'story' && eventData.enable_story && (
                        <div className="py-10 px-6 text-center space-y-6 bg-black/[0.02]">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Perjalanan Cinta</span>
                            <h2 className="font-serif-luxury text-2xl font-bold">Kisah Kami</h2>
                          </div>

                          <div className="space-y-4 max-w-md mx-auto text-left">
                            {eventData.love_story?.map((item, idx) => (
                              <div key={idx} className="p-4 rounded-xl bg-white border border-black/5 shadow-sm space-y-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C5A880]/20 text-[#9A7B4F]">{item.year}</span>
                                <h4 className="font-serif-luxury font-bold text-sm text-[#1F2421]">{item.title}</h4>
                                <p className="text-xs text-gray-600">{item.story}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 6. GALLERY / GALERI FOTO */}
                      {sec.section_key === 'gallery' && eventData.enable_gallery && (
                        <div className="py-10 px-6 text-center space-y-6">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Momen Bahagia</span>
                            <h2 className="font-serif-luxury text-2xl font-bold">Galeri Foto Prewedding</h2>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto">
                            {eventData.gallery_images.map((img, idx) => (
                              <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-black/10 shadow-sm">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 7. RSVP / KONFIRMASI KEHADIRAN */}
                      {sec.section_key === 'rsvp' && eventData.enable_rsvp && (
                        <div className="py-10 px-6 text-center space-y-6 bg-black/[0.02]">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Konfirmasi Kehadiran</span>
                            <h2 className="font-serif-luxury text-2xl font-bold">RSVP Tamu Undangan</h2>
                          </div>

                          <div className="max-w-md mx-auto p-5 rounded-2xl bg-white border border-black/10 shadow-sm text-left space-y-3 text-xs">
                            <div className="space-y-1">
                              <label className="font-semibold text-gray-700">Nama Lengkap Anda</label>
                              <input type="text" placeholder="Masukkan nama tamu..." disabled className="w-full px-3 py-2 rounded-lg border border-black/10 bg-gray-50" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-gray-700">Konfirmasi Hadir</label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-1.5"><input type="radio" checked readOnly /> Hadir</label>
                                <label className="flex items-center gap-1.5"><input type="radio" disabled /> Berhalangan</label>
                              </div>
                            </div>
                            <Button variant="gold" size="sm" className="w-full text-xs font-semibold" disabled>
                              Kirim Konfirmasi Kehadiran
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 8. WISHES / BUKU TAMU */}
                      {sec.section_key === 'wishes' && eventData.enable_wishes && (
                        <div className="py-10 px-6 text-center space-y-6">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Doa & Ucapan</span>
                            <h2 className="font-serif-luxury text-2xl font-bold">Buku Tamu Virtual</h2>
                          </div>

                          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
                            {[
                              { name: 'dr. Andi Kurnia, Sp.A', wish: 'Selamat menempuh hidup baru Siti & Andi! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.' },
                              { name: 'Sarah & Hendra (Sahabat Kampus)', wish: 'Happy wedding! Semoga bahagia selalu hingga kakek nenek, dilancarkan seluruh acaranya.' }
                            ].map((w, i) => (
                              <div key={i} className="p-3.5 rounded-xl bg-white border border-black/10 shadow-sm space-y-1">
                                <p className="font-bold text-[#1F2421]">{w.name}</p>
                                <p className="text-gray-600">{w.wish}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 9. GIFTS / AMPLOP DIGITAL */}
                      {sec.section_key === 'gifts' && eventData.enable_gift && (
                        <div className="py-10 px-6 text-center space-y-6 bg-black/[0.02]">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Tanda Kasih</span>
                            <h2 className="font-serif-luxury text-2xl font-bold">Amplop Digital & Kado</h2>
                          </div>

                          <div className="max-w-md mx-auto space-y-3 text-left">
                            {eventData.digital_gifts?.map((gift, idx) => (
                              <div key={idx} className="p-4 rounded-xl bg-white border border-black/10 shadow-sm flex items-center justify-between text-xs">
                                <div>
                                  <Badge variant="gold" className="text-[10px] font-mono">{gift.bank_name}</Badge>
                                  <p className="font-mono text-sm font-bold text-[#1F2421] mt-1">{gift.account_number}</p>
                                  <p className="text-[11px] text-gray-500">a.n. {gift.account_holder}</p>
                                </div>
                                <Button variant="outline" size="sm" className="text-[11px] h-8">
                                  Salin Rekening
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 10. CLOSING / PENUTUP */}
                      {sec.section_key === 'closing' && (
                        <div className="py-12 px-6 text-center space-y-6 border-t border-black/10" style={{ backgroundColor: theme.card_color }}>
                          <p className="italic font-serif text-sm max-w-sm mx-auto text-gray-600">
                            &quot;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya...&quot;
                          </p>
                          <span className="text-[11px] font-bold text-[#9A7B4F] block">(QS. Ar-Rum: 21)</span>

                          <div className="pt-4 space-y-1">
                            <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                              {eventData.bride_nickname} & {eventData.groom_nickname}
                            </h3>
                            <p className="text-[11px] text-gray-500">Beserta Keluarga Besar Kedua Mempelai</p>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: DYNAMIC CONTEXT-AWARE INSPECTOR */}
        <aside className="w-80 border-l border-white/10 bg-[#181A18] flex flex-col justify-between overflow-y-auto flex-shrink-0 scrollbar-thin">
          {/* Inspector Header & Tab Switcher */}
          <div className="p-3.5 border-b border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Inspektor Properti
              </span>
              <span className="text-[10px] text-gray-400 capitalize">{selectedSectionKey}</span>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setInspectorTab('section')}
                className={`py-1 rounded font-semibold text-center transition-all ${
                  inspectorTab === 'section' ? 'bg-[#C5A880] text-[#1F2421]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Seksi Terpilih
              </button>
              <button
                onClick={() => setInspectorTab('theme')}
                className={`py-1 rounded font-semibold text-center transition-all ${
                  inspectorTab === 'theme' ? 'bg-[#C5A880] text-[#1F2421]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tema & Musik
              </button>
            </div>
          </div>

          {/* INSPECTOR BODY */}
          <div className="p-4 space-y-6 text-xs flex-1 overflow-y-auto scrollbar-thin">
            {/* TAB 1: SECTION-SPECIFIC INSPECTOR */}
            {inspectorTab === 'section' && (
              <div className="space-y-5 animate-in fade-in-50">
                {/* 1. HERO INSPECTOR */}
                {selectedSectionKey === 'hero' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Kustomisasi Sampul & Hero
                    </span>

                    <div className="space-y-1">
                      <label className="text-gray-300">Nama Panggilan Wanita</label>
                      <input
                        type="text"
                        value={eventData.bride_nickname || ''}
                        onChange={(e) => setEventData({ ...eventData, bride_nickname: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">Nama Panggilan Pria</label>
                      <input
                        type="text"
                        value={eventData.groom_nickname || ''}
                        onChange={(e) => setEventData({ ...eventData, groom_nickname: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300">Tanggal Acara Utama</label>
                      <input
                        type="date"
                        value={eventData.event_date}
                        onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-300 font-semibold">Foto Cover Utama</label>
                        <label className="cursor-pointer text-[#C5A880] text-[11px] hover:underline font-bold">
                          Upload Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEventData({ ...eventData, cover_image_url: url }))}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={eventData.cover_image_url || ''}
                        onChange={(e) => setEventData({ ...eventData, cover_image_url: e.target.value })}
                        placeholder="URL Foto..."
                        className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A880] text-[11px]"
                      />
                      {eventData.cover_image_url && (
                        <div className="h-28 rounded-xl overflow-hidden border border-white/10">
                          <img src={eventData.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                      <span className="text-gray-300">Tampilkan Hitung Mundur</span>
                      <input
                        type="checkbox"
                        checked={eventData.enable_countdown}
                        onChange={(e) => setEventData({ ...eventData, enable_countdown: e.target.checked })}
                        className="w-4 h-4 text-[#C5A880] rounded"
                      />
                    </label>
                  </div>
                )}

                {/* 2. COUPLE INSPECTOR */}
                {selectedSectionKey === 'couple' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Kustomisasi Profil Mempelai
                    </span>

                    {/* Mempelai Wanita */}
                    <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#C5A880]">Mempelai Wanita</span>
                        <label className="cursor-pointer text-[10px] text-white hover:underline">
                          Upload Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEventData({ ...eventData, bride_photo_url: url }))}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={eventData.bride_name}
                        onChange={(e) => setEventData({ ...eventData, bride_name: e.target.value })}
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Orang Tua Mempelai Wanita"
                        value={eventData.bride_parents}
                        onChange={(e) => setEventData({ ...eventData, bride_parents: e.target.value })}
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>

                    {/* Mempelai Pria */}
                    <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#C5A880]">Mempelai Pria</span>
                        <label className="cursor-pointer text-[10px] text-white hover:underline">
                          Upload Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEventData({ ...eventData, groom_photo_url: url }))}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={eventData.groom_name}
                        onChange={(e) => setEventData({ ...eventData, groom_name: e.target.value })}
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Orang Tua Mempelai Pria"
                        value={eventData.groom_parents}
                        onChange={(e) => setEventData({ ...eventData, groom_parents: e.target.value })}
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 3. VIDEO INSPECTOR */}
                {selectedSectionKey === 'video' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Video Prewedding (MP4 / YouTube)
                    </span>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                      <span className="text-gray-300">Aktifkan Seksi Video</span>
                      <input
                        type="checkbox"
                        checked={eventData.enable_video}
                        onChange={(e) => setEventData({ ...eventData, enable_video: e.target.checked })}
                        className="w-4 h-4 text-[#C5A880] rounded"
                      />
                    </label>

                    <div className="space-y-1">
                      <label className="text-gray-300">Judul Video</label>
                      <input
                        type="text"
                        value={eventData.video_title || ''}
                        onChange={(e) => setEventData({ ...eventData, video_title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-300 font-semibold">File MP4 dari Perangkat</label>
                        <label className="cursor-pointer text-[#C5A880] text-[10px] font-bold hover:underline">
                          Upload MP4
                          <input
                            type="file"
                            accept="video/mp4,video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEventData({ ...eventData, video_url: url, enable_video: true }))}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={eventData.video_url || ''}
                        onChange={(e) => setEventData({ ...eventData, video_url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 4. EVENTS INSPECTOR */}
                {selectedSectionKey === 'events' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Daftar Sesi Acara & Lokasi
                    </span>

                    {eventData.sessions.map((session, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#C5A880]">Sesi {idx + 1}: {session.title}</span>
                          {eventData.sessions.length > 1 && (
                            <button
                              onClick={() => {
                                setEventData({
                                  ...eventData,
                                  sessions: eventData.sessions.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-red-400 hover:text-red-300 text-[10px]"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Judul Sesi (e.g. Akad Nikah)"
                          value={session.title}
                          onChange={(e) => {
                            const newSessions = [...eventData.sessions];
                            newSessions[idx].title = e.target.value;
                            setEventData({ ...eventData, sessions: newSessions });
                          }}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            value={session.start_time}
                            onChange={(e) => {
                              const newSessions = [...eventData.sessions];
                              newSessions[idx].start_time = e.target.value;
                              setEventData({ ...eventData, sessions: newSessions });
                            }}
                            className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                          />
                          <input
                            type="time"
                            value={session.end_time}
                            onChange={(e) => {
                              const newSessions = [...eventData.sessions];
                              newSessions[idx].end_time = e.target.value;
                              setEventData({ ...eventData, sessions: newSessions });
                            }}
                            className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Nama Gedung / Ballroom"
                          value={session.venue_name}
                          onChange={(e) => {
                            const newSessions = [...eventData.sessions];
                            newSessions[idx].venue_name = e.target.value;
                            setEventData({ ...eventData, sessions: newSessions });
                          }}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                        />

                        <input
                          type="text"
                          placeholder="Alamat Lengkap"
                          value={session.venue_address}
                          onChange={(e) => {
                            const newSessions = [...eventData.sessions];
                            newSessions[idx].venue_address = e.target.value;
                            setEventData({ ...eventData, sessions: newSessions });
                          }}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                        />

                        <input
                          type="text"
                          placeholder="Link Google Maps"
                          value={session.maps_url || ''}
                          onChange={(e) => {
                            const newSessions = [...eventData.sessions];
                            newSessions[idx].maps_url = e.target.value;
                            setEventData({ ...eventData, sessions: newSessions });
                          }}
                          className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEventData({
                          ...eventData,
                          sessions: [
                            ...eventData.sessions,
                            {
                              id: `ses_${Date.now()}`,
                              title: 'Syukuran Pernikahan',
                              date: eventData.event_date,
                              start_time: '19:00',
                              end_time: '22:00',
                              venue_name: 'Ballroom Utama',
                              venue_address: 'Jl. Jenderal Sudirman No. 1',
                            },
                          ],
                        });
                      }}
                      className="w-full text-xs border-dashed border-[#C5A880]/50 text-[#C5A880]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Sesi Acara Baru
                    </Button>
                  </div>
                )}

                {/* 5. STORY INSPECTOR */}
                {selectedSectionKey === 'story' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Kisah Cinta (Love Story)
                    </span>

                    {eventData.love_story?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            placeholder="Tahun / Periode"
                            value={item.year}
                            onChange={(e) => {
                              const newStories = [...(eventData.love_story || [])];
                              newStories[idx].year = e.target.value;
                              setEventData({ ...eventData, love_story: newStories });
                            }}
                            className="w-24 px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-bold"
                          />
                          <button
                            onClick={() => {
                              setEventData({
                                ...eventData,
                                love_story: eventData.love_story?.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-[10px]"
                          >
                            Hapus
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Judul Milestone"
                          value={item.title}
                          onChange={(e) => {
                            const newStories = [...(eventData.love_story || [])];
                            newStories[idx].title = e.target.value;
                            setEventData({ ...eventData, love_story: newStories });
                          }}
                          className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-semibold"
                        />
                        <textarea
                          placeholder="Cerita..."
                          value={item.story}
                          rows={2}
                          onChange={(e) => {
                            const newStories = [...(eventData.love_story || [])];
                            newStories[idx].story = e.target.value;
                            setEventData({ ...eventData, love_story: newStories });
                          }}
                          className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs resize-none"
                        />
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEventData({
                          ...eventData,
                          love_story: [
                            ...(eventData.love_story || []),
                            { year: '2025', title: 'Babak Baru', story: 'Merencanakan hari bahagia bersama keluarga tercinta.' },
                          ],
                        });
                      }}
                      className="w-full text-xs border-dashed border-[#C5A880]/50 text-[#C5A880]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Cerita Cinta
                    </Button>
                  </div>
                )}

                {/* 6. GALLERY INSPECTOR */}
                {selectedSectionKey === 'gallery' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Galeri Foto Prewedding
                    </span>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">Upload Foto Baru (Multiple)</span>
                      <label className="cursor-pointer text-[#C5A880] font-bold text-xs hover:underline">
                        Upload Files
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleMultiFileUpload(e, (urls) => {
                            setEventData({
                              ...eventData,
                              gallery_images: [...eventData.gallery_images, ...urls],
                            });
                          })}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {eventData.gallery_images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                          <img src={img} alt={`Gallery item ${idx}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              setEventData({
                                ...eventData,
                                gallery_images: eventData.gallery_images.filter((_, i) => i !== idx),
                              });
                            }}
                            className="absolute top-1 right-1 p-1 rounded bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. RSVP INSPECTOR */}
                {selectedSectionKey === 'rsvp' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Konfigurasi RSVP Tamu
                    </span>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                      <span className="text-gray-300">Aktifkan Formulir RSVP</span>
                      <input
                        type="checkbox"
                        checked={eventData.enable_rsvp}
                        onChange={(e) => setEventData({ ...eventData, enable_rsvp: e.target.checked })}
                        className="w-4 h-4 text-[#C5A880] rounded"
                      />
                    </label>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-gray-400 text-[11px] block">
                        Tamu undangan dapat mengonfirmasi status kehadiran (Hadir/Tidak Hadir), jumlah pax tamu, dan mengirim pesan doa restu secara langsung.
                      </span>
                    </div>
                  </div>
                )}

                {/* 8. WISHES INSPECTOR */}
                {selectedSectionKey === 'wishes' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Buku Tamu & Ucapan Doa
                    </span>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                      <span className="text-gray-300">Aktifkan Buku Tamu</span>
                      <input
                        type="checkbox"
                        checked={eventData.enable_wishes}
                        onChange={(e) => setEventData({ ...eventData, enable_wishes: e.target.checked })}
                        className="w-4 h-4 text-[#C5A880] rounded"
                      />
                    </label>
                  </div>
                )}

                {/* 9. GIFTS INSPECTOR */}
                {selectedSectionKey === 'gifts' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Amplop Digital & Kado Fisik
                    </span>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                      <span className="text-gray-300">Aktifkan Amplop Digital</span>
                      <input
                        type="checkbox"
                        checked={eventData.enable_gift}
                        onChange={(e) => setEventData({ ...eventData, enable_gift: e.target.checked })}
                        className="w-4 h-4 text-[#C5A880] rounded"
                      />
                    </label>

                    {eventData.digital_gifts?.map((gift, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            placeholder="Nama Bank (BCA, Mandiri, dll)"
                            value={gift.bank_name}
                            onChange={(e) => {
                              const newGifts = [...(eventData.digital_gifts || [])];
                              newGifts[idx].bank_name = e.target.value;
                              setEventData({ ...eventData, digital_gifts: newGifts });
                            }}
                            className="w-24 px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-bold"
                          />
                          <button
                            onClick={() => {
                              setEventData({
                                ...eventData,
                                digital_gifts: eventData.digital_gifts?.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-[10px]"
                          >
                            Hapus
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Nomor Rekening"
                          value={gift.account_number}
                          onChange={(e) => {
                            const newGifts = [...(eventData.digital_gifts || [])];
                            newGifts[idx].account_number = e.target.value;
                            setEventData({ ...eventData, digital_gifts: newGifts });
                          }}
                          className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Atas Nama"
                          value={gift.account_holder}
                          onChange={(e) => {
                            const newGifts = [...(eventData.digital_gifts || [])];
                            newGifts[idx].account_holder = e.target.value;
                            setEventData({ ...eventData, digital_gifts: newGifts });
                          }}
                          className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs"
                        />
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEventData({
                          ...eventData,
                          digital_gifts: [
                            ...(eventData.digital_gifts || []),
                            { id: `gift_${Date.now()}`, bank_name: 'BCA', account_number: '1234567890', account_holder: eventData.bride_name?.split(',')[0] || 'Mempelai' },
                          ],
                        });
                      }}
                      className="w-full text-xs border-dashed border-[#C5A880]/50 text-[#C5A880]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Rekening Bank
                    </Button>
                  </div>
                )}

                {/* 10. CLOSING INSPECTOR */}
                {selectedSectionKey === 'closing' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                      Penutup & Doa Restu
                    </span>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <p className="text-[11px] text-gray-300">
                        Seksi penutup menampilkan ayat suci pilihan, ungkapan terima kasih, serta salam hormat dari kedua keluarga mempelai.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GLOBAL THEME & MUSIC */}
            {inspectorTab === 'theme' && (
              <div className="space-y-5 animate-in fade-in-50">
                <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider block border-b border-white/10 pb-1">
                  Warna & Tipografi
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-gray-300">Warna Latar Belakang (Background)</label>
                    <input
                      type="color"
                      value={theme.background_color}
                      onChange={(e) => setTheme({ ...theme, background_color: e.target.value })}
                      className="w-full h-8 p-0.5 rounded border border-white/10 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-300">Warna Kartu (Card Background)</label>
                    <input
                      type="color"
                      value={theme.card_color}
                      onChange={(e) => setTheme({ ...theme, card_color: e.target.value })}
                      className="w-full h-8 p-0.5 rounded border border-white/10 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-300">Warna Teks Utama</label>
                    <input
                      type="color"
                      value={theme.text_primary}
                      onChange={(e) => setTheme({ ...theme, text_primary: e.target.value })}
                      className="w-full h-8 p-0.5 rounded border border-white/10 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-300">Aksen Emas / Gold</label>
                    <input
                      type="color"
                      value={theme.accent_gold}
                      onChange={(e) => setTheme({ ...theme, accent_gold: e.target.value })}
                      className="w-full h-8 p-0.5 rounded border border-white/10 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Musik Latar MP3 */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#C5A880] uppercase tracking-wider">
                      Musik Latar (MP3)
                    </span>
                    <label className="cursor-pointer text-[10px] text-white hover:underline font-bold">
                      Upload MP3
                      <input
                        type="file"
                        accept="audio/mp3,audio/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => {
                          setTheme({
                            ...theme,
                            background_music_url: url,
                            background_music_title: 'Audio Unggahan Kustom (MP3)',
                          });
                        })}
                      />
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate text-[11px]">
                        {theme.background_music_title || 'Audio Musik'}
                      </span>
                      <button
                        onClick={() => toggleAudio()}
                        className="p-1.5 rounded-full bg-[#C5A880] text-[#1F2421] hover:bg-white"
                      >
                        {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={theme.background_music_url || ''}
                      onChange={(e) => setTheme({ ...theme, background_music_url: e.target.value })}
                      placeholder="URL MP3..."
                      className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-white text-[10px]"
                    />
                  </div>

                  {/* Preset Songs */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-gray-400 text-[10px] block">Pilih Preset Musik:</span>
                    {AUDIO_PRESETS.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTheme({ ...theme, background_music_url: p.url, background_music_title: p.title });
                          toggleAudio(p.url);
                        }}
                        className={`p-2 rounded-lg border text-[11px] cursor-pointer flex justify-between items-center ${
                          theme.background_music_url === p.url
                            ? 'bg-[#C5A880] text-[#1F2421] font-bold border-[#C5A880]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{p.title}</span>
                        <span className="text-[9px] opacity-75">{p.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Manual Save Button */}
          <div className="p-3.5 border-t border-white/10 text-center">
            <Button
              variant="gold"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => {
                dataStore.saveInvitation({
                  ...initialInvitation,
                  event_data: eventData,
                  theme_configuration: theme,
                  sections,
                  updated_at: new Date().toISOString(),
                });
                alert('Seluruh perubahan visual berhasil disimpan!');
              }}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Simpan Manual
            </Button>
          </div>
        </aside>
      </div>

      {/* MODAL: TAMBAH SEKSI KUSTOM */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1A1D1A] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif-luxury text-lg font-bold text-white">Tambah Seksi Undangan</h3>
              <button onClick={() => setShowAddSectionModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { type: 'video', title: 'Video Prewedding (MP4)', icon: Film },
                { type: 'story', title: 'Kisah Cinta (Love Story)', icon: Heart },
                { type: 'gallery', title: 'Galeri Foto Prewedding', icon: ImageIcon },
                { type: 'rsvp', title: 'Konfirmasi Kehadiran (RSVP)', icon: CheckCircle },
                { type: 'wishes', title: 'Buku Tamu & Ucapan', icon: MessageSquare },
                { type: 'gifts', title: 'Amplop Digital & Rekening', icon: Gift },
                { type: 'closing', title: 'Penutup & Salam Doa', icon: Sparkles },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAddSection(item.type, item.title)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left space-y-1 transition-all"
                  >
                    <Icon className="w-4 h-4 text-[#C5A880]" />
                    <p className="font-semibold text-white truncate">{item.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdvancedVisualEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 text-xs text-[#7A807C] bg-[#141614]">Memuat visual builder...</div>}>
      <AdvancedVisualEditorContent />
    </Suspense>
  );
}
