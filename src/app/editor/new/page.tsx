'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Heart, 
  Calendar, 
  Upload, 
  Palette, 
  Sliders, 
  Eye, 
  CheckCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Video,
  Music,
  Play,
  Pause,
  Trash2,
  Plus,
  Film,
  Crown,
  X,
  Volume2,
  VolumeX,
  FileAudio,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore, INITIAL_TEMPLATES } from '@/lib/data-store';
import { EventCategory, Invitation, ThemeConfiguration, EventData } from '@/types';
import { slugify } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const AUDIO_PRESETS = [
  {
    title: 'A Thousand Years (Romantic Harp & Strings)',
    category: 'Romantic Acoustic',
    url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
  },
  {
    title: 'Canon in D Major (Classical Orchestra)',
    category: 'Classical',
    url: 'https://assets.mixkit.co/music/preview/mixkit-classical-strings-waltz-1051.mp3',
  },
  {
    title: 'Moonlight Serenade (Modern Piano Solo)',
    category: 'Piano Instrumental',
    url: 'https://assets.mixkit.co/music/preview/mixkit-piano-reflection-53.mp3',
  },
  {
    title: 'Melodi Syahdu Cinta (Acoustic Guitar)',
    category: 'Indonesian Romantic',
    url: 'https://assets.mixkit.co/music/preview/mixkit-tender-acoustic-guitar-78.mp3',
  },
  {
    title: 'Celebration Joy (Dynamic Party Acoustic)',
    category: 'Celebration / Birthday',
    url: 'https://assets.mixkit.co/music/preview/mixkit-celebration-party-loop-1123.mp3',
  },
];

export default function SimpleEditorPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-2xl bg-[#1F2421] text-[#C5A880] flex items-center justify-center mb-3 animate-spin">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-[#1F2421]">Memuat editor undangan...</p>
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
              Silakan masuk ke akun Rynora Anda untuk membuat undangan digital baru.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login?redirectTo=/editor/new"
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

  // Form State
  const [category, setCategory] = useState<EventCategory>('wedding');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_minimalist_wedding');

  // Event info
  const [eventTitle, setEventTitle] = useState('The Wedding of Andi & Siti');
  const [brideName, setBrideName] = useState('Siti Nurhaliza, S.E.');
  const [brideParents, setBrideParents] = useState('Putri pertama dari Bpk. Ir. H. Ahmad Dahlan & Ibu Hj. Marwah');
  const [groomName, setGroomName] = useState('Andi Pratama, M.Kom.');
  const [groomParents, setGroomParents] = useState('Putra kedua dari Bpk. Drs. H. Usman Ali & Ibu Hj. Aminah');
  const [eventDate, setEventDate] = useState('2026-12-15');
  const [venueName, setVenueName] = useState('Grand Clarion Ballroom Makassar');
  const [venueAddress, setVenueAddress] = useState('Jl. A. P. Pettarani No. 3, Makassar');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com/?q=Grand+Clarion+Makassar');

  // Media State
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1519741497674-611481863552?w=1200');
  const [bridePhotoUrl, setBridePhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
  const [groomPhotoUrl, setGroomPhotoUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400');

  // Video State (MP4 / YouTube)
  const [enableVideo, setEnableVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [videoTitle, setVideoTitle] = useState('Kisah Cinta & Momen Bahagia Kami');

  // Gallery Images (Multi)
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
  ]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Audio / Music State (MP3)
  const [bgMusicUrl, setBgMusicUrl] = useState('https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3');
  const [bgMusicTitle, setBgMusicTitle] = useState('A Thousand Years (Romantic Harp & Strings)');
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Active Media Sub-tab
  const [mediaTab, setMediaTab] = useState<'cover' | 'couple' | 'video' | 'gallery' | 'audio'>('cover');

  // Theme
  const [primaryColor, setPrimaryColor] = useState('#1F2421');
  const [accentColor, setAccentColor] = useState('#C5A880');
  const [fontHeading, setFontHeading] = useState<'playfair' | 'cormorant' | 'cinzel' | 'serif'>('playfair');

  // Feature Toggles
  const [enableRsvp, setEnableRsvp] = useState(true);
  const [enableWishes, setEnableWishes] = useState(true);
  const [enableGift, setEnableGift] = useState(true);
  const [enableCountdown, setEnableCountdown] = useState(true);

  // Preview Device
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const selectedTemplate = INITIAL_TEMPLATES.find(t => t.id === selectedTemplateId) || INITIAL_TEMPLATES[0];

  const handlePublish = () => {
    setIsPublishing(true);

    const generatedSlug = slugify(eventTitle) || `undangan-${Date.now()}`;

    const newInvitation: Invitation = {
      id: `inv_${Date.now()}`,
      workspace_id: 'ws_personal_01',
      created_by: 'user_personal_01',
      template_id: selectedTemplateId,
      title: eventTitle,
      slug: generatedSlug,
      category,
      status: 'published',
      published_at: new Date().toISOString(),
      event_data: {
        event_title: eventTitle,
        bride_name: brideName,
        bride_parents: brideParents,
        bride_photo_url: bridePhotoUrl,
        groom_name: groomName,
        groom_parents: groomParents,
        groom_photo_url: groomPhotoUrl,
        event_date: eventDate,
        timezone: 'Asia/Makassar',
        sessions: [
          {
            id: 'ses_1',
            title: 'Akad Nikah',
            date: eventDate,
            start_time: '08:30',
            end_time: '10:30',
            venue_name: 'Masjid Raya Makassar',
            venue_address: 'Jl. Masjid Raya No. 1, Makassar',
            maps_url: mapsUrl,
          },
          {
            id: 'ses_2',
            title: 'Resepsi',
            date: eventDate,
            start_time: '19:00',
            end_time: '22:00',
            venue_name: venueName,
            venue_address: venueAddress,
            maps_url: mapsUrl,
          },
        ],
        cover_image_url: coverImageUrl,
        video_url: enableVideo ? videoUrl : undefined,
        video_title: videoTitle,
        enable_video: enableVideo,
        gallery_images: galleryImages,
        digital_gifts: [
          {
            id: 'gift_1',
            bank_name: 'BCA',
            account_number: '7880992314',
            account_holder: brideName.split(',')[0],
          },
        ],
        enable_rsvp: enableRsvp,
        enable_wishes: enableWishes,
        enable_gift: enableGift,
        enable_countdown: enableCountdown,
        enable_gallery: true,
        enable_story: true,
      },
      theme_configuration: {
        primary_color: primaryColor,
        secondary_color: accentColor,
        background_color: selectedTemplate.default_configuration.theme.background_color,
        card_color: '#FFFFFF',
        text_primary: primaryColor,
        text_secondary: '#636965',
        accent_gold: accentColor,
        font_heading: fontHeading,
        font_body: 'plus-jakarta',
        cover_layout: 'centered',
        border_radius: 'md',
        background_music_url: bgMusicUrl,
        background_music_title: bgMusicTitle,
        show_floating_music_button: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTimeout(() => {
      dataStore.saveInvitation(newInvitation);
      setIsPublishing(false);
      setPublishedSlug(generatedSlug);
      setCurrentStep(8);
    }, 800);
  };

  // Generic Image File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => {
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

  // Multiple Gallery Photos Upload Handler
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setGalleryImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Video File Upload Handler (MP4)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setVideoUrl(event.target.result);
        setEnableVideo(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Audio File Upload Handler (MP3)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setBgMusicUrl(event.target.result);
        setBgMusicTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Audio Play / Pause Preview Toggle
  const toggleAudioPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingAudioPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      audioPreviewRef.current.play().then(() => {
        setIsPlayingAudioPreview(true);
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col">
      {/* Top Wizard Navigation */}
      <header className="h-16 bg-[#1F2421] text-[#FCFBF7] px-4 sm:px-8 flex items-center justify-between border-b border-[#E8E3DA]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Batal & Kembali</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20" />
          <span className="font-serif-luxury font-bold text-sm">
            Simple Guided Editor
          </span>
        </div>

        {/* Step Indicator */}
        <div className="text-xs font-medium text-gray-300">
          Langkah <span className="font-bold text-[#C5A880]">{currentStep}</span> dari 8
        </div>
      </header>

      {/* Main Wizard Form Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Step 1: Event Category */}
        {currentStep === 1 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 1</span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Pilih Kategori Acara</h2>
              <p className="text-xs text-[#636965]">Tentukan jenis acara untuk menyesuaikan struktur formulir data Anda.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: 'wedding', label: 'Pernikahan / Resepsi', icon: Heart },
                { id: 'birthday', label: 'Ulang Tahun / Sweet 17', icon: Sparkles },
                { id: 'aqiqah', label: 'Aqiqah / Tasyakuran', icon: Calendar },
                { id: 'corporate', label: 'Acara Korporat', icon: Sliders },
                { id: 'graduation', label: 'Wisuda & Kelulusan', icon: Eye },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id as EventCategory)}
                    className={`p-5 rounded-2xl border text-center space-y-3 transition-all ${
                      isSelected
                        ? 'border-[#1F2421] bg-[#1F2421] text-white shadow-md'
                        : 'border-[#E8E3DA] bg-white text-[#1F2421] hover:border-[#C5A880]'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto ${isSelected ? 'text-[#C5A880]' : 'text-[#7A807C]'}`} />
                    <span className="text-xs font-semibold block">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E8E3DA]">
              <Button variant="gold" onClick={() => setCurrentStep(2)}>
                Lanjut ke Pilih Template
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Template */}
        {currentStep === 2 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 2</span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Pilih Template Desain</h2>
              <p className="text-xs text-[#636965]">Desain awal dapat Anda sesuaikan warna dan tipografinya di langkah selanjutnya.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {INITIAL_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'border-[#1F2421] ring-2 ring-[#C5A880] shadow-md'
                      : 'border-[#E8E3DA] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="h-44 relative bg-gray-100">
                    <img src={tpl.preview_image_url} alt={tpl.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      {tpl.is_premium ? (
                        <Badge variant="gold" className="text-[9px]">Premium</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px]">Gratis</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <h4 className="font-semibold text-xs text-[#1F2421]">{tpl.name}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E8E3DA]">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Kembali</Button>
              <Button variant="gold" onClick={() => setCurrentStep(3)}>
                Lanjut ke Informasi Acara
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Event Information */}
        {currentStep === 3 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 3</span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Informasi Pasangan & Acara</h2>
              <p className="text-xs text-[#636965]">Lengkapi nama pengantin, orang tua, dan jadwal acara resmi.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Judul Undangan</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Nama Mempelai Wanita</label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Orang Tua Mempelai Wanita</label>
                  <input
                    type="text"
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Nama Mempelai Pria</label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Orang Tua Mempelai Pria</label>
                  <input
                    type="text"
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Tanggal Acara Utama</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Nama Tempat / Ballroom</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Link Google Maps</label>
                  <input
                    type="text"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E8E3DA]">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Kembali</Button>
              <Button variant="gold" onClick={() => setCurrentStep(4)}>
                Lanjut ke Upload Media
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Media Studio (Photos, MP4 Video & MP3 Audio) */}
        {currentStep === 4 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            {/* Background Audio Player for in-editor preview */}
            <audio
              ref={audioPreviewRef}
              src={bgMusicUrl}
              loop
              onEnded={() => setIsPlayingAudioPreview(false)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E3DA] pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 4</span>
                <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                  Studio Media & Kreasi Bebas
                </h2>
                <p className="text-xs text-[#636965]">
                  Unggah foto resolusi tinggi (JPG, PNG), video teaser prewedding (MP4), dan musik latar (MP3).
                </p>
              </div>

              {/* Premium Creative Freedom Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F2421] text-[#C5A880] text-[11px] font-semibold border border-[#C5A880]/30 shadow-sm self-start sm:self-auto">
                <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Fitur Berbayar / Premium Aktif</span>
              </div>
            </div>

            {/* Media Studio Sub-tabs Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E8E3DA]">
              {[
                { id: 'cover', label: 'Foto Sampul (Cover)', icon: ImageIcon },
                { id: 'couple', label: 'Foto Mempelai', icon: Heart },
                { id: 'video', label: 'Video Prewedding (MP4)', icon: Film, premium: true },
                { id: 'gallery', label: 'Galeri Foto (Multi)', icon: Sliders, premium: true },
                { id: 'audio', label: 'Musik Latar (MP3)', icon: Music, premium: true },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = mediaTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMediaTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#1F2421] text-white shadow-sm'
                        : 'bg-[#FAF8F5] text-[#555C57] hover:bg-[#F3EFE6] border border-[#E8E3DA]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A880]' : 'text-[#7A807C]'}`} />
                    <span>{tab.label}</span>
                    {tab.premium && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-[#C5A880] text-[#1F2421]' : 'text-[#C5A880]'}`}>
                        ★
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: FOTO SAMPUL (COVER) */}
            {mediaTab === 'cover' && (
              <div className="space-y-5 animate-in fade-in-50">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Image Preview Box */}
                  <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden border-2 border-[#E8E3DA] bg-black/5 relative group shadow-md flex-shrink-0">
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                      <span className="text-[11px] text-white font-medium">Foto Sampul Utama</span>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-4 text-xs w-full">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#1F2421] flex items-center justify-between">
                        <span>Pilih File Foto dari Perangkat (JPG, PNG, WebP)</span>
                        <span className="text-[10px] text-[#7A807C]">Maks. 10MB</span>
                      </label>
                      <div className="p-4 rounded-xl border-2 border-dashed border-[#C5A880]/60 bg-[#FAF8F5] text-center space-y-2 hover:bg-[#F5F1E8] transition-colors">
                        <Upload className="w-6 h-6 text-[#C5A880] mx-auto" />
                        <div>
                          <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl bg-[#1F2421] text-white font-semibold text-xs hover:bg-[#333C38] transition-all shadow-sm">
                            <span>Jelajahi File Foto</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => setCoverImageUrl(url))}
                            />
                          </label>
                          <p className="text-[11px] text-[#7A807C] mt-1.5">
                            Mendukung JPG, PNG, atau WebP resolusi tinggi.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#1F2421]">Atau Masukkan Tautan / URL Gambar Langsung</label>
                      <input
                        type="text"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA] text-xs bg-white"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-[#7A807C] block mb-1.5">Gunakan Contoh Preset:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Pantai Sunset', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200' },
                          { name: 'Ballroom Mewah', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200' },
                          { name: 'Taman Botanikal', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200' },
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCoverImageUrl(p.url)}
                            className="px-2.5 py-1 rounded-lg border border-[#E8E3DA] bg-white hover:bg-[#F3EFE6] text-[10px] text-[#1F2421]"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: FOTO MEMPELAI (BRIDE & GROOM PORTRAITS) */}
            {mediaTab === 'couple' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in-50 text-xs">
                {/* Mempelai Wanita */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] space-y-4 text-center">
                  <span className="font-bold text-[#9A7B4F] uppercase tracking-wider block text-[11px]">
                    Foto Mempelai Wanita
                  </span>
                  <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/50 shadow-md">
                    <img
                      src={bridePhotoUrl}
                      alt="Bride"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-xl bg-[#1F2421] text-white font-semibold text-xs hover:bg-[#333C38] transition-all">
                      <Upload className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                      <span>Upload Foto Wanita</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setBridePhotoUrl(url))}
                      />
                    </label>
                    <input
                      type="text"
                      value={bridePhotoUrl}
                      onChange={(e) => setBridePhotoUrl(e.target.value)}
                      placeholder="Atau URL foto..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E3DA] text-[11px] bg-white"
                    />
                  </div>
                </div>

                {/* Mempelai Pria */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] space-y-4 text-center">
                  <span className="font-bold text-[#9A7B4F] uppercase tracking-wider block text-[11px]">
                    Foto Mempelai Pria
                  </span>
                  <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/50 shadow-md">
                    <img
                      src={groomPhotoUrl}
                      alt="Groom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-xl bg-[#1F2421] text-white font-semibold text-xs hover:bg-[#333C38] transition-all">
                      <Upload className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                      <span>Upload Foto Pria</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setGroomPhotoUrl(url))}
                      />
                    </label>
                    <input
                      type="text"
                      value={groomPhotoUrl}
                      onChange={(e) => setGroomPhotoUrl(e.target.value)}
                      placeholder="Atau URL foto..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E3DA] text-[11px] bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: VIDEO PREWEDDING / HIGHLIGHT (MP4 / YOUTUBE) */}
            {mediaTab === 'video' && (
              <div className="space-y-5 animate-in fade-in-50 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1F2421] text-sm block">Sertakan Video Prewedding / Teaser di Undangan</span>
                    <p className="text-[11px] text-[#7A807C]">Menampilkan cuplikan video romantis beresolusi tinggi dengan pemutar interaktif.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableVideo}
                    onChange={(e) => setEnableVideo(e.target.checked)}
                    className="w-5 h-5 text-[#C5A880] rounded cursor-pointer"
                  />
                </div>

                {enableVideo && (
                  <div className="space-y-4 p-5 rounded-2xl border border-[#C5A880]/30 bg-white shadow-sm">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1F2421]">Judul Video Teaser</label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="cth: Kisah Bahagia & Prewedding Kami"
                        className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA] text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Upload MP4 File */}
                      <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] text-center space-y-2">
                        <Video className="w-6 h-6 text-[#C5A880] mx-auto" />
                        <span className="font-semibold text-[#1F2421] block">Unggah Video MP4 dari HP / Laptop</span>
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl bg-[#1F2421] text-white font-semibold text-xs hover:bg-[#333C38] transition-all">
                          <Upload className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                          <span>Pilih File Video MP4</span>
                          <input
                            type="file"
                            accept="video/mp4, video/webm, video/quicktime"
                            className="hidden"
                            onChange={handleVideoUpload}
                          />
                        </label>
                      </div>

                      {/* YouTube / Direct Link */}
                      <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-2">
                        <Film className="w-6 h-6 text-[#C5A880] mx-auto" />
                        <span className="font-semibold text-[#1F2421] block text-center">Atau Tautan YouTube / URL MP4</span>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... atau link .mp4"
                          className="w-full px-2.5 py-2 rounded-lg border border-[#E8E3DA] text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* Live Video Preview Box */}
                    {videoUrl && (
                      <div className="space-y-1.5 pt-2">
                        <span className="font-semibold text-[#1F2421] block">Pratinjau Video Teaser Langsung:</span>
                        <div className="rounded-2xl overflow-hidden border border-[#1F2421] bg-black max-h-64 shadow-md">
                          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                            <div className="aspect-video w-full">
                              <iframe
                                src={videoUrl.replace('watch?v=', 'embed/')}
                                title="Preview Video"
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <video
                              src={videoUrl}
                              controls
                              className="w-full max-h-60 object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: GALERI FOTO PREWEDDING (MULTI-UPLOAD) */}
            {mediaTab === 'gallery' && (
              <div className="space-y-4 animate-in fade-in-50 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA]">
                  <div>
                    <span className="font-bold text-[#1F2421] text-sm block">Galeri Foto Prewedding (Banyak Foto Sekaligus)</span>
                    <p className="text-[11px] text-[#7A807C]">Unggah beberapa foto JPG/PNG untuk ditampilkan di album foto undangan.</p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl bg-[#1F2421] text-white font-semibold text-xs hover:bg-[#333C38] transition-all shadow-sm flex-shrink-0">
                    <Plus className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                    <span>+ Unggah Banyak Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                </div>

                {/* Add Photo by URL form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Atau tambahkan tautan URL foto gambar..."
                    className="flex-1 px-3 py-2 rounded-lg border border-[#E8E3DA] text-xs bg-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newGalleryUrl.trim()) {
                        setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
                        setNewGalleryUrl('');
                      }
                    }}
                    className="text-xs"
                  >
                    Tambah Foto
                  </Button>
                </div>

                {/* Interactive Gallery Thumbnail Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#7A807C]">
                    <span>Daftar Foto Galeri ({galleryImages.length} Foto Tersimpan):</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-[#E8E3DA] h-28 group bg-black/5 shadow-sm">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: MUSIK LATAR (MP3 AUDIO) */}
            {mediaTab === 'audio' && (
              <div className="space-y-5 animate-in fade-in-50 text-xs">
                {/* Active Audio Player Status Card */}
                <div className="p-4 rounded-2xl bg-[#1F2421] text-white border border-[#C5A880]/40 flex items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleAudioPreview}
                      className="w-10 h-10 rounded-full bg-[#C5A880] text-[#1F2421] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
                      title={isPlayingAudioPreview ? 'Jeda Lagu' : 'Putar Lagu'}
                    >
                      {isPlayingAudioPreview ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880]">
                        Musik Latar Terpilih {isPlayingAudioPreview && '(Sedang Diputar 🎵)'}
                      </span>
                      <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                        {bgMusicTitle}
                      </h4>
                    </div>
                  </div>

                  <Badge variant="gold" className="text-[10px] hidden sm:block">
                    MP3 Audio
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload MP3 File */}
                  <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] text-center space-y-2">
                    <FileAudio className="w-6 h-6 text-[#C5A880] mx-auto" />
                    <span className="font-semibold text-[#1F2421] block">Unggah File MP3 Sendiri</span>
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl bg-[#1F2421] text-white font-semibold text-xs hover:bg-[#333C38] transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                      <span>Pilih File MP3 / Audio</span>
                      <input
                        type="file"
                        accept="audio/mp3, audio/mpeg, audio/wav, audio/m4a"
                        className="hidden"
                        onChange={handleAudioUpload}
                      />
                    </label>
                  </div>

                  {/* Input Custom Audio URL */}
                  <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-2">
                    <Music className="w-6 h-6 text-[#C5A880] mx-auto" />
                    <span className="font-semibold text-[#1F2421] block text-center">Atau Masukkan Tautan / URL MP3</span>
                    <input
                      type="text"
                      value={bgMusicUrl}
                      onChange={(e) => {
                        setBgMusicUrl(e.target.value);
                        setBgMusicTitle('Audio Kustom (URL)');
                      }}
                      placeholder="https://assets.mixkit.co/music/..."
                      className="w-full px-2.5 py-2 rounded-lg border border-[#E8E3DA] text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Preset Songs List */}
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-[#1F2421] block">Atau Pilih dari Koleksi Lagu Romantis Pilihan:</span>
                  <div className="space-y-1.5">
                    {AUDIO_PRESETS.map((song, idx) => {
                      const isSelected = bgMusicUrl === song.url;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setBgMusicUrl(song.url);
                            setBgMusicTitle(song.title);
                            if (audioPreviewRef.current) {
                              audioPreviewRef.current.src = song.url;
                              audioPreviewRef.current.play().then(() => setIsPlayingAudioPreview(true)).catch(console.error);
                            }
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#1F2421] text-white border-[#1F2421]'
                              : 'bg-white text-[#1F2421] border-[#E8E3DA] hover:border-[#C5A880]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Music className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#C5A880]' : 'text-gray-400'}`} />
                            <div className="truncate">
                              <span className="font-semibold text-xs block truncate">{song.title}</span>
                              <span className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-[#7A807C]'}`}>
                                {song.category}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[11px] font-semibold flex-shrink-0 ${isSelected ? 'text-[#C5A880]' : 'text-gray-400'}`}>
                            {isSelected ? '✓ Terpilih' : 'Pilih & Putar'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-[#E8E3DA]">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Kembali</Button>
              <Button variant="gold" onClick={() => setCurrentStep(5)}>
                Lanjut ke Gaya & Tampilan
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Customize Appearance */}
        {currentStep === 5 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 5</span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Kustomisasi Warna & Tipografi</h2>
              <p className="text-xs text-[#636965]">Pilih palet warna premium dan jenis huruf yang selaras.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Warna Dominan Teks</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-10 p-1 rounded-lg border border-[#E8E3DA]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Warna Aksen Emas / Champagne</label>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full h-10 p-1 rounded-lg border border-[#E8E3DA]"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E8E3DA]">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>Kembali</Button>
              <Button variant="gold" onClick={() => setCurrentStep(6)}>
                Lanjut ke Konfigurasi Seksi
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Sections Configuration */}
        {currentStep === 6 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 6</span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Pengaturan Fitur & Seksi</h2>
              <p className="text-xs text-[#636965]">Aktifkan atau nonaktifkan fitur interaktif yang Anda butuhkan.</p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Formulir Konfirmasi RSVP Tamu', state: enableRsvp, setter: setEnableRsvp },
                { label: 'Buku Tamu & Ucapan Doa Publik', state: enableWishes, setter: setEnableWishes },
                { label: 'Amplop Digital / Transfer Rekening Hadiah', state: enableGift, setter: setEnableGift },
                { label: 'Hitung Mundur Acara (Countdown Timer)', state: enableCountdown, setter: setEnableCountdown },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] cursor-pointer">
                  <span className="font-medium text-[#1F2421]">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="w-4 h-4 text-[#C5A880] rounded"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E8E3DA]">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>Kembali</Button>
              <Button variant="gold" onClick={() => setCurrentStep(7)}>
                Lihat Pratinjau (Preview)
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Live Preview */}
        {currentStep === 7 && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Langkah 7</span>
                <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Pratinjau Hasil Undangan</h2>
              </div>

              {/* Device switcher */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E8E3DA]">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 text-xs rounded flex items-center gap-1 ${
                    previewDevice === 'mobile' ? 'bg-[#1F2421] text-white' : 'text-[#7A807C]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 text-xs rounded flex items-center gap-1 ${
                    previewDevice === 'desktop' ? 'bg-[#1F2421] text-white' : 'text-[#7A807C]'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            {/* Render Preview Frame */}
            <div className="flex justify-center p-4 bg-[#F3EFE6] rounded-2xl">
              <div className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-[#E8E3DA] ${
                previewDevice === 'mobile' ? 'w-[360px] h-[580px]' : 'w-full max-w-2xl h-[580px]'
              } overflow-y-auto p-6 text-center space-y-6 scrollbar-thin`}>
                
                {/* Floating Music Indicator */}
                {bgMusicUrl && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F2421] text-[#C5A880] text-[11px] shadow-sm">
                    <Music className="w-3 h-3 animate-spin" />
                    <span>Latar Musik: {bgMusicTitle}</span>
                  </div>
                )}

                {/* Hero / Cover */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#9A7B4F]">
                    The Wedding of
                  </span>
                  <h3 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                    {brideName.split(',')[0]} & {groomName.split(',')[0]}
                  </h3>
                  <p className="text-xs text-[#7A807C]">{eventDate}</p>
                </div>

                <div className="h-44 rounded-xl overflow-hidden border border-[#E8E3DA] shadow-sm">
                  <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>

                {/* Mempelai Portraits */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#9A7B4F]">
                    Mempelai Bahagia
                  </span>
                  <div className="flex justify-center items-center gap-6">
                    <div className="text-center space-y-1">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-[#C5A880] shadow-sm">
                        <img src={bridePhotoUrl} alt="Mempelai Wanita" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-[#1F2421]">{brideName.split(',')[0]}</p>
                    </div>

                    <div className="font-serif-luxury text-xl font-bold text-[#C5A880]">&</div>

                    <div className="text-center space-y-1">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-[#C5A880] shadow-sm">
                        <img src={groomPhotoUrl} alt="Mempelai Pria" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-[#1F2421]">{groomName.split(',')[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Venue Card */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-xs space-y-1">
                  <p className="font-semibold text-[#1F2421]">{venueName}</p>
                  <p className="text-[11px] text-[#7A807C]">{venueAddress}</p>
                </div>

                {/* Video Teaser Preview if enabled */}
                {enableVideo && videoUrl && (
                  <div className="p-3 rounded-xl bg-[#1F2421] text-white text-xs space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-[#C5A880] font-semibold text-[11px]">
                      <Film className="w-3.5 h-3.5" />
                      <span>{videoTitle || 'Video Prewedding'}</span>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/10">
                      {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={
                            videoUrl.includes('watch?v=')
                              ? videoUrl.replace('watch?v=', 'embed/')
                              : videoUrl.includes('youtu.be/')
                              ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                              : videoUrl
                          }
                          title={videoTitle}
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <video src={videoUrl} controls className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                )}

                {/* Gallery Preview */}
                {galleryImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#1F2421] text-left">Galeri Foto Prewedding ({galleryImages.length})</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {galleryImages.slice(0, 6).map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[#E8E3DA]">
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E8E3DA]">
              <Button variant="outline" onClick={() => setCurrentStep(6)}>Kembali</Button>
              <Button variant="gold" onClick={handlePublish} isLoading={isPublishing}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Terbitkan Undangan Sekarang
              </Button>
            </div>
          </div>
        )}

        {/* Step 8: Success & Share Link */}
        {currentStep === 8 && publishedSlug && (
          <div className="luxury-card rounded-2xl p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                Undangan Anda Telah Diterbitkan!
              </h2>
              <p className="text-sm text-[#555C57] max-w-md mx-auto">
                Website undangan digital Anda kini sudah aktif dan siap disebarkan kepada keluarga dan tamu undangan tercinta.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] max-w-md mx-auto space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A807C]">Tautan Publik Anda:</span>
              <p className="font-mono text-sm font-bold text-[#9A7B4F]">
                /i/{publishedSlug}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Link href={`/i/${publishedSlug}`} target="_blank">
                <Button variant="gold" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Buka Undangan Publik
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
