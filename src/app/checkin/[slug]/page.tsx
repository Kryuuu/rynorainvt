'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  UserCheck, 
  Users, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles,
  QrCode,
  ShieldCheck,
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { dataStore } from '@/lib/data-store';
import { Guest, Invitation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { copyText } from '@/lib/feedback';

// Audio feedback helper using Web Audio API
function playSound(type: 'success' | 'warning' | 'error') {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      // Pleasant double chime (C5 -> G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'warning') {
      // Alert buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Error double low thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (err) {
    console.error('Audio play error:', err);
  }
}

function CheckinScannerContent() {
  const params = useParams();
  const slug = (params?.slug as string) || 'andi-siti';
  const router = useRouter();

  const toast = useToast();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Operator / Desk selection
  const [operatorDesk, setOperatorDesk] = useState('Meja Penerima 1 (Pintu Masuk Utama)');

  // Last scan result
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'error';
    message: string;
    guest?: Guest;
    timestamp?: string;
  } | null>(null);

  // Manual token input
  const [manualToken, setManualToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Video and Canvas refs for real-time camera decoding
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // Load invitation & guests
  useEffect(() => {
    const inv = dataStore.getInvitationBySlug(slug) || dataStore.getInvitationById('inv_andi_siti');
    if (inv) {
      setInvitation(inv);
      const guestList = dataStore.getGuestsByInvitation(inv.id);
      setGuests(guestList);
    }
  }, [slug]);

  // Start/Stop Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung pada browser ini atau koneksi tidak menggunakan HTTPS.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setIsCameraActive(true);
          startDecoding();
        }
      } catch (err: unknown) {
        console.error('Camera access error:', err);
        const msg = err instanceof Error ? err.message : 'Izin kamera ditolak';
        setCameraError(
          msg.includes('Permission') || msg.includes('NotAllowed')
            ? 'Akses kamera ditolak. Berikan izin kamera pada browser Anda untuk memindai QR Code.'
            : 'Tidak dapat mengaktifkan kamera video. Anda tetap dapat menggunakan input barcode atau pencarian manual di bawah.'
        );
        setIsCameraActive(false);
      }
    }

    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Real-time canvas frame decoding using jsQR
  const startDecoding = () => {
    const scanFrame = () => {
      if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Decode frame
        if (!isProcessingRef.current) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            isProcessingRef.current = true;
            handleDetectedCode(code.data);
            // Throttle decoding for 2 seconds to prevent rapid multiple reads
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 2500);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Process detected QR data (token string or URL)
  const handleDetectedCode = (rawCode: string) => {
    let token = rawCode.trim();

    // If code is full URL like https://rynora.id/i/slug?to=Andi&u=qr_xxx or ?qr=xxx
    try {
      if (token.includes('?') || token.includes('http')) {
        const urlObj = new URL(token, window.location.origin);
        token = urlObj.searchParams.get('qr') || 
                urlObj.searchParams.get('u') || 
                urlObj.searchParams.get('token') || 
                token;
      }
    } catch {
      // Keep raw token
    }

    processCheckIn(token);
  };

  // Perform check-in logic
  const processCheckIn = (qrTokenOrId: string) => {
    if (!invitation) return;

    // Check if matching by qr_code_token or invitation_token or id
    let guest = guests.find(g => 
      g.qr_code_token === qrTokenOrId || 
      g.invitation_token === qrTokenOrId ||
      g.id === qrTokenOrId
    );

    if (!guest) {
      if (soundEnabled) playSound('error');
      setScanResult({
        status: 'error',
        message: `QR Code tidak dikenali (${qrTokenOrId.slice(0, 16)}...). Tamu tidak terdaftar pada acara ini.`,
      });
      return;
    }

    // Attempt check-in
    const res = dataStore.checkInGuestByQrToken(guest.qr_code_token, operatorDesk);

    if (res.success && res.guest) {
      if (soundEnabled) playSound('success');
      try {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } catch {}

      // Fire celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C5A880', '#1F2421', '#E8DFD8', '#10B981'],
      });

      // Update state
      setGuests(dataStore.getGuestsByInvitation(invitation.id));
      setScanResult({
        status: 'success',
        message: 'Check-in Berhasil! Selamat Datang.',
        guest: res.guest,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } else if (res.alreadyCheckedIn && res.guest) {
      if (soundEnabled) playSound('warning');
      setScanResult({
        status: 'warning',
        message: res.error || 'Tamu ini sudah melakukan check-in sebelumnya!',
        guest: res.guest,
        timestamp: res.guest.checked_in_at ? new Date(res.guest.checked_in_at).toLocaleTimeString('id-ID') : '',
      });
    } else {
      if (soundEnabled) playSound('error');
      setScanResult({
        status: 'error',
        message: res.error || 'Gagal memproses check-in.',
      });
    }
  };

  // Manual Check-in by Button
  const handleManualCheckIn = (guest: Guest) => {
    processCheckIn(guest.qr_code_token);
  };

  // Undo Check-in
  const handleUndoCheckIn = (guestId: string) => {
    if (!invitation) return;
    const guest = guests.find((g) => g.id === guestId);
    dataStore.undoCheckIn(guestId);
    setGuests(dataStore.getGuestsByInvitation(invitation.id));
    setScanResult(null);
    toast.success('Presensi dibatalkan', guest ? `Status kehadiran ${guest.name} dikembalikan ke Belum Hadir.` : 'Status kehadiran dikembalikan ke Belum Hadir.');
  };

  // Metrics
  const totalGuests = guests.length;
  const checkedInGuests = guests.filter(g => g.checked_in_at);
  const checkedInCount = checkedInGuests.length;
  const remainingCount = totalGuests - checkedInCount;
  const attendanceRate = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;
  const totalPaxCheckedIn = checkedInGuests.reduce((acc, g) => acc + (g.pax_limit || 1), 0);

  // Filtered guest search
  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.phone && g.phone.includes(searchQuery)) ||
    (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#1F2421] text-[#FCFBF7] flex flex-col font-sans overflow-x-clip selection:bg-[#C5A880] selection:text-[#1F2421]">
      
      {/* Top Header Bar */}
      <header className="bg-[#171B19] border-b border-[#2E3531] px-3 sm:px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link 
              href="/dashboard/guests"
              className="w-8 h-8 shrink-0 rounded-full bg-[#272E2B] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#333C38] transition-all"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880] whitespace-nowrap">
                  Buku Tamu & Scanner QR
                </span>
                <Badge variant="outline" className="text-[9px] bg-[#272E2B] border-[#C5A880]/30 text-[#C5A880] whitespace-nowrap shrink-0">
                  WITA Zone
                </Badge>
              </div>
              <h1 className="font-serif-luxury text-base sm:text-lg font-bold text-white truncate">
                {invitation ? invitation.title : 'Meja Penerima Tamu'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 shrink-0 rounded-xl bg-[#272E2B] text-gray-300 hover:text-[#C5A880] transition-colors"
              title={soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C5A880]" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>

            {/* Operator Desk selector */}
            <select
              value={operatorDesk}
              onChange={(e) => setOperatorDesk(e.target.value)}
              className="text-xs bg-[#272E2B] border border-[#38423E] rounded-xl px-2.5 py-1.5 text-gray-200 focus:outline-none focus:border-[#C5A880] hidden md:block"
            >
              <option value="Meja Penerima 1 (Pintu Masuk Utama)">Meja Penerima 1 (Utama)</option>
              <option value="Meja Penerima 2 (Pintu VIP)">Meja Penerima 2 (VIP)</option>
              <option value="Meja Penerima 3 (Keluarga)">Meja Penerima 3 (Keluarga)</option>
            </select>

            <Link
              href={`/i/${slug}`}
              target="_blank"
              className="shrink-0 text-xs px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#272E2B] text-gray-300 hover:text-white flex items-center gap-1 border border-[#38423E]"
            >
              <span className="hidden sm:inline">Lihat Undangan</span>
              <ExternalLink className="w-3 h-3 text-[#C5A880]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        
        {/* ==================================================================== */}
        {/* LEFT COLUMN: SCANNER VIEWFINDER & LIVE RESULT (Cols 1-7) */}
        {/* ==================================================================== */}
        <div className="lg:col-span-7 space-y-5 flex flex-col min-w-0">
          
          {/* Real-time Attendance Stats Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#171B19] border border-[#2E3531]">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium truncate block">Hadir</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">{checkedInCount}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">/ {totalGuests}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono truncate">{totalPaxCheckedIn} Pax Total</p>
            </div>

            <div className="space-y-0.5 border-x border-[#2E3531] px-2 sm:px-3 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium truncate block">Belum Hadir</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-amber-400">{remainingCount}</span>
                <span className="text-xs text-gray-400">Tamu</span>
              </div>
              <p className="text-[10px] text-gray-400">Menunggu</p>
            </div>

            <div className="space-y-0.5 text-right min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium truncate block">Persentase</span>
              <div className="text-xl sm:text-2xl font-bold text-[#C5A880]">{attendanceRate}%</div>
              <div className="w-full h-1.5 rounded-full bg-[#272E2B] overflow-hidden mt-1">
                <div 
                  className="h-full bg-[#C5A880] rounded-full transition-all duration-500" 
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera Scanner Viewport */}
          <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-[#2E3531] aspect-[4/3] flex flex-col items-center justify-center shadow-2xl">
            
            {/* Hidden canvas for image decoding */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video stream */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
              playsInline
              muted
            />

            {/* Scanning Overlay (When Camera is active) */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 pb-16 sm:p-6 sm:pb-16">
                
                {/* Viewfinder Target Box */}
                <div className="relative w-40 h-40 sm:w-64 sm:h-64 shrink-0 border-2 border-[#C5A880]/60 rounded-3xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Target Corners */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#C5A880] rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#C5A880] rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#C5A880] rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#C5A880] rounded-br-xl" />

                  {/* Animated Laser Scanning Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent shadow-[0_0_12px_#C5A880] animate-pulse top-1/2 -translate-y-1/2" />
                </div>

                <p className="mt-3 text-[11px] sm:text-xs text-white/80 font-medium tracking-wide bg-black/60 px-3 sm:px-4 py-1.5 rounded-full backdrop-blur-sm text-center max-w-full">
                  Arahkan kamera ke QR Code tamu
                </p>
              </div>
            )}

            {/* Camera Inactive Placeholder */}
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-[#1C221F] to-[#141816]">
                <div className="w-16 h-16 rounded-3xl bg-[#272E2B] border border-[#38423E] flex items-center justify-center text-[#C5A880] shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-serif-luxury text-lg font-bold text-white">Scanner Kamera Siap Digunakan</h3>
                  <p className="text-xs text-gray-400">
                    Gunakan kamera perangkat (HP / Tablet / Laptop) untuk memindai QR Code tamu secara otomatis dan cepat.
                  </p>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs max-w-sm text-left flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setIsCameraActive(true)}
                  className="shadow-xl px-6 text-xs font-semibold uppercase tracking-wider"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Aktifkan Kamera Scanner
                </Button>
              </div>
            )}

            {/* Floating Camera Controls (When active) */}
            {isCameraActive && (
              <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 flex items-center gap-2 z-20">
                <button
                  onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                  className="flex-1 min-w-0 px-2 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-[11px] sm:text-xs text-gray-200 border border-white/20 backdrop-blur-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0 text-[#C5A880]" />
                  <span>Putar Kamera</span>
                </button>

                <button
                  onClick={() => setIsCameraActive(false)}
                  className="flex-1 min-w-0 px-2 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-[11px] sm:text-xs text-red-200 border border-red-800/50 backdrop-blur-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                >
                  <CameraOff className="w-3.5 h-3.5 shrink-0" />
                  <span>Matikan Kamera</span>
                </button>
              </div>
            )}
          </div>

          {/* REAL-TIME SCAN RESULT CARD */}
          {scanResult && (
            <div 
              className={`p-5 rounded-3xl border transition-all animate-in zoom-in-95 duration-300 shadow-xl ${
                scanResult.status === 'success' 
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' 
                  : scanResult.status === 'warning'
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                  : 'bg-red-950/30 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {scanResult.status === 'success' && (
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {scanResult.status === 'warning' && (
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  {scanResult.status === 'error' && (
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider">
                        {scanResult.status === 'success' ? 'PRESENSI BERHASIL' : scanResult.status === 'warning' ? 'PERINGATAN DUPLIKAT' : 'PRESENSI GAGAL'}
                      </span>
                      {scanResult.timestamp && (
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scanResult.timestamp}
                        </span>
                      )}
                    </div>

                    {scanResult.guest ? (
                      <div>
                        <h4 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                          {scanResult.guest.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-300">
                          <Badge variant="gold" className="text-[10px]">
                            {scanResult.guest.category || 'Tamu Reguler'}
                          </Badge>
                          <span>Maks. {scanResult.guest.pax_limit} Pax</span>
                          {scanResult.guest.phone && <span>• {scanResult.guest.phone}</span>}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-200">{scanResult.message}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setScanResult(null)}
                  className="text-gray-400 hover:text-white p-1 text-sm"
                >
                  ✕
                </button>
              </div>

              {scanResult.guest && (
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-gray-400 text-[11px] min-w-0">{scanResult.message}</span>
                  {scanResult.guest.checked_in_at && (
                    <button
                      onClick={() => handleUndoCheckIn(scanResult.guest!.id)}
                      className="text-[11px] underline text-gray-400 hover:text-white shrink-0 whitespace-nowrap"
                    >
                      Batalkan Check-in
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Barcode / Token Scanner Input */}
          <div className="p-4 rounded-2xl bg-[#171B19] border border-[#2E3531] space-y-2">
            <span className="text-xs text-gray-400 font-medium">Input Manual Token / Barcode Scanner Fisik:</span>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (manualToken.trim()) {
                  processCheckIn(manualToken.trim());
                  setManualToken('');
                }
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                placeholder="Tempel / ketik token QR tamu (cth: qr_syamsuddin_checkin)..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="bg-[#272E2B] border-[#38423E] text-white text-xs h-10 min-w-0"
              />
              <Button type="submit" variant="gold" size="sm" className="h-10 w-full sm:w-auto shrink-0 text-xs px-4 whitespace-nowrap">
                Check-in
              </Button>
            </form>
          </div>

        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: SEARCH GUEST & REAL-TIME GUESTBOOK (Cols 8-12) */}
        {/* ==================================================================== */}
        <div className="lg:col-span-5 space-y-5 flex flex-col min-w-0">
          
          <div className="p-4 sm:p-5 rounded-3xl bg-[#171B19] border border-[#2E3531] space-y-4 flex-1 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-serif-luxury text-lg font-bold text-white">Daftar Buku Tamu</h3>
                <p className="text-[11px] text-gray-400">Pencarian & check-in manual tamu di tempat</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-[#C5A880] border-[#C5A880]/30 shrink-0 whitespace-nowrap">
                {filteredGuests.length} Tamu
              </Badge>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari nama tamu / instansi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#272E2B] border-[#38423E] text-white pl-9 text-xs h-10"
              />
            </div>

            {/* Guest List Stream */}
            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-2 pr-1">
              {filteredGuests.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  Tidak ada tamu yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const isCheckedIn = Boolean(guest.checked_in_at);
                  return (
                    <div
                      key={guest.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isCheckedIn 
                          ? 'bg-[#1D2622] border-emerald-500/30' 
                          : 'bg-[#212724] border-[#2E3531] hover:border-[#38423E]'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-white truncate max-w-full">
                            {guest.name}
                          </span>
                          {guest.category && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2D3632] text-[#C5A880] font-mono shrink-0 whitespace-nowrap">
                              {guest.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-wrap">
                          <span className="whitespace-nowrap">Maks. {guest.pax_limit} Pax</span>
                          {isCheckedIn && (
                            <span className="text-emerald-400 flex items-center gap-1 font-mono whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              Hadir ({new Date(guest.checked_in_at!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      {isCheckedIn ? (
                        <button
                          onClick={() => handleUndoCheckIn(guest.id)}
                          className="shrink-0 whitespace-nowrap text-[10px] text-gray-400 hover:text-red-300 px-2 py-1 rounded bg-[#272E2B] border border-transparent hover:border-red-900/40"
                          title="Batalkan check-in"
                        >
                          Batal
                        </button>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handleManualCheckIn(guest)}
                          className="h-7 shrink-0 whitespace-nowrap text-[10px] px-2.5 font-semibold"
                        >
                          Check-in
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Share Link for Receptionists */}
            <div className="pt-3 border-t border-[#2E3531] flex items-center justify-between text-[11px] text-gray-400">
              <span className="truncate">Tautan Meja Registrasi:</span>
              <button
                onClick={async () => {
                  const url = typeof window !== 'undefined' ? window.location.href : '';
                  if (await copyText(url)) {
                    toast.success('Tautan scanner berhasil disalin!', 'Bagikan tautan ini ke meja registrasi / panitia.');
                  } else {
                    toast.error('Gagal menyalin tautan', 'Browser tidak mengizinkan akses clipboard. Salin URL secara manual dari address bar.');
                  }
                }}
                className="text-[#C5A880] hover:underline font-semibold flex items-center gap-1 flex-shrink-0"
              >
                Salin Tautan Scanner
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

export default function CheckinScannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1F2421] text-white flex items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-400">Memuat Meja Penerima Tamu & Scanner QR...</p>
      </div>
    }>
      <CheckinScannerContent />
    </Suspense>
  );
}
