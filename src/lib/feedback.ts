/**
 * Helper umpan balik (feedback) bersama untuk semua tombol simpan/mutasi.
 * Dipakai bersama <ToastProvider>: pesan gagal selalu membawa pesan error
 * asli, bukan sekadar "gagal", supaya pengguna tahu apa yang harus diulang.
 */

/** Ambil pesan error yang bisa dibaca manusia dari nilai apa pun. */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

/** Salin teks ke clipboard; kembalikan false (bukan throw) bila gagal. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
