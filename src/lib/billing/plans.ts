import { Plan, PlanEntitlements } from '@/types';

export const DEFAULT_FREE_ENTITLEMENTS: PlanEntitlements = {
  max_draft_invitations: 1,
  max_active_invitations: 1, // 1 draft preview
  max_guests_per_invitation: 100, // Non-negotiable Free Limit
  is_unlimited_guests: false,
  can_use_visual_editor: false,
  can_use_premium_templates: false,
  can_remove_branding: false,
  can_use_custom_domain: false,
  can_use_qr_checkin: false,
  can_export_guest_data: false,
  max_team_seats: 1,
  monthly_publish_credits: 0,
  has_analytics: false,
  has_multi_client_workspace: false,
};

export const DEFAULT_PERSONAL_PLUS_ENTITLEMENTS: PlanEntitlements = {
  max_draft_invitations: 5,
  max_active_invitations: 3,
  max_guests_per_invitation: 1000, // Non-negotiable Personal Plus Limit
  is_unlimited_guests: false,
  can_use_visual_editor: true,
  can_use_premium_templates: true,
  can_remove_branding: true,
  can_use_custom_domain: false,
  can_use_qr_checkin: false,
  can_export_guest_data: true,
  max_team_seats: 1,
  monthly_publish_credits: 3,
  has_analytics: true,
  has_multi_client_workspace: false,
};

export const DEFAULT_CREATOR_PRO_ENTITLEMENTS: PlanEntitlements = {
  max_draft_invitations: 20,
  max_active_invitations: 10,
  max_guests_per_invitation: null, // Non-negotiable Creator Pro: Explicitly UNLIMITED
  is_unlimited_guests: true,
  can_use_visual_editor: true,
  can_use_premium_templates: true,
  can_remove_branding: true,
  can_use_custom_domain: true,
  can_use_qr_checkin: true,
  can_export_guest_data: true,
  max_team_seats: 1,
  monthly_publish_credits: 10,
  has_analytics: true,
  has_multi_client_workspace: false,
};

export const DEFAULT_VENDOR_STUDIO_ENTITLEMENTS: PlanEntitlements = {
  max_draft_invitations: 100,
  max_active_invitations: null, // Unlimited active projects
  max_guests_per_invitation: null, // Non-negotiable Vendor Studio: Explicitly UNLIMITED
  is_unlimited_guests: true,
  can_use_visual_editor: true,
  can_use_premium_templates: true,
  can_remove_branding: true,
  can_use_custom_domain: true,
  can_use_qr_checkin: true,
  can_export_guest_data: true,
  max_team_seats: 3, // Owner + 2 team members
  monthly_publish_credits: 30, // 30 published invitations / period
  has_analytics: true,
  has_multi_client_workspace: true,
};

const STATIC_TIMESTAMP = '2026-10-25T00:00:00.000Z';

export const INITIAL_PLANS: Plan[] = [
  // FREE
  {
    id: 'plan_free',
    name: 'Free',
    slug: 'free',
    billing_period: 'monthly',
    price_amount: 0,
    currency: 'IDR',
    entitlements: DEFAULT_FREE_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },

  // PERSONAL PLUS - Monthly
  {
    id: 'plan_personal_plus_monthly',
    name: 'Personal Plus',
    slug: 'personal-plus',
    billing_period: 'monthly',
    price_amount: 39000,
    currency: 'IDR',
    entitlements: DEFAULT_PERSONAL_PLUS_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  // PERSONAL PLUS - Annual
  {
    id: 'plan_personal_plus_annual',
    name: 'Personal Plus',
    slug: 'personal-plus',
    billing_period: 'annual',
    price_amount: 299000,
    currency: 'IDR',
    entitlements: DEFAULT_PERSONAL_PLUS_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },

  // CREATOR PRO - Monthly
  {
    id: 'plan_creator_pro_monthly',
    name: 'Creator Pro',
    slug: 'creator-pro',
    billing_period: 'monthly',
    price_amount: 79000,
    currency: 'IDR',
    entitlements: DEFAULT_CREATOR_PRO_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  // CREATOR PRO - Annual
  {
    id: 'plan_creator_pro_annual',
    name: 'Creator Pro',
    slug: 'creator-pro',
    billing_period: 'annual',
    price_amount: 599000,
    currency: 'IDR',
    entitlements: DEFAULT_CREATOR_PRO_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },

  // VENDOR STUDIO - Monthly
  {
    id: 'plan_vendor_studio_monthly',
    name: 'Vendor Studio',
    slug: 'vendor-studio',
    billing_period: 'monthly',
    price_amount: 199000,
    currency: 'IDR',
    entitlements: DEFAULT_VENDOR_STUDIO_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  // VENDOR STUDIO - Annual
  {
    id: 'plan_vendor_studio_annual',
    name: 'Vendor Studio',
    slug: 'vendor-studio',
    billing_period: 'annual',
    price_amount: 1990000,
    currency: 'IDR',
    entitlements: DEFAULT_VENDOR_STUDIO_ENTITLEMENTS,
    is_active: true,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];
