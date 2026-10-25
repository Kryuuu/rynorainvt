// ==========================================
// Rynora Invite — Core Domain Types
// ==========================================

export type WorkspaceType = 'personal' | 'vendor';

export type WorkspaceRole = 'personal_user' | 'vendor_owner' | 'vendor_admin' | 'vendor_editor' | 'platform_admin';

export type InvitationStatus = 'draft' | 'published' | 'archived';

export type EventCategory = 
  | 'wedding' 
  | 'birthday' 
  | 'aqiqah' 
  | 'graduation' 
  | 'seminar' 
  | 'corporate' 
  | 'other';

export type BillingPeriod = 'monthly' | 'annual';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';

export type PaymentProvider = 'midtrans' | 'xendit' | 'sandbox';

export type PaymentStatus = 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'refund';

// Plan Entitlements Structure
export interface PlanEntitlements {
  max_draft_invitations: number;
  max_active_invitations: number | null; // null = unlimited
  max_guests_per_invitation: number | null; // null = UNLIMITED
  is_unlimited_guests: boolean;
  can_use_visual_editor: boolean;
  can_use_premium_templates: boolean;
  can_remove_branding: boolean;
  can_use_custom_domain: boolean;
  can_use_qr_checkin: boolean;
  can_export_guest_data: boolean;
  max_team_seats: number;
  monthly_publish_credits: number;
  has_analytics: boolean;
  has_multi_client_workspace: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: 'free' | 'personal-plus' | 'creator-pro' | 'vendor-studio';
  billing_period: BillingPeriod;
  price_amount: number; // in IDR (Rp)
  currency: string;
  entitlements: PlanEntitlements;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  owner_id: string;
  settings: {
    brand_name?: string;
    brand_logo_url?: string;
    brand_color?: string;
    contact_phone?: string;
    contact_email?: string;
    custom_domain?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  membership_status: 'active' | 'invited' | 'suspended';
  created_at: string;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  is_platform_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  plan_id: string;
  plan?: Plan;
  status: SubscriptionStatus;
  billing_period: BillingPeriod;
  provider: PaymentProvider;
  provider_subscription_id?: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  workspace_id: string;
  subscription_id?: string | null;
  provider: PaymentProvider;
  provider_transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key: string;
  payment_method?: string;
  paid_at?: string | null;
  created_at: string;
}

// Template Model
export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: EventCategory;
  preview_image_url: string;
  is_premium: boolean;
  status: 'draft' | 'published' | 'archived';
  default_configuration: {
    theme: ThemeConfiguration;
    sections: InvitationSectionConfig[];
  };
  created_at: string;
  updated_at: string;
}

// Invitation Theme Configuration
export interface ThemeConfiguration {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  card_color: string;
  text_primary: string;
  text_secondary: string;
  accent_gold: string;
  font_heading: 'playfair' | 'cormorant' | 'cinzel' | 'serif';
  font_body: 'plus-jakarta' | 'inter' | 'outfit' | 'sans';
  cover_layout: 'centered' | 'split' | 'fullscreen' | 'framed';
  border_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  background_music_url?: string | null;
  background_music_title?: string | null;
  show_floating_music_button: boolean;
}

// Event Data Schema
export interface EventData {
  // Couple/Celebrant details
  bride_name?: string;
  bride_nickname?: string;
  bride_parents?: string;
  groom_name?: string;
  groom_nickname?: string;
  groom_parents?: string;
  celebrant_name?: string;
  celebrant_title?: string;
  event_title: string;
  event_description?: string;
  
  // Date & Sessions
  event_date: string; // ISO format or YYYY-MM-DD
  timezone: string; // Default: Asia/Makassar
  sessions: Array<{
    id: string;
    title: string; // e.g. "Akad Nikah", "Resepsi", "Acara Utama"
    date: string;
    start_time: string; // e.g. "09:00"
    end_time: string; // e.g. "12:00" or "Selesai"
    venue_name: string;
    venue_address: string;
    maps_url?: string;
  }>;

  // Story / Timeline
  love_story?: Array<{
    year: string;
    title: string;
    story: string;
  }>;

  // Media
  cover_image_url?: string;
  bride_photo_url?: string;
  groom_photo_url?: string;
  video_url?: string;
  video_title?: string;
  gallery_images: string[];

  // Digital Envelope / Gift
  digital_gifts?: Array<{
    id: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
    qr_code_url?: string;
  }>;
  gift_delivery_address?: string;

  // Settings
  enable_rsvp: boolean;
  enable_wishes: boolean;
  enable_gift: boolean;
  enable_countdown: boolean;
  enable_gallery: boolean;
  enable_story: boolean;
  enable_video?: boolean;
}

export interface InvitationSectionConfig {
  id: string;
  section_key: string; // 'hero' | 'couple' | 'events' | 'story' | 'gallery' | 'rsvp' | 'wishes' | 'gifts' | 'closing'
  component_type: string;
  sort_order: number;
  is_visible: boolean;
  custom_title?: string;
  custom_subtitle?: string;
  settings?: Record<string, unknown>;
}

export interface Invitation {
  id: string;
  workspace_id: string;
  created_by: string;
  template_id: string;
  title: string;
  slug: string;
  category: EventCategory;
  status: InvitationStatus;
  event_data: EventData;
  theme_configuration: ThemeConfiguration;
  sections?: InvitationSectionConfig[];
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  workspace?: Workspace;
  template?: Template;
}

// Guest Management
export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  category?: string | null; // e.g. "VIP", "Keluarga", "Teman Kantor"
  pax_limit: number; // Max allowed companions (default: 1, e.g. household of 4 = 1 guest record with pax 4)
  invitation_token: string; // Non-guessable token for ?to= or ?u=
  qr_code_token: string; // Check-in token
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RsvpResponse {
  id: string;
  invitation_id: string;
  guest_id?: string | null;
  guest_name: string;
  attendance_status: 'attending' | 'not_attending' | 'uncertain';
  attendee_count: number;
  message?: string | null;
  created_at: string;
}

export interface GuestWish {
  id: string;
  invitation_id: string;
  guest_name: string;
  message: string;
  moderation_status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface PublishCredit {
  id: string;
  workspace_id: string;
  subscription_id?: string | null;
  credit_delta: number;
  balance_after: number;
  reason: string;
  invitation_id?: string | null;
  idempotency_key: string;
  created_at: string;
}

export interface VendorClient {
  id: string;
  workspace_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  workspace_id?: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
