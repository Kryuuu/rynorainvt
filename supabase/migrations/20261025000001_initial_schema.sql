-- ====================================================================
-- RYNORA INVITE — COMPLETE SINGLE DATABASE MIGRATION
-- Multi-Tenant SaaS Platform Schema, Functions, RLS & Seed Data
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. CORE TABLES & CONSTRAINTS
-- ====================================================================

-- USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('personal', 'vendor')),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);

-- WORKSPACE MEMBERS
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('personal_user', 'vendor_owner', 'vendor_admin', 'vendor_editor', 'platform_admin')),
  membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);

-- PLANS & ENTITLEMENTS
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL CHECK (slug IN ('free', 'personal-plus', 'creator-pro', 'vendor-studio')),
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  price_amount BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  entitlements JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  provider TEXT NOT NULL DEFAULT 'sandbox' CHECK (provider IN ('midtrans', 'xendit', 'sandbox')),
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workspace_active_sub UNIQUE (workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON public.subscriptions(workspace_id);

-- PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('midtrans', 'xendit', 'sandbox')),
  provider_transaction_id TEXT NOT NULL,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund')),
  idempotency_key TEXT NOT NULL UNIQUE,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_provider_id ON public.payment_transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON public.payment_transactions(workspace_id);

-- TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('wedding', 'birthday', 'aqiqah', 'graduation', 'seminar', 'corporate', 'other')),
  preview_image_url TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  default_configuration JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);

-- INVITATIONS
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  template_id TEXT NOT NULL REFERENCES public.templates(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('wedding', 'birthday', 'aqiqah', 'graduation', 'seminar', 'corporate', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_workspace ON public.invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- INVITATION SECTIONS
CREATE TABLE IF NOT EXISTS public.invitation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  component_type TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_invitation ON public.invitation_sections(invitation_id, sort_order);

-- GUESTS
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  category TEXT,
  pax_limit INT NOT NULL DEFAULT 1,
  invitation_token TEXT NOT NULL UNIQUE,
  qr_code_token TEXT NOT NULL UNIQUE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guests_invitation ON public.guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_token ON public.guests(invitation_token);
CREATE INDEX IF NOT EXISTS idx_guests_qr_token ON public.guests(qr_code_token);

-- RSVPS
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  attendance_status TEXT NOT NULL CHECK (attendance_status IN ('attending', 'not_attending', 'uncertain')),
  attendee_count INT NOT NULL DEFAULT 1 CHECK (attendee_count >= 1),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON public.rsvps(invitation_id);

-- WISHES / GUEST BOOK
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishes_invitation ON public.wishes(invitation_id);

-- VENDOR CLIENTS
CREATE TABLE IF NOT EXISTS public.vendor_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_clients_workspace ON public.vendor_clients(workspace_id);

-- PUBLISH CREDITS (VENDOR WORKSPACE USAGE LEDGER)
CREATE TABLE IF NOT EXISTS public.publish_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  credit_delta INT NOT NULL,
  balance_after INT NOT NULL,
  reason TEXT NOT NULL,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_workspace ON public.publish_credits(workspace_id);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON public.audit_logs(workspace_id);

-- ====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user belongs to workspace
CREATE OR REPLACE FUNCTION public.user_belongs_to_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND membership_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view & update their own profile
CREATE POLICY "Profiles are viewable by owner" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles can be updated by owner" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces: Members can view their workspaces
CREATE POLICY "Workspaces viewable by members" ON public.workspaces
  FOR SELECT USING (public.user_belongs_to_workspace(id) OR owner_id = auth.uid());

CREATE POLICY "Workspaces manageable by owners" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());

-- Workspace Members
CREATE POLICY "Members viewable within workspace" ON public.workspace_members
  FOR SELECT USING (public.user_belongs_to_workspace(workspace_id));

-- Plans: Publicly readable by everyone
CREATE POLICY "Plans are publicly viewable" ON public.plans
  FOR SELECT USING (is_active = TRUE);

-- Subscriptions: Viewable by workspace members
CREATE POLICY "Subscriptions viewable by workspace members" ON public.subscriptions
  FOR SELECT USING (public.user_belongs_to_workspace(workspace_id));

-- Payment Transactions: Viewable by workspace members
CREATE POLICY "Transactions viewable by workspace members" ON public.payment_transactions
  FOR SELECT USING (public.user_belongs_to_workspace(workspace_id));

-- Templates: Published templates are viewable by everyone
CREATE POLICY "Templates are publicly viewable" ON public.templates
  FOR SELECT USING (status = 'published');

-- Invitations:
-- 1. Workspace members can view and manage their invitations
CREATE POLICY "Invitations manageable by workspace members" ON public.invitations
  FOR ALL USING (public.user_belongs_to_workspace(workspace_id));

-- 2. Published invitations are readable by ANYONE via slug
CREATE POLICY "Published invitations viewable by public" ON public.invitations
  FOR SELECT USING (status = 'published');

-- Invitation Sections: Publicly viewable if invitation is published, or editable by workspace members
CREATE POLICY "Sections viewable by public if published" ON public.invitation_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = invitation_sections.invitation_id AND status = 'published'
    )
  );

CREATE POLICY "Sections manageable by workspace members" ON public.invitation_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = invitation_sections.invitation_id 
        AND public.user_belongs_to_workspace(invitations.workspace_id)
    )
  );

-- Guests: Only workspace members can manage guests (NEVER publicly expose full guest list!)
CREATE POLICY "Guests manageable only by workspace members" ON public.guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = guests.invitation_id 
        AND public.user_belongs_to_workspace(invitations.workspace_id)
    )
  );

-- RSVPs: Public can INSERT RSVP for published invitations; Workspace members can SELECT & manage
CREATE POLICY "Public can submit RSVP to published invitation" ON public.rsvps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = rsvps.invitation_id AND status = 'published'
    )
  );

CREATE POLICY "RSVPs viewable by workspace members" ON public.rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = rsvps.invitation_id 
        AND public.user_belongs_to_workspace(invitations.workspace_id)
    )
  );

-- Wishes: Public can INSERT wishes and SELECT approved wishes; Workspace members can moderate
CREATE POLICY "Public can submit wishes to published invitation" ON public.wishes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = wishes.invitation_id AND status = 'published'
    )
  );

CREATE POLICY "Public can view approved wishes" ON public.wishes
  FOR SELECT USING (
    moderation_status = 'approved' AND EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = wishes.invitation_id AND status = 'published'
    )
  );

CREATE POLICY "Wishes manageable by workspace members" ON public.wishes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invitations 
      WHERE id = wishes.invitation_id 
        AND public.user_belongs_to_workspace(invitations.workspace_id)
    )
  );

-- Vendor Clients: Only workspace members
CREATE POLICY "Vendor clients manageable by workspace members" ON public.vendor_clients
  FOR ALL USING (public.user_belongs_to_workspace(workspace_id));

-- Publish Credits: Viewable by workspace members
CREATE POLICY "Publish credits viewable by workspace members" ON public.publish_credits
  FOR SELECT USING (public.user_belongs_to_workspace(workspace_id));

-- ====================================================================
-- 4. CONCURRENCY-SAFE GUEST LIMIT FUNCTION
-- ====================================================================

/**
 * Atomic function to create a guest record while enforcing the invitation's subscription limit.
 * Concurrency safety: Locks the parent invitation row with FOR UPDATE during the transaction.
 *
 * Entitlement rules:
 * - Free: 100 max guests per invitation
 * - Personal Plus: 1,000 max guests per invitation
 * - Creator Pro: Unlimited (null in max_guests_per_invitation, is_unlimited_guests = true)
 * - Vendor Studio: Unlimited (null in max_guests_per_invitation, is_unlimited_guests = true)
 *
 * Scope: Per individual invitation.
 * RSVP submissions do NOT count as guest records.
 */
CREATE OR REPLACE FUNCTION public.check_and_create_guest(
  p_invitation_id UUID,
  p_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_pax_limit INT DEFAULT 1,
  p_invitation_token TEXT DEFAULT NULL,
  p_qr_code_token TEXT DEFAULT NULL
)
RETURNS public.guests AS $$
DECLARE
  v_workspace_id UUID;
  v_current_count INT;
  v_max_guests INT;
  v_is_unlimited BOOLEAN;
  v_entitlements JSONB;
  v_guest public.guests;
  v_final_inv_token TEXT;
  v_final_qr_token TEXT;
BEGIN
  -- 1. Concurrency lock on the invitation row to prevent race conditions
  SELECT workspace_id INTO v_workspace_id
  FROM public.invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVITATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Count current registered guests for THIS specific invitation
  SELECT COUNT(*) INTO v_current_count
  FROM public.guests
  WHERE invitation_id = p_invitation_id;

  -- 3. Retrieve workspace active subscription plan entitlements
  SELECT p.entitlements INTO v_entitlements
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.workspace_id = v_workspace_id
    AND s.status = 'active'
  LIMIT 1;

  -- If workspace has no active subscription, default strictly to FREE plan entitlements
  IF v_entitlements IS NULL THEN
    SELECT entitlements INTO v_entitlements
    FROM public.plans
    WHERE slug = 'free'
    LIMIT 1;
  END IF;

  -- 4. Parse entitlements
  v_is_unlimited := COALESCE((v_entitlements->>'is_unlimited_guests')::boolean, FALSE);
  
  -- If not marked unlimited, fetch numeric limit (defaulting to 100 for safety)
  IF v_is_unlimited AND (v_entitlements->>'max_guests_per_invitation') IS NULL THEN
    v_max_guests := NULL;
  ELSE
    v_max_guests := COALESCE((v_entitlements->>'max_guests_per_invitation')::int, 100);
  END IF;

  -- 5. Enforce finite limit
  IF v_max_guests IS NOT NULL AND v_current_count >= v_max_guests THEN
    RAISE EXCEPTION 'EXCEEDED_GUEST_LIMIT: Undangan ini telah mencapai batas maksimum % tamu.', v_max_guests
      USING ERRCODE = 'P0003';
  END IF;

  -- 6. Generate tokens if not provided
  v_final_inv_token := COALESCE(p_invitation_token, encode(gen_random_bytes(12), 'hex'));
  v_final_qr_token := COALESCE(p_qr_code_token, encode(gen_random_bytes(16), 'hex'));

  -- 7. Insert the guest record atomically
  INSERT INTO public.guests (
    invitation_id,
    name,
    phone,
    email,
    category,
    pax_limit,
    invitation_token,
    qr_code_token
  ) VALUES (
    p_invitation_id,
    p_name,
    p_phone,
    p_email,
    p_category,
    COALESCE(p_pax_limit, 1),
    v_final_inv_token,
    v_final_qr_token
  )
  RETURNING * INTO v_guest;

  RETURN v_guest;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 5. SEED DATA (PLANS & 5 INITIAL TEMPLATES)
-- ====================================================================

-- 1. SEED PLANS & ENTITLEMENTS
INSERT INTO public.plans (id, name, slug, billing_period, price_amount, currency, entitlements, is_active)
VALUES
  (
    'plan_free',
    'Free',
    'free',
    'monthly',
    0,
    'IDR',
    '{
      "max_draft_invitations": 1,
      "max_active_invitations": 1,
      "max_guests_per_invitation": 100,
      "is_unlimited_guests": false,
      "can_use_visual_editor": false,
      "can_use_premium_templates": false,
      "can_remove_branding": false,
      "can_use_custom_domain": false,
      "can_use_qr_checkin": false,
      "can_export_guest_data": false,
      "max_team_seats": 1,
      "monthly_publish_credits": 0,
      "has_analytics": false,
      "has_multi_client_workspace": false
    }'::jsonb,
    TRUE
  ),
  (
    'plan_personal_plus_monthly',
    'Personal Plus',
    'personal-plus',
    'monthly',
    39000,
    'IDR',
    '{
      "max_draft_invitations": 5,
      "max_active_invitations": 3,
      "max_guests_per_invitation": 1000,
      "is_unlimited_guests": false,
      "can_use_visual_editor": true,
      "can_use_premium_templates": true,
      "can_remove_branding": true,
      "can_use_custom_domain": false,
      "can_use_qr_checkin": false,
      "can_export_guest_data": true,
      "max_team_seats": 1,
      "monthly_publish_credits": 3,
      "has_analytics": true,
      "has_multi_client_workspace": false
    }'::jsonb,
    TRUE
  ),
  (
    'plan_personal_plus_annual',
    'Personal Plus',
    'personal-plus',
    'annual',
    299000,
    'IDR',
    '{
      "max_draft_invitations": 5,
      "max_active_invitations": 3,
      "max_guests_per_invitation": 1000,
      "is_unlimited_guests": false,
      "can_use_visual_editor": true,
      "can_use_premium_templates": true,
      "can_remove_branding": true,
      "can_use_custom_domain": false,
      "can_use_qr_checkin": false,
      "can_export_guest_data": true,
      "max_team_seats": 1,
      "monthly_publish_credits": 3,
      "has_analytics": true,
      "has_multi_client_workspace": false
    }'::jsonb,
    TRUE
  ),
  (
    'plan_creator_pro_monthly',
    'Creator Pro',
    'creator-pro',
    'monthly',
    79000,
    'IDR',
    '{
      "max_draft_invitations": 20,
      "max_active_invitations": 10,
      "max_guests_per_invitation": null,
      "is_unlimited_guests": true,
      "can_use_visual_editor": true,
      "can_use_premium_templates": true,
      "can_remove_branding": true,
      "can_use_custom_domain": true,
      "can_use_qr_checkin": true,
      "can_export_guest_data": true,
      "max_team_seats": 1,
      "monthly_publish_credits": 10,
      "has_analytics": true,
      "has_multi_client_workspace": false
    }'::jsonb,
    TRUE
  ),
  (
    'plan_creator_pro_annual',
    'Creator Pro',
    'creator-pro',
    'annual',
    599000,
    'IDR',
    '{
      "max_draft_invitations": 20,
      "max_active_invitations": 10,
      "max_guests_per_invitation": null,
      "is_unlimited_guests": true,
      "can_use_visual_editor": true,
      "can_use_premium_templates": true,
      "can_remove_branding": true,
      "can_use_custom_domain": true,
      "can_use_qr_checkin": true,
      "can_export_guest_data": true,
      "max_team_seats": 1,
      "monthly_publish_credits": 10,
      "has_analytics": true,
      "has_multi_client_workspace": false
    }'::jsonb,
    TRUE
  ),
  (
    'plan_vendor_studio_monthly',
    'Vendor Studio',
    'vendor-studio',
    'monthly',
    199000,
    'IDR',
    '{
      "max_draft_invitations": 100,
      "max_active_invitations": null,
      "max_guests_per_invitation": null,
      "is_unlimited_guests": true,
      "can_use_visual_editor": true,
      "can_use_premium_templates": true,
      "can_remove_branding": true,
      "can_use_custom_domain": true,
      "can_use_qr_checkin": true,
      "can_export_guest_data": true,
      "max_team_seats": 3,
      "monthly_publish_credits": 30,
      "has_analytics": true,
      "has_multi_client_workspace": true
    }'::jsonb,
    TRUE
  ),
  (
    'plan_vendor_studio_annual',
    'Vendor Studio',
    'vendor-studio',
    'annual',
    1990000,
    'IDR',
    '{
      "max_draft_invitations": 100,
      "max_active_invitations": null,
      "max_guests_per_invitation": null,
      "is_unlimited_guests": true,
      "can_use_visual_editor": true,
      "can_use_premium_templates": true,
      "can_remove_branding": true,
      "can_use_custom_domain": true,
      "can_use_qr_checkin": true,
      "can_export_guest_data": true,
      "max_team_seats": 3,
      "monthly_publish_credits": 30,
      "has_analytics": true,
      "has_multi_client_workspace": true
    }'::jsonb,
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET
  price_amount = EXCLUDED.price_amount,
  entitlements = EXCLUDED.entitlements,
  updated_at = NOW();

-- 2. SEED FIVE INITIAL TEMPLATES
INSERT INTO public.templates (id, name, slug, description, category, preview_image_url, is_premium, status, default_configuration)
VALUES
  (
    'tpl_minimalist_wedding',
    'Minimalist Wedding',
    'minimalist-wedding',
    'Desain bersih, anggun dengan nuansa warm ivory, tipografi serif modern dan tata letak lapang yang elegan.',
    'wedding',
    '/templates/minimalist-wedding.webp',
    FALSE,
    'published',
    '{
      "theme": {
        "primary_color": "#1F2421",
        "secondary_color": "#C5A880",
        "background_color": "#FCFBF7",
        "card_color": "#FFFFFF",
        "text_primary": "#1F2421",
        "text_secondary": "#636965",
        "accent_gold": "#C5A880",
        "font_heading": "playfair",
        "font_body": "plus-jakarta",
        "cover_layout": "centered",
        "border_radius": "md",
        "background_music_url": "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3",
        "background_music_title": "A Thousand Years (Acoustic)",
        "show_floating_music_button": true
      },
      "sections": [
        {"id": "sec_1", "section_key": "hero", "component_type": "HeroSection", "sort_order": 1, "is_visible": true},
        {"id": "sec_2", "section_key": "couple", "component_type": "CoupleSection", "sort_order": 2, "is_visible": true},
        {"id": "sec_3", "section_key": "events", "component_type": "EventsSection", "sort_order": 3, "is_visible": true},
        {"id": "sec_4", "section_key": "story", "component_type": "StorySection", "sort_order": 4, "is_visible": true},
        {"id": "sec_5", "section_key": "gallery", "component_type": "GallerySection", "sort_order": 5, "is_visible": true},
        {"id": "sec_6", "section_key": "rsvp", "component_type": "RsvpSection", "sort_order": 6, "is_visible": true},
        {"id": "sec_7", "section_key": "wishes", "component_type": "WishesSection", "sort_order": 7, "is_visible": true},
        {"id": "sec_8", "section_key": "gifts", "component_type": "GiftsSection", "sort_order": 8, "is_visible": true},
        {"id": "sec_9", "section_key": "closing", "component_type": "ClosingSection", "sort_order": 9, "is_visible": true}
      ]
    }'::jsonb
  ),
  (
    'tpl_elegant_floral',
    'Elegant Floral Wedding',
    'elegant-floral-wedding',
    'Sentuhan bunga botanikal berkelas dengan palet champagne lembut dan aksen rose gold yang memikat.',
    'wedding',
    '/templates/elegant-floral.webp',
    TRUE,
    'published',
    '{
      "theme": {
        "primary_color": "#2C2B29",
        "secondary_color": "#D4A373",
        "background_color": "#FAF7F2",
        "card_color": "#FFFFFF",
        "text_primary": "#2C2B29",
        "text_secondary": "#7D7973",
        "accent_gold": "#D4A373",
        "font_heading": "cormorant",
        "font_body": "inter",
        "cover_layout": "framed",
        "border_radius": "lg",
        "background_music_url": "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3",
        "background_music_title": "Canon in D (Orchestral)",
        "show_floating_music_button": true
      },
      "sections": [
        {"id": "sec_1", "section_key": "hero", "component_type": "HeroSection", "sort_order": 1, "is_visible": true},
        {"id": "sec_2", "section_key": "couple", "component_type": "CoupleSection", "sort_order": 2, "is_visible": true},
        {"id": "sec_3", "section_key": "events", "component_type": "EventsSection", "sort_order": 3, "is_visible": true},
        {"id": "sec_4", "section_key": "gallery", "component_type": "GallerySection", "sort_order": 4, "is_visible": true},
        {"id": "sec_5", "section_key": "rsvp", "component_type": "RsvpSection", "sort_order": 5, "is_visible": true},
        {"id": "sec_6", "section_key": "wishes", "component_type": "WishesSection", "sort_order": 6, "is_visible": true},
        {"id": "sec_7", "section_key": "gifts", "component_type": "GiftsSection", "sort_order": 7, "is_visible": true},
        {"id": "sec_8", "section_key": "closing", "component_type": "ClosingSection", "sort_order": 8, "is_visible": true}
      ]
    }'::jsonb
  ),
  (
    'tpl_modern_dark',
    'Modern Dark Wedding',
    'modern-dark-wedding',
    'Nuansa gelap premium berkelas (moody charcoal) berpadu kilau emas tembaga yang mewah dan memikat.',
    'wedding',
    '/templates/modern-dark.webp',
    TRUE,
    'published',
    '{
      "theme": {
        "primary_color": "#F3EFE6",
        "secondary_color": "#D4AF37",
        "background_color": "#121413",
        "card_color": "#1C1F1D",
        "text_primary": "#F7F5F0",
        "text_secondary": "#A2A7A4",
        "accent_gold": "#D4AF37",
        "font_heading": "cinzel",
        "font_body": "plus-jakarta",
        "cover_layout": "fullscreen",
        "border_radius": "md",
        "background_music_url": "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3",
        "background_music_title": "Moonlight Sonata (Modern Piano)",
        "show_floating_music_button": true
      },
      "sections": [
        {"id": "sec_1", "section_key": "hero", "component_type": "HeroSection", "sort_order": 1, "is_visible": true},
        {"id": "sec_2", "section_key": "couple", "component_type": "CoupleSection", "sort_order": 2, "is_visible": true},
        {"id": "sec_3", "section_key": "events", "component_type": "EventsSection", "sort_order": 3, "is_visible": true},
        {"id": "sec_4", "section_key": "story", "component_type": "StorySection", "sort_order": 4, "is_visible": true},
        {"id": "sec_5", "section_key": "gallery", "component_type": "GallerySection", "sort_order": 5, "is_visible": true},
        {"id": "sec_6", "section_key": "rsvp", "component_type": "RsvpSection", "sort_order": 6, "is_visible": true},
        {"id": "sec_7", "section_key": "wishes", "component_type": "WishesSection", "sort_order": 7, "is_visible": true},
        {"id": "sec_8", "section_key": "gifts", "component_type": "GiftsSection", "sort_order": 8, "is_visible": true},
        {"id": "sec_9", "section_key": "closing", "component_type": "ClosingSection", "sort_order": 9, "is_visible": true}
      ]
    }'::jsonb
  ),
  (
    'tpl_birthday_celebration',
    'Birthday Celebration',
    'birthday-celebration',
    'Gembira, cerah dan dinamis untuk perayaan ulang tahun, sweet seventeen, atau anniversary dengan konfeti emas.',
    'birthday',
    '/templates/birthday-celebration.webp',
    FALSE,
    'published',
    '{
      "theme": {
        "primary_color": "#1B2430",
        "secondary_color": "#E5A93C",
        "background_color": "#FBF9F5",
        "card_color": "#FFFFFF",
        "text_primary": "#1B2430",
        "text_secondary": "#515C6F",
        "accent_gold": "#E5A93C",
        "font_heading": "playfair",
        "font_body": "outfit",
        "cover_layout": "centered",
        "border_radius": "lg",
        "background_music_url": "https://assets.mixkit.co/music/preview/mixkit-celebration-party-loop-1123.mp3",
        "background_music_title": "Celebration Joy",
        "show_floating_music_button": true
      },
      "sections": [
        {"id": "sec_1", "section_key": "hero", "component_type": "HeroSection", "sort_order": 1, "is_visible": true},
        {"id": "sec_2", "section_key": "events", "component_type": "EventsSection", "sort_order": 2, "is_visible": true},
        {"id": "sec_3", "section_key": "gallery", "component_type": "GallerySection", "sort_order": 3, "is_visible": true},
        {"id": "sec_4", "section_key": "rsvp", "component_type": "RsvpSection", "sort_order": 4, "is_visible": true},
        {"id": "sec_5", "section_key": "wishes", "component_type": "WishesSection", "sort_order": 5, "is_visible": true},
        {"id": "sec_6", "section_key": "gifts", "component_type": "GiftsSection", "sort_order": 6, "is_visible": true},
        {"id": "sec_7", "section_key": "closing", "component_type": "ClosingSection", "sort_order": 7, "is_visible": true}
      ]
    }'::jsonb
  ),
  (
    'tpl_corporate_event',
    'Corporate Event',
    'corporate-event',
    'Profesional, prestisius, dan tertata rapi untuk seminar, gala dinner korporat, konferensi, dan peluncuran produk.',
    'corporate',
    '/templates/corporate-event.webp',
    TRUE,
    'published',
    '{
      "theme": {
        "primary_color": "#0F172A",
        "secondary_color": "#0284C7",
        "background_color": "#F8FAFC",
        "card_color": "#FFFFFF",
        "text_primary": "#0F172A",
        "text_secondary": "#475569",
        "accent_gold": "#0284C7",
        "font_heading": "serif",
        "font_body": "inter",
        "cover_layout": "split",
        "border_radius": "sm",
        "background_music_url": null,
        "background_music_title": null,
        "show_floating_music_button": false
      },
      "sections": [
        {"id": "sec_1", "section_key": "hero", "component_type": "HeroSection", "sort_order": 1, "is_visible": true},
        {"id": "sec_2", "section_key": "events", "component_type": "EventsSection", "sort_order": 2, "is_visible": true},
        {"id": "sec_3", "section_key": "rsvp", "component_type": "RsvpSection", "sort_order": 3, "is_visible": true},
        {"id": "sec_4", "section_key": "closing", "component_type": "ClosingSection", "sort_order": 4, "is_visible": true}
      ]
    }'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  preview_image_url = EXCLUDED.preview_image_url,
  is_premium = EXCLUDED.is_premium,
  default_configuration = EXCLUDED.default_configuration,
  updated_at = NOW();
