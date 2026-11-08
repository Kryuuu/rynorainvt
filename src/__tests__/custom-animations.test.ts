import { describe, it, expect } from 'vitest';
import { canUseCustomAnimations } from '../lib/billing/entitlements';
import {
  DEFAULT_FREE_ENTITLEMENTS,
  DEFAULT_PERSONAL_PLUS_ENTITLEMENTS,
  DEFAULT_CREATOR_PRO_ENTITLEMENTS,
  DEFAULT_VENDOR_STUDIO_ENTITLEMENTS,
} from '../lib/billing/plans';
import {
  resolveSectionAnimation,
  resolveEffectiveSectionAnimation,
  SECTION_ANIMATION_OPTIONS,
} from '../lib/section-animations';
import { dataStore } from '../lib/data-store';

describe('Animasi custom per seksi — gating paket PRO', () => {
  it('Free & Personal Plus TIDAK boleh memakai animasi custom', () => {
    expect(canUseCustomAnimations(DEFAULT_FREE_ENTITLEMENTS)).toBe(false);
    expect(canUseCustomAnimations(DEFAULT_PERSONAL_PLUS_ENTITLEMENTS)).toBe(false);
    expect(DEFAULT_FREE_ENTITLEMENTS.can_use_custom_animations).toBe(false);
    expect(DEFAULT_PERSONAL_PLUS_ENTITLEMENTS.can_use_custom_animations).toBe(false);
  });

  it('Creator Pro & Vendor Studio BOLEH memakai animasi custom', () => {
    expect(canUseCustomAnimations(DEFAULT_CREATOR_PRO_ENTITLEMENTS)).toBe(true);
    expect(canUseCustomAnimations(DEFAULT_VENDOR_STUDIO_ENTITLEMENTS)).toBe(true);
    expect(DEFAULT_CREATOR_PRO_ENTITLEMENTS.can_use_custom_animations).toBe(true);
    expect(DEFAULT_VENDOR_STUDIO_ENTITLEMENTS.can_use_custom_animations).toBe(true);
  });

  it('Entitlement hilang / tidak valid = TIDAK boleh (default aman = Free)', () => {
    expect(canUseCustomAnimations(null)).toBe(false);
    expect(canUseCustomAnimations(undefined)).toBe(false);
    expect(canUseCustomAnimations({} as never)).toBe(false);
  });

  it('Ada tepat 6 pilihan animasi, diawali "none"', () => {
    expect(SECTION_ANIMATION_OPTIONS.map((o) => o.value)).toEqual([
      'none',
      'fade',
      'fade-up',
      'slide-left',
      'slide-right',
      'zoom-in',
    ]);
  });

  it('Nilai animasi tidak dikenal / kosong = none (perilaku lama)', () => {
    expect(resolveSectionAnimation(undefined)).toBe('none');
    expect(resolveSectionAnimation('putar-putar')).toBe('none');
    expect(resolveSectionAnimation(null)).toBe('none');
    expect(resolveSectionAnimation('fade-up')).toBe('fade-up');
  });

  it('Halaman publik: animasi tersimpan diabaikan untuk paket non-Pro', () => {
    // Undangan Andi & Siti (ws_personal_01 = Personal Plus): animasi apa pun -> none
    expect(resolveEffectiveSectionAnimation('fade-up', DEFAULT_PERSONAL_PLUS_ENTITLEMENTS)).toBe('none');
    expect(resolveEffectiveSectionAnimation('zoom-in', DEFAULT_FREE_ENTITLEMENTS)).toBe('none');
    expect(resolveEffectiveSectionAnimation('fade-up', null)).toBe('none');
  });

  it('Halaman publik: animasi dipakai untuk Creator Pro & Vendor Studio', () => {
    expect(resolveEffectiveSectionAnimation('fade-up', DEFAULT_CREATOR_PRO_ENTITLEMENTS)).toBe('fade-up');
    expect(resolveEffectiveSectionAnimation('slide-left', DEFAULT_VENDOR_STUDIO_ENTITLEMENTS)).toBe('slide-left');
    expect(resolveEffectiveSectionAnimation('none', DEFAULT_CREATOR_PRO_ENTITLEMENTS)).toBe('none');
  });

  it('dataStore: workspace Creator Pro berhak, Free tidak, workspace asing default Free', () => {
    // ws_creator_01 = Creator Pro, ws_free_01 = Free (seeded di data-store)
    expect(
      canUseCustomAnimations(dataStore.getEntitlementsForWorkspace('ws_creator_01'))
    ).toBe(true);
    expect(
      canUseCustomAnimations(dataStore.getEntitlementsForWorkspace('ws_vendor_01'))
    ).toBe(true);
    expect(
      canUseCustomAnimations(dataStore.getEntitlementsForWorkspace('ws_personal_01'))
    ).toBe(false);
    expect(
      canUseCustomAnimations(dataStore.getEntitlementsForWorkspace('ws_free_01'))
    ).toBe(false);
    expect(
      canUseCustomAnimations(dataStore.getEntitlementsForWorkspace('ws_tidak_ada'))
    ).toBe(false);
  });
});
