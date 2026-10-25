import { describe, it, expect, beforeEach } from 'vitest';
import { 
  checkGuestCreationLimit, 
  validateGuestBatchCapacity, 
  formatGuestUsageBadge 
} from '../lib/billing/entitlements';
import { 
  DEFAULT_FREE_ENTITLEMENTS, 
  DEFAULT_PERSONAL_PLUS_ENTITLEMENTS, 
  DEFAULT_CREATOR_PRO_ENTITLEMENTS, 
  DEFAULT_VENDOR_STUDIO_ENTITLEMENTS 
} from '../lib/billing/plans';
import { dataStore } from '../lib/data-store';

describe('Mandatory Guest Limit Enforcement Policy (Section 10)', () => {
  
  // Rule 1: Free plan accepts guest 100 and rejects guest 101
  it('Free plan accepts guest 100 and rejects guest 101', () => {
    // 99 existing guests, adding 1 -> Total 100: ALLOWED
    const check100 = checkGuestCreationLimit(99, DEFAULT_FREE_ENTITLEMENTS, 1);
    expect(check100.allowed).toBe(true);
    expect(check100.maxLimit).toBe(100);
    expect(check100.remainingCapacity).toBe(0);

    // 100 existing guests, adding 1 -> Total 101: REJECTED
    const check101 = checkGuestCreationLimit(100, DEFAULT_FREE_ENTITLEMENTS, 1);
    expect(check101.allowed).toBe(false);
    expect(check101.errorMessage).toContain('Batas kuota tamu (100 tamu) untuk undangan ini telah tercapai');
  });

  // Rule 2: Personal Plus accepts guest 1,000 and rejects guest 1,001
  it('Personal Plus accepts guest 1,000 and rejects guest 1,001', () => {
    // 999 existing guests, adding 1 -> Total 1,000: ALLOWED
    const check1000 = checkGuestCreationLimit(999, DEFAULT_PERSONAL_PLUS_ENTITLEMENTS, 1);
    expect(check1000.allowed).toBe(true);
    expect(check1000.maxLimit).toBe(1000);
    expect(check1000.remainingCapacity).toBe(0);

    // 1000 existing guests, adding 1 -> Total 1,001: REJECTED
    const check1001 = checkGuestCreationLimit(1000, DEFAULT_PERSONAL_PLUS_ENTITLEMENTS, 1);
    expect(check1001.allowed).toBe(false);
    expect(check1001.errorMessage).toContain('Batas kuota tamu (1000 tamu) untuk undangan ini telah tercapai');
  });

  // Rule 3: Creator Pro can exceed 1,000 guests without artificial limit
  it('Creator Pro accepts more than 1,000 guests without an artificial plan limit', () => {
    const check5000 = checkGuestCreationLimit(5000, DEFAULT_CREATOR_PRO_ENTITLEMENTS, 1);
    expect(check5000.allowed).toBe(true);
    expect(check5000.isUnlimited).toBe(true);
    expect(check5000.maxLimit).toBeNull();
    expect(check5000.remainingCapacity).toBeNull();
  });

  // Rule 4: Vendor Studio can exceed 1,000 guests without artificial limit
  it('Vendor Studio accepts more than 1,000 guests without an artificial plan limit', () => {
    const check10000 = checkGuestCreationLimit(10000, DEFAULT_VENDOR_STUDIO_ENTITLEMENTS, 50);
    expect(check10000.allowed).toBe(true);
    expect(check10000.isUnlimited).toBe(true);
    expect(check10000.maxLimit).toBeNull();
  });

  // Rule 5: Limits apply independently to each invitation
  it('Limits apply per invitation, not pooled across all invitations', () => {
    // Invitation A on Free has 100 guests (full)
    const checkInvA = checkGuestCreationLimit(100, DEFAULT_FREE_ENTITLEMENTS, 1);
    expect(checkInvA.allowed).toBe(false);

    // Invitation B on the same Free account has 0 guests -> Can add guests up to 100
    const checkInvB = checkGuestCreationLimit(0, DEFAULT_FREE_ENTITLEMENTS, 1);
    expect(checkInvB.allowed).toBe(true);
    expect(checkInvB.remainingCapacity).toBe(99);
  });

  // Rule 6: Missing or invalid entitlement defaults strictly to finite Free tier (100), NEVER unlimited
  it('Never interprets missing or undefined entitlement as unlimited', () => {
    const checkFallback = checkGuestCreationLimit(100, null, 1);
    expect(checkFallback.allowed).toBe(false);
    expect(checkFallback.maxLimit).toBe(100);
    expect(checkFallback.isUnlimited).toBe(false);
  });

  // Rule 7: CSV import capacity validation
  it('Validates CSV batch import against remaining capacity', () => {
    // 80 guests present on Free (100 max) -> 20 slots left
    // Attempting to import 25 rows -> Must reject full import and report capacity
    const validation = validateGuestBatchCapacity(80, 25, DEFAULT_FREE_ENTITLEMENTS);
    expect(validation.canImportAll).toBe(false);
    expect(validation.acceptableCount).toBe(20);
    expect(validation.rejectedCount).toBe(5);
    expect(validation.reason).toContain('Tersisa 20 slot, namun file CSV berisi 25 data');

    // Attempting to import 15 rows -> Allowed
    const valid15 = validateGuestBatchCapacity(80, 15, DEFAULT_FREE_ENTITLEMENTS);
    expect(valid15.canImportAll).toBe(true);
    expect(valid15.acceptableCount).toBe(15);
    expect(valid15.rejectedCount).toBe(0);
  });

  // Rule 8: RSVP submissions do NOT count as guest records
  it('RSVP submissions do not create or consume registered guest records', () => {
    const initialGuestCount = dataStore.getGuestsByInvitation('inv_andi_siti').length;
    
    // Submit 2 RSVP responses
    dataStore.submitRsvp('inv_andi_siti', {
      guest_name: 'Tamu Online 1',
      attendance_status: 'attending',
      attendee_count: 4,
      message: 'Hadir sekeluarga',
    });
    dataStore.submitRsvp('inv_andi_siti', {
      guest_name: 'Tamu Online 2',
      attendance_status: 'not_attending',
      attendee_count: 1,
    });

    const finalGuestCount = dataStore.getGuestsByInvitation('inv_andi_siti').length;
    expect(finalGuestCount).toBe(initialGuestCount);
  });

  // Rule 9: One household with attendee count 4 = 1 guest record consumed
  it('One guest record with attendee count 4 consumes exactly 1 unit', () => {
    const guest = dataStore.addGuest('inv_andi_siti', {
      name: 'Keluarga Bpk. H. Dahlan',
      phone: '08123456789',
      pax_limit: 4,
    });
    expect(guest.pax_limit).toBe(4);
    // Consumes 1 record in guests list
    const found = dataStore.guests.filter(g => g.id === guest.id);
    expect(found.length).toBe(1);
  });

  // Rule 10: Usage badge formatting
  it('Formats guest usage badge correctly for finite and unlimited tiers', () => {
    expect(formatGuestUsageBadge(45, DEFAULT_FREE_ENTITLEMENTS).text).toBe('45 / 100 tamu');
    expect(formatGuestUsageBadge(450, DEFAULT_PERSONAL_PLUS_ENTITLEMENTS).text).toBe('450 / 1.000 tamu');
    expect(formatGuestUsageBadge(1200, DEFAULT_CREATOR_PRO_ENTITLEMENTS).text).toBe('1.200 / Unlimited tamu');
  });

});
