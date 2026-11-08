import type { PlanEntitlements, SectionAnimation } from '@/types';
import { canUseCustomAnimations } from './billing/entitlements';

/**
 * Animasi masuk per seksi (fitur PRO: Creator Pro & Vendor Studio saja).
 * Dipilih per seksi di Visual Editor, dirender di halaman undangan publik
 * saat seksi di-scroll ke layar. Durasi tetap ~0,65 detik (ease-out),
 * tanpa pengaturan kecepatan / delay di versi ini.
 */

export const SECTION_ANIMATION_OPTIONS: Array<{
  value: SectionAnimation;
  label: string;
  description: string;
}> = [
  { value: 'none', label: 'Tanpa Animasi', description: 'Seksi tampil langsung seperti biasa.' },
  { value: 'fade', label: 'Fade (Memudar)', description: 'Muncul perlahan dari transparan.' },
  { value: 'fade-up', label: 'Fade Up (Naik)', description: 'Muncul dari bawah sambil memudar.' },
  { value: 'slide-left', label: 'Geser dari Kiri', description: 'Masuk dari sisi kiri layar.' },
  { value: 'slide-right', label: 'Geser dari Kanan', description: 'Masuk dari sisi kanan layar.' },
  { value: 'zoom-in', label: 'Zoom In (Membesar)', description: 'Muncul dari kecil membesar ke ukuran normal.' },
];

export const SECTION_ANIMATION_LABELS: Record<SectionAnimation, string> =
  Object.fromEntries(
    SECTION_ANIMATION_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<SectionAnimation, string>;

const VALID_ANIMATIONS: ReadonlySet<string> = new Set(
  SECTION_ANIMATION_OPTIONS.map((o) => o.value)
);

export function isValidSectionAnimation(value: unknown): value is SectionAnimation {
  return typeof value === 'string' && VALID_ANIMATIONS.has(value);
}

/** Nilai apa pun yang tidak dikenal (termasuk undefined) = 'none' (perilaku lama). */
export function resolveSectionAnimation(value: unknown): SectionAnimation {
  return isValidSectionAnimation(value) ? value : 'none';
}

/**
 * Animasi efektif sebuah seksi di halaman publik: hanya dipakai jika
 * workspace pemilik undangan berhak (Creator Pro ke atas). Jika tidak
 * berhak, entitlement tidak diketahui, atau nilainya 'none' -> 'none',
 * sehingga undangan lama / paket Free / Personal Plus tidak berubah.
 */
export function resolveEffectiveSectionAnimation(
  value: unknown,
  entitlements?: PlanEntitlements | null
): SectionAnimation {
  if (!canUseCustomAnimations(entitlements)) return 'none';
  return resolveSectionAnimation(value);
}
