'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Save, 
  Eye, 
  CheckCircle,
  Sliders,
  Layers,
  Calendar,
  Heart,
  Palette,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataStore, INITIAL_INVITATIONS } from '@/lib/data-store';
import { formatDateWITA } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

function EditExistingInvitationContent() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const invitationId = (params?.invitationId as string) || 'inv_andi_siti';

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
              Silakan masuk ke akun Rynora Anda untuk mengedit undangan digital ini.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href={`/login?redirectTo=/editor/${invitationId}`}
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

  const invitation = dataStore.getInvitationById(invitationId) || INITIAL_INVITATIONS[0];

  const [step, setStep] = useState<'info' | 'media' | 'settings'>('info');
  const [title, setTitle] = useState(invitation.title);
  const [brideName, setBrideName] = useState(invitation.event_data.bride_name || '');
  const [groomName, setGroomName] = useState(invitation.event_data.groom_name || '');
  const [eventDate, setEventDate] = useState(invitation.event_data.event_date);
  
  // Media State
  const [coverImageUrl, setCoverImageUrl] = useState(invitation.event_data.cover_image_url || '');
  const [bridePhotoUrl, setBridePhotoUrl] = useState(invitation.event_data.bride_photo_url || '');
  const [groomPhotoUrl, setGroomPhotoUrl] = useState(invitation.event_data.groom_photo_url || '');
  const [enableVideo, setEnableVideo] = useState(invitation.event_data.enable_video ?? true);
  const [videoUrl, setVideoUrl] = useState(invitation.event_data.video_url || '');
  const [videoTitle, setVideoTitle] = useState(invitation.event_data.video_title || 'Video Prewedding');
  const [bgMusicUrl, setBgMusicUrl] = useState(invitation.theme_configuration.background_music_url || '');
  const [bgMusicTitle, setBgMusicTitle] = useState(invitation.theme_configuration.background_music_title || 'Audio Musik');
  const [isSaved, setIsSaved] = useState(false);

  // File Upload Handlers
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setter(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setVideoUrl(ev.target.result);
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
        setEnableVideo(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setBgMusicUrl(ev.target.result);
        setBgMusicTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    dataStore.saveInvitation({
      ...invitation,
      title,
      event_data: {
        ...invitation.event_data,
        event_title: title,
        bride_name: brideName,
        groom_name: groomName,
        event_date: eventDate,
        cover_image_url: coverImageUrl,
        bride_photo_url: bridePhotoUrl,
        groom_photo_url: groomPhotoUrl,
        enable_video: enableVideo,
        video_url: enableVideo ? videoUrl : undefined,
        video_title: videoTitle,
      },
      theme_configuration: {
        ...invitation.theme_configuration,
        background_music_url: bgMusicUrl,
        background_music_title: bgMusicTitle,
      },
      updated_at: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col">
      <header className="h-16 bg-[#1F2421] text-[#FCFBF7] px-6 flex items-center justify-between border-b border-[#E8E3DA]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/20" />
          <span className="font-serif-luxury font-bold text-sm">
            Edit Undangan: {invitation.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/editor/${invitation.id}/visual`}>
            <Button variant="outline" size="sm" className="text-xs bg-transparent text-white border-white/20 hover:bg-white/10">
              <Layers className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
              Buka Visual Editor
            </Button>
          </Link>
          <Button variant="gold" size="sm" onClick={handleSave} className="text-xs">
            <Save className="w-3.5 h-3.5 mr-1" />
            {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E3DA] pb-2">
          <button
            onClick={() => setStep('info')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              step === 'info'
                ? 'bg-[#1F2421] text-white shadow-sm'
                : 'bg-white text-[#555C57] border border-[#E8E3DA]'
            }`}
          >
            Informasi Acara
          </button>
          <button
            onClick={() => setStep('media')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              step === 'media'
                ? 'bg-[#1F2421] text-white shadow-sm'
                : 'bg-white text-[#555C57] border border-[#E8E3DA]'
            }`}
          >
            <span>Media (Foto, Video MP4, Audio MP3)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-[#C5A880] text-[#1F2421] font-bold">PRO</span>
          </button>
        </div>

        {/* TAB 1: INFO ACARA */}
        {step === 'info' && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Formulir Edit</span>
                <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">Informasi Inti Acara</h2>
              </div>
              <Link href={`/i/${invitation.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Lihat Halaman Publik
                </Button>
              </Link>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Judul Undangan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Nama Mempelai Wanita</label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2421]">Nama Mempelai Pria</label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] bg-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2421]">Tanggal Acara (Asia/Makassar)</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] bg-white text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E3DA] flex justify-between items-center">
              <span className="text-[11px] text-[#7A807C]">Status Publikasi: {invitation.status}</span>
              <Button variant="gold" size="sm" onClick={handleSave}>
                Simpan & Perbarui Undangan
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA (FOTO, VIDEO MP4, MUSIK MP3) */}
        {step === 'media' && (
          <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E8E3DA] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Studio Media</span>
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                Foto, Video (MP4) & Musik (MP3)
              </h2>
              <p className="text-xs text-[#636965]">
                Unggah file multimedia dari perangkat Anda atau masukkan URL tautan langsung.
              </p>
            </div>

            {/* 1. Cover Photo */}
            <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#1F2421]">Foto Cover Utama (JPG, PNG)</label>
                <label className="cursor-pointer text-xs font-bold text-[#9A7B4F] hover:underline">
                  Unggah File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageFile(e, setCoverImageUrl)}
                  />
                </label>
              </div>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA] bg-white text-xs"
              />
              {coverImageUrl && (
                <div className="h-32 rounded-lg overflow-hidden border border-[#E8E3DA]">
                  <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* 2. Bride & Groom Portraits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs text-[#1F2421]">Foto Mempelai Wanita</label>
                  <label className="cursor-pointer text-[11px] font-bold text-[#9A7B4F] hover:underline">
                    Unggah
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, setBridePhotoUrl)}
                    />
                  </label>
                </div>
                {bridePhotoUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C5A880] mx-auto">
                    <img src={bridePhotoUrl} alt="Bride" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="text"
                  value={bridePhotoUrl}
                  onChange={(e) => setBridePhotoUrl(e.target.value)}
                  placeholder="URL Foto..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E3DA] bg-white text-xs"
                />
              </div>

              <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs text-[#1F2421]">Foto Mempelai Pria</label>
                  <label className="cursor-pointer text-[11px] font-bold text-[#9A7B4F] hover:underline">
                    Unggah
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFile(e, setGroomPhotoUrl)}
                    />
                  </label>
                </div>
                {groomPhotoUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C5A880] mx-auto">
                    <img src={groomPhotoUrl} alt="Groom" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="text"
                  value={groomPhotoUrl}
                  onChange={(e) => setGroomPhotoUrl(e.target.value)}
                  placeholder="URL Foto..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E3DA] bg-white text-xs"
                />
              </div>
            </div>

            {/* 3. Video Prewedding (MP4 / YouTube) */}
            <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-semibold text-xs text-[#1F2421]">Video Teaser Prewedding (MP4 / YouTube)</label>
                  <p className="text-[11px] text-[#7A807C]">Unggah file MP4 langsung atau masukkan tautan YouTube</p>
                </div>
                <label className="cursor-pointer text-xs font-bold text-[#9A7B4F] hover:underline">
                  Unggah MP4
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    className="hidden"
                    onChange={handleVideoFile}
                  />
                </label>
              </div>

              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... atau file MP4"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA] bg-white text-xs"
              />

              {videoUrl && (
                <div className="aspect-video rounded-xl overflow-hidden bg-black max-w-md mx-auto">
                  {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={
                        videoUrl.includes('watch?v=')
                          ? videoUrl.replace('watch?v=', 'embed/')
                          : videoUrl.includes('youtu.be/')
                          ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                          : videoUrl
                      }
                      title="Preview Video"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                  )}
                </div>
              )}
            </div>

            {/* 4. Audio Musik Latar (MP3) */}
            <div className="p-4 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-semibold text-xs text-[#1F2421]">Musik Latar Undangan (MP3)</label>
                  <p className="text-[11px] text-[#7A807C]">Unggah file lagu MP3 romantis pilihan Anda</p>
                </div>
                <label className="cursor-pointer text-xs font-bold text-[#9A7B4F] hover:underline">
                  Unggah MP3
                  <input
                    type="file"
                    accept="audio/mp3,audio/*"
                    className="hidden"
                    onChange={handleAudioFile}
                  />
                </label>
              </div>

              <input
                type="text"
                value={bgMusicUrl}
                onChange={(e) => setBgMusicUrl(e.target.value)}
                placeholder="URL MP3..."
                className="w-full px-3 py-2 rounded-lg border border-[#E8E3DA] bg-white text-xs"
              />

              {bgMusicUrl && (
                <div className="p-3 rounded-lg bg-white border border-[#E8E3DA] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1F2421] truncate">{bgMusicTitle}</span>
                  <audio src={bgMusicUrl} controls className="h-8 max-w-[200px]" />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#E8E3DA] flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setStep('info')}>
                Kembali ke Info Acara
              </Button>
              <Button variant="gold" size="sm" onClick={handleSave}>
                Simpan & Perbarui Undangan
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EditExistingInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 text-xs text-[#7A807C]">Memuat editor...</div>}>
      <EditExistingInvitationContent />
    </Suspense>
  );
}
