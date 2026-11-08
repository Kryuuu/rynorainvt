import { PlanEntitlements } from '@/types';
import { DEFAULT_FREE_ENTITLEMENTS } from './plans';

export interface GuestLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  maxLimit: number | null; // null represents unlimited
  isUnlimited: boolean;
  remainingCapacity: number | null; // null if unlimited
  errorMessage?: string;
}

/**
 * Authoritatively check if a new guest record can be added to the given invitation.
 *
 * Rules:
 * - Free: 100 max per invitation.
 * - Personal Plus: 1,000 max per invitation.
 * - Creator Pro: Unlimited.
 * - Vendor Studio: Unlimited.
 * - Per individual invitation scope.
 * - Each row in `guests` table = 1 unit.
 * - RSVP submissions do NOT count as guest units.
 * - If missing or invalid entitlement, defaults strictly to Free tier (100).
 */
export function checkGuestCreationLimit(
  currentGuestCount: number,
  entitlements?: PlanEntitlements | null,
  batchSize = 1
): GuestLimitCheckResult {
  const effectiveEntitlements = entitlements || DEFAULT_FREE_ENTITLEMENTS;

  // Explicit check for unlimited
  const isUnlimited = 
    effectiveEntitlements.is_unlimited_guests === true && 
    (effectiveEntitlements.max_guests_per_invitation === null || effectiveEntitlements.max_guests_per_invitation === undefined);

  if (isUnlimited) {
    return {
      allowed: true,
      currentCount: currentGuestCount,
      maxLimit: null,
      isUnlimited: true,
      remainingCapacity: null,
    };
  }

  // Finite limit guard
  // Fallback to 100 if number is missing/invalid (Safety rule #3: Never interpret missing entitlement as unlimited)
  const maxLimit = typeof effectiveEntitlements.max_guests_per_invitation === 'number' 
    ? effectiveEntitlements.max_guests_per_invitation 
    : 100;

  const remainingCapacity = Math.max(0, maxLimit - currentGuestCount);
  const allowed = (currentGuestCount + batchSize) <= maxLimit;

  if (!allowed) {
    return {
      allowed: false,
      currentCount: currentGuestCount,
      maxLimit,
      isUnlimited: false,
      remainingCapacity,
      errorMessage: batchSize === 1
        ? `Batas kuota tamu (${maxLimit} tamu) untuk undangan ini telah tercapai. Silakan upgrade paket langganan Anda untuk menambah lebih banyak tamu.`
        : `Kapasitas tersisa (${remainingCapacity} tamu) tidak mencukupi untuk mengimpor ${batchSize} data tamu baru. Kuota maksimum adalah ${maxLimit} tamu.`,
    };
  }

  return {
    allowed: true,
    currentCount: currentGuestCount,
    maxLimit,
    isUnlimited: false,
    remainingCapacity: remainingCapacity - batchSize,
  };
}

/**
 * Apakah workspace boleh memakai animasi custom per seksi (fitur PRO)?
 * Hanya Creator Pro & Vendor Studio (can_use_custom_animations === true).
 * Entitlement yang hilang / tidak valid = TIDAK boleh (default aman = Free).
 */
export function canUseCustomAnimations(
  entitlements?: PlanEntitlements | null
): boolean {
  return entitlements?.can_use_custom_animations === true;
}

/**
 * Validate CSV import rows against remaining guest capacity
 */
export function validateGuestBatchCapacity(
  currentGuestCount: number,
  importRowCount: number,
  entitlements?: PlanEntitlements | null
): {
  canImportAll: boolean;
  acceptableCount: number;
  rejectedCount: number;
  reason?: string;
} {
  const check = checkGuestCreationLimit(currentGuestCount, entitlements, importRowCount);

  if (check.allowed) {
    return {
      canImportAll: true,
      acceptableCount: importRowCount,
      rejectedCount: 0,
    };
  }

  // Partial capacity calculation
  const remaining = check.remainingCapacity ?? 0;
  return {
    canImportAll: false,
    acceptableCount: remaining,
    rejectedCount: importRowCount - remaining,
    reason: `Paket Anda memiliki batas maksimum ${check.maxLimit} tamu per undangan. Tersisa ${remaining} slot, namun file CSV berisi ${importRowCount} data.`,
  };
}

/**
 * Display helper for the UI: e.g. "45 / 100 tamu", "450 / 1.000 tamu", or "Unlimited tamu"
 */
export function formatGuestUsageBadge(
  currentGuestCount: number,
  entitlements?: PlanEntitlements | null
): { text: string; percent: number; isFull: boolean; isUnlimited: boolean } {
  const effective = entitlements || DEFAULT_FREE_ENTITLEMENTS;
  const isUnlimited = effective.is_unlimited_guests === true && effective.max_guests_per_invitation === null;

  if (isUnlimited) {
    return {
      text: `${currentGuestCount.toLocaleString('id-ID')} / Unlimited tamu`,
      percent: 0,
      isFull: false,
      isUnlimited: true,
    };
  }

  const limit = typeof effective.max_guests_per_invitation === 'number' 
    ? effective.max_guests_per_invitation 
    : 100;

  const percent = Math.min(100, Math.round((currentGuestCount / limit) * 100));
  const isFull = currentGuestCount >= limit;

  return {
    text: `${currentGuestCount.toLocaleString('id-ID')} / ${limit.toLocaleString('id-ID')} tamu`,
    percent,
    isFull,
    isUnlimited: false,
  };
}
