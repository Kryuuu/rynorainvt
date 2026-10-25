'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Music, 
  Volume2, 
  VolumeX, 
  Gift, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Users,
  ChevronDown,
  QrCode,
  Download,
  Maximize2,
  Ticket,
  CheckCircle2,
  Camera,
  Film,
  Play
} from 'lucide-react';
import QRCode from 'qrcode';
import { dataStore } from '@/lib/data-store';
import { Guest } from '@/types';
import { formatDateWITA, formatTimeWITA } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function PublicInvitationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  // Guest personalized token or name from query params (?to=Nama+Tamu or ?u=token)
  const guestParam = searchParams.get('to') || 'Tamu Undangan';
  const guestToken = searchParams.get('u');

  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // QR Pass & Guest Data
  const [guestRecord, setGuestRecord] = useState<Guest | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showFullscreenQr, setShowFullscreenQr] = useState(false);

  // RSVP Form State
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | 'uncertain'>('attending');
  const [rsvpName, setRsvpName] = useState(guestParam !== 'Tamu Undangan' ? guestParam : '');
  const [rsvpPax, setRsvpPax] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  // Wishes List
  const [wishes, setWishes] = useState(dataStore.getWishesByInvitation('inv_andi_siti'));

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const invitation = dataStore.getInvitationBySlug(slug) || dataStore.getInvitationById('inv_andi_siti');

  useEffect(() => {
    if (!invitation) return;

    // Look up guest record by token (?u=...) or by name (?to=...)
    let g: Guest | undefined;
    if (guestToken) {
      g = dataStore.getGuestByInvitationToken(guestToken, invitation.id);
    }
    if (!g && guestParam && guestParam !== 'Tamu Undangan') {
      g = dataStore.getGuestByName(guestParam, invitation.id);
    }

    if (g) {
      setGuestRecord(g);
      if (g.name && guestParam === 'Tamu Undangan') {
        setRsvpName(g.name);
      }
    }

    // Generate real QR code image data URL
    const tokenToEncode = g?.qr_code_token || (guestToken || `qr_${invitation.id}_${encodeURIComponent(guestParam)}`);
    QRCode.toDataURL(tokenToEncode, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1F2421',
        light: '#FFFFFF',
      },
    }).then((url) => {
      setQrDataUrl(url);
    }).catch((err) => {
      console.error('Failed to generate QR code:', err);
    });
  }, [invitation, guestToken, guestParam]);

  useEffect(() => {
    if (!invitation) return;

    // Calculate countdown
    const targetDate = new Date(invitation.event_data.event_date || '2026-12-15T08:00:00+08:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invitation]);

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-6 text-center">
        <div className="space-y-3">
          <h1 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">Undangan Tidak Ditemukan</h1>
          <p className="text-sm text-[#7A807C]">Tautan ini mungkin salah atau undangan belum dipublikasikan oleh pemiliknya.</p>
        </div>
      </div>
    );
  }

  const { event_data, theme_configuration } = invitation;

  const handleOpenInvitation = () => {
    setIsOpen(true);
    // Play background audio on user interaction
    if (audioRef.current && theme_configuration.background_music_url) {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(console.error);
    }
  };

  const handleCopyAccount = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2500);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    setIsSubmittingRsvp(true);
    setTimeout(() => {
      // Record RSVP
      dataStore.submitRsvp(invitation.id, {
        guest_name: rsvpName,
        attendance_status: rsvpStatus,
        attendee_count: rsvpPax,
        message: rsvpMessage,
      });

      // Also record to Wishes if message exists
      if (rsvpMessage.trim()) {
        const newWish = dataStore.submitWish(invitation.id, rsvpName, rsvpMessage);
        setWishes([newWish, ...wishes]);
      }

      setIsSubmittingRsvp(false);
      setRsvpSubmitted(true);
    }, 600);
  };

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden"
      style={{
        backgroundColor: theme_configuration.background_color || '#FCFBF7',
        color: theme_configuration.text_primary || '#1F2421',
      }}
    >
      {/* Background Audio Element */}
      {theme_configuration.background_music_url && (
        <audio
          ref={audioRef}
          src={theme_configuration.background_music_url}
          loop
          preload="auto"
        />
      )}

      {/* Floating Music Button */}
      {isOpen && theme_configuration.background_music_url && (
        <button
          onClick={toggleAudio}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1F2421]/90 text-[#FCFBF7] border border-[#C5A880]/50 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title={isPlayingAudio ? 'Jeda Musik' : 'Putar Musik'}
          aria-label="Toggle Music"
        >
          {isPlayingAudio ? (
            <Volume2 className="w-5 h-5 text-[#C5A880] animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>
      )}

      {/* Floating QR Pass Button (Bottom Left) */}
      {isOpen && (
        <button
          onClick={() => setShowFullscreenQr(true)}
          className="fixed bottom-6 left-6 z-40 px-3.5 py-2.5 rounded-full bg-[#1F2421]/90 text-[#FCFBF7] border border-[#C5A880]/50 shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs font-semibold backdrop-blur-sm"
          title="Buka QR Presensi Masuk"
          aria-label="Open QR Ticket"
        >
          <QrCode className="w-4 h-4 text-[#C5A880]" />
          <span>QR Presensi</span>
          {guestRecord?.checked_in_at && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sudah Hadir" />
          )}
        </button>
      )}

      {/* ==================================================================== */}
      {/* OPENING COVER MODAL (INTERACTIVE ENVELOPE) */}
      {/* ==================================================================== */}
      {!isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2421]/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FCFBF7] border border-[#E8E3DA] p-8 sm:p-10 text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-500">
            {/* Top gold badge */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7B4F]">
                The Wedding of
              </span>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F2421]">
                {event_data.bride_nickname || 'Siti'} & {event_data.groom_nickname || 'Andi'}
              </h1>
            </div>

            {/* Cover photo preview */}
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/40 shadow-lg">
              <img
                src={event_data.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Guest greeting */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-[#F6F3EE] border border-[#E9E3D8]">
              <p className="text-xs text-[#7A807C]">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
              <p className="font-serif-luxury text-lg font-bold text-[#1F2421]">
                {guestRecord?.name || guestParam}
              </p>
              {guestRecord && (
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <Badge variant="gold" className="text-[10px]">
                    {guestRecord.category || 'Tamu Undangan'}
                  </Badge>
                  <span className="text-[11px] text-[#7A807C]">Maks. {guestRecord.pax_limit} Pax</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9A7B4F] pt-1 font-medium">
                <Ticket className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Tiket & QR Presensi Tersedia</span>
              </div>
              <p className="text-[10px] text-[#8C938E]">
                Mohon maaf bila ada kesalahan penulisan nama & gelar
              </p>
            </div>

            {/* Open Invitation CTA */}
            <Button
              variant="gold"
              size="lg"
              onClick={handleOpenInvitation}
              className="w-full shadow-lg text-sm uppercase tracking-wider font-semibold py-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Buka Undangan
            </Button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MAIN INVITATION CONTENT CONTAINER (MOBILE CENTERED LUXURY) */}
      {/* ==================================================================== */}
      <div className="max-w-2xl mx-auto min-h-screen bg-white/60 shadow-xl border-x border-[#E8E3DA]">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-between p-8 text-center border-b border-[#E8E3DA] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={event_data.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'}
              alt="Hero Cover"
              className="w-full h-full object-cover opacity-20 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/70" />
          </div>

          <div className="relative z-10 pt-12 space-y-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#9A7B4F]">
              The Wedding Celebration
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-6xl font-bold tracking-tight text-[#1F2421]">
              {event_data.bride_nickname || 'Siti'} <span className="font-normal italic text-[#C5A880]">&</span> {event_data.groom_nickname || 'Andi'}
            </h1>
            <p className="text-sm font-medium text-[#555C57]">
              {formatDateWITA(event_data.event_date)}
            </p>
          </div>

          {/* Countdown timer */}
          <div className="relative z-10 py-8 w-full max-w-md">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Hari', val: timeLeft.days },
                { label: 'Jam', val: timeLeft.hours },
                { label: 'Menit', val: timeLeft.minutes },
                { label: 'Detik', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/90 border border-[#E8E3DA] shadow-sm text-center">
                  <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#9A7B4F] mt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pb-4 animate-bounce text-[#C5A880]">
            <ChevronDown className="w-6 h-6 mx-auto opacity-70" />
          </div>
        </section>

        {/* BRIDE & GROOM PROFILE */}
        <section className="py-16 px-6 sm:px-12 text-center space-y-12 border-b border-[#E8E3DA]">
          <div className="space-y-3 max-w-lg mx-auto">
            <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">
              Assalamu’alaikum Warahmatullahi Wabarakatuh
            </span>
            <p className="text-sm text-[#555C57] leading-relaxed">
              {event_data.event_description || 'Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami mengundang kehadiran Bapak/Ibu/Saudara/i untuk menyaksikan akad dan merayakan pernikahan kami:'}
            </p>
          </div>

          <div className="space-y-10">
            {/* Mempelai Wanita */}
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/50 shadow-md">
                <img
                  src={event_data.bride_photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                  alt="Bride"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
                  {event_data.bride_name || 'Siti Nurhaliza, S.E.'}
                </h3>
                <p className="text-xs text-[#7A807C] max-w-sm mx-auto">
                  {event_data.bride_parents || 'Putri pertama dari Bpk. Ir. H. Ahmad Dahlan & Ibu Hj. Marwah'}
                </p>
              </div>
            </div>

            <div className="font-serif-luxury text-3xl font-bold text-[#C5A880] italic">&</div>

            {/* Mempelai Pria */}
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#C5A880]/50 shadow-md">
                <img
                  src={event_data.groom_photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"}
                  alt="Groom"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
                  {event_data.groom_name || 'Andi Pratama, M.Kom.'}
                </h3>
                <p className="text-xs text-[#7A807C] max-w-sm mx-auto">
                  {event_data.groom_parents || 'Putra kedua dari Bpk. Drs. H. Usman Ali & Ibu Hj. Aminah'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EVENT SESSIONS & LOCATION */}
        <section className="py-16 px-6 sm:px-12 bg-[#FAF8F5] border-b border-[#E8E3DA] space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">
              Waktu & Tempat
            </span>
            <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
              Rangkaian Acara
            </h2>
          </div>

          <div className="space-y-6">
            {event_data.sessions.map((session, idx) => (
              <div
                key={session.id || idx}
                className="luxury-card rounded-2xl p-6 sm:p-8 space-y-4 border border-[#E8E3DA]"
              >
                <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                  <span className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                    {session.title}
                  </span>
                  <Badge variant="gold" className="text-xs">
                    {formatDateWITA(session.date)}
                  </Badge>
                </div>

                <div className="space-y-2.5 text-sm text-[#4E5450]">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                    <span>
                      {formatTimeWITA(session.start_time)} - {session.end_time ? `${session.end_time} WITA` : 'Selesai'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1F2421]">{session.venue_name}</p>
                      <p className="text-xs text-[#7A807C] mt-0.5">{session.venue_address}</p>
                    </div>
                  </div>
                </div>

                {session.maps_url && (
                  <div className="pt-2">
                    <a
                      href={session.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#C5A880]" />
                        Petunjuk Arah Google Maps
                        <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* PHOTO GALLERY */}
        {event_data.enable_gallery && event_data.gallery_images && event_data.gallery_images.length > 0 && (
          <section className="py-16 px-6 sm:px-12 border-b border-[#E8E3DA] space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">
                Momen Kebersamaan
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                Galeri Prewedding
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {event_data.gallery_images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden h-48 sm:h-64 border border-[#E8E3DA] shadow-sm hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={imgUrl}
                    alt={`Galeri ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PREWEDDING VIDEO SECTION (MP4 / YouTube) */}
        {event_data.enable_video && event_data.video_url && (
          <section className="py-16 px-6 sm:px-12 bg-[#FAF8F5] border-b border-[#E8E3DA] space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F2421] text-[#C5A880] text-[11px] font-semibold mb-1">
                <Film className="w-3.5 h-3.5" />
                <span>Sinematik Video Prewedding</span>
              </div>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                {event_data.video_title || 'Video Teaser Prewedding'}
              </h2>
              <p className="text-xs text-[#7A807C] max-w-md mx-auto">
                Saksikan kisah cinta dan momen terindah perjalanan kami berdua.
              </p>
            </div>

            <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video relative group">
              {event_data.video_url.includes('youtube.com') || event_data.video_url.includes('youtu.be') ? (
                <iframe
                  src={
                    event_data.video_url.includes('watch?v=')
                      ? event_data.video_url.replace('watch?v=', 'embed/')
                      : event_data.video_url.includes('youtu.be/')
                      ? event_data.video_url.replace('youtu.be/', 'youtube.com/embed/')
                      : event_data.video_url
                  }
                  title={event_data.video_title || 'Prewedding Video'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={event_data.video_url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Browser Anda tidak mendukung pemutar video MP4.
                </video>
              )}
            </div>
          </section>
        )}

        {/* RSVP FORM SECTION */}
        {event_data.enable_rsvp && (
          <section className="py-16 px-6 sm:px-12 bg-[#FAF8F5] border-b border-[#E8E3DA] space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">
                Konfirmasi Kehadiran
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                RSVP Tamu Undangan
              </h2>
              <p className="text-xs text-[#7A807C]">
                Kehadiran dan doa restu Anda merupakan kehormatan terbesar bagi kami.
              </p>
            </div>

            <div className="luxury-card rounded-2xl p-6 sm:p-8 border border-[#E8E3DA]">
              {rsvpSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                    Terima Kasih atas Konfirmasinya!
                  </h4>
                  <p className="text-xs text-[#636965]">
                    Konfirmasi kehadiran Anda telah berhasil tercatat di sistem kami.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
                      Nama Lengkap Tamu
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Masukkan nama Anda..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  {/* Attendance Choice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
                      Status Kehadiran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'attending', label: 'Hadir' },
                        { id: 'not_attending', label: 'Tidak Hadir' },
                        { id: 'uncertain', label: 'Masih Ragu' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRsvpStatus(opt.id as any)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            rsvpStatus === opt.id
                              ? 'bg-[#1F2421] text-white border-[#1F2421]'
                              : 'bg-white text-[#4E5450] border-[#E8E3DA] hover:bg-[#F3EFE6]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Attendees */}
                  {rsvpStatus === 'attending' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
                        Jumlah Pax / Orang yang Hadir
                      </label>
                      <select
                        value={rsvpPax}
                        onChange={(e) => setRsvpPax(parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                      >
                        <option value={1}>1 Orang</option>
                        <option value={2}>2 Orang</option>
                        <option value={3}>3 Orang</option>
                        <option value={4}>4 Orang</option>
                      </select>
                    </div>
                  )}

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
                      Ucapan & Doa Restu
                    </label>
                    <textarea
                      rows={3}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="Tuliskan ucapan selamat dan doa untuk kedua mempelai..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E3DA] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    className="w-full shadow-md text-sm font-semibold"
                    isLoading={isSubmittingRsvp}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Konfirmasi RSVP
                  </Button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* QR CHECK-IN PASS / TIKET PRESENSI MASUK */}
        {/* ==================================================================== */}
        <section className="py-16 px-6 sm:px-12 bg-gradient-to-b from-white to-[#FAF8F5] border-b border-[#E8E3DA] space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE6] text-[#9A7B4F] text-[10px] font-bold uppercase tracking-widest border border-[#E8DFD8]">
              <Ticket className="w-3.5 h-3.5" />
              E-Ticket & QR Presensi
            </div>
            <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
              Akses Masuk & Presensi Tamu
            </h2>
            <p className="text-xs text-[#7A807C] max-w-sm mx-auto">
              Tunjukkan QR Code ini kepada panitia meja penerima tamu di pintu masuk gedung untuk konfirmasi kehadiran Anda.
            </p>
          </div>

          {/* Luxury QR Ticket Card */}
          <div className="max-w-sm mx-auto rounded-3xl bg-white border-2 border-[#C5A880]/40 p-6 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
            {/* Background decorative gold ring */}
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#C5A880]/10 blur-xl pointer-events-none" />

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">
                Kartu Presensi Tamu Undangan
              </span>
              <h4 className="font-serif-luxury text-xl font-bold text-[#1F2421]">
                {guestRecord?.name || guestParam}
              </h4>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge variant="gold" className="text-[10px]">
                  {guestRecord?.category || 'Tamu Undangan'}
                </Badge>
                <span className="text-[11px] text-[#7A807C]">
                  Maks. {guestRecord?.pax_limit || 2} Pax
                </span>
              </div>
            </div>

            {/* Real Scannable QR Code Canvas */}
            <div className="w-52 h-52 mx-auto p-3 rounded-2xl bg-white border border-[#E8E3DA] shadow-inner flex flex-col items-center justify-center relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Presensi"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-40 h-40 text-[#1F2421]" />
              )}
              <button
                onClick={() => setShowFullscreenQr(true)}
                className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-semibold backdrop-blur-[2px]"
              >
                <Maximize2 className="w-4 h-4 text-[#C5A880]" />
                Perbesar QR
              </button>
            </div>

            {/* Check-in Status Badge */}
            {guestRecord?.checked_in_at ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sudah Hadir ({new Date(guestRecord.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA)</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-[11px] text-[#7A807C] flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Belum Check-in • Tunjukkan di pintu masuk</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullscreenQr(true)}
                className="text-xs font-medium"
              >
                <Maximize2 className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                Layar Penuh
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  if (qrDataUrl) {
                    const a = document.createElement('a');
                    a.href = qrDataUrl;
                    a.download = `QR-Presensi-${slug}-${guestRecord?.name || 'tamu'}.png`;
                    a.click();
                  }
                }}
                className="text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Unduh QR
              </Button>
            </div>
          </div>
        </section>

        {/* GUEST BOOK / WISHES FEED */}
        {event_data.enable_wishes && (
          <section className="py-16 px-6 sm:px-12 border-b border-[#E8E3DA] space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">
                Buku Tamu Digital
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                Doa & Ucapan Hangat
              </h2>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {wishes.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8E3DA] shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif-luxury text-base font-bold text-[#1F2421]">
                      {item.guest_name}
                    </span>
                    <span className="text-[10px] text-[#8C938E]">
                      {formatDateWITA(item.created_at, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#555C57] leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DIGITAL GIFT / AMPLOP DIGITAL */}
        {event_data.enable_gift && event_data.digital_gifts && event_data.digital_gifts.length > 0 && (
          <section className="py-16 px-6 sm:px-12 bg-[#FAF8F5] border-b border-[#E8E3DA] space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">
                Tanda Kasih
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                Amplop Digital
              </h2>
              <p className="text-xs text-[#7A807C] max-w-sm mx-auto">
                Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan kado pernikahan, dapat disalurkan melalui rekening berikut:
              </p>
            </div>

            <div className="space-y-4">
              {event_data.digital_gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="luxury-card rounded-2xl p-6 border border-[#E8E3DA] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
                      {gift.bank_name}
                    </span>
                    <Gift className="w-4 h-4 text-[#C5A880]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-mono font-bold text-[#1F2421] tracking-wider">
                      {gift.account_number}
                    </p>
                    <p className="text-xs text-[#7A807C]">a.n. {gift.account_holder}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAccount(gift.id, gift.account_number)}
                    className="w-full text-xs"
                  >
                    {copiedBankId === gift.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 text-[#C5A880]" />
                        Salin Nomor Rekening
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CLOSING BLESSINGS & BRANDING */}
        <footer className="py-16 px-6 text-center space-y-8">
          <div className="space-y-3 max-w-md mx-auto">
            <Heart className="w-6 h-6 text-[#C5A880] mx-auto animate-pulse" />
            <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
              Terima Kasih
            </h3>
            <p className="text-xs text-[#636965] leading-relaxed">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.
            </p>
            <p className="font-serif-luxury text-lg font-semibold text-[#1F2421] pt-2">
              Kami yang Berbahagia,
              <br />
              {event_data.bride_nickname || 'Siti'} & {event_data.groom_nickname || 'Andi'}
            </p>
          </div>

          {/* Reception Committee / Scanner Shortcut */}
          <div className="p-4 rounded-2xl bg-[#F6F3EE] border border-[#E8E3DA] text-center space-y-2 max-w-sm mx-auto shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1F2421]">
              <QrCode className="w-4 h-4 text-[#C5A880]" />
              <span>Petugas Penerima Tamu / Meja Registrasi?</span>
            </div>
            <p className="text-[11px] text-[#7A807C]">
              Buka scanner kamera untuk mencatat presensi kehadiran tamu di pintu masuk acara.
            </p>
            <a
              href={`/checkin/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#1F2421] text-[#FCFBF7] text-xs font-semibold hover:bg-[#333C38] transition-all shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5 text-[#C5A880]" />
              Buka Scanner QR Presensi
            </a>
          </div>

          {/* Rynora Invite Watermark */}
          <div className="pt-8 border-t border-[#E8E3DA] text-[11px] text-[#7A807C] space-y-1">
            <p>Made with love using</p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif-luxury font-bold text-xs text-[#1F2421] hover:text-[#C5A880] transition-colors"
            >
              Rynora.Invite
            </a>
          </div>
        </footer>

      </div>

      {/* ==================================================================== */}
      {/* MODAL: FULLSCREEN QR TICKET (HIGH CONTRAST BRIGHT FOR SCANNER) */}
      {/* ==================================================================== */}
      {showFullscreenQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#E8E3DA] p-6 sm:p-8 text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowFullscreenQr(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:text-black flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A7B4F]">
                E-Ticket QR Presensi
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                {guestRecord?.name || guestParam}
              </h3>
              <p className="text-xs text-[#7A807C]">
                Maksimal {guestRecord?.pax_limit || 2} Pax • {guestRecord?.category || 'Tamu Undangan'}
              </p>
            </div>

            {/* High contrast pure white background QR */}
            <div className="w-64 h-64 mx-auto p-4 bg-white rounded-2xl border-2 border-[#1F2421] shadow-lg flex items-center justify-center">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Pass High Contrast"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <p className="text-[11px] text-[#7A807C]">
              Arahkan layar ponsel Anda ke kamera scanner di meja penerima tamu.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullscreenQr(false)}
              className="w-full text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 text-xs text-[#7A807C] bg-[#FCFBF7]">Memuat undangan digital...</div>}>
      <PublicInvitationContent />
    </Suspense>
  );
}
