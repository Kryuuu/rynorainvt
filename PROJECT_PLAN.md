# Rynora Invite — SaaS Platform Project Plan

## Executive Summary
**Rynora Invite** is a multi-tenant subscription-based digital invitation SaaS platform designed for individual event hosts (weddings, birthdays, aqiqah, corporate events, graduations) and professional invitation vendors / creative studios.

---

## 1. Project Objectives & Deliverables
- **Core SaaS Engine**: Multi-tenant workspace architecture supporting Personal Workspaces and Vendor Workspaces.
- **Dual Editing Experience**:
  - *Simple Editor*: 8-step guided wizard for non-technical users.
  - *Advanced Visual Editor*: Section-based builder with live responsive canvas preview (Mobile/Tablet/Desktop), layout customization, and autosave.
- **Guest Management & RSVP**:
  - Personal invitation tokens & shareable URLs (`/i/[slug]`).
  - QR Code generator & Check-In verification.
  - CSV guest import with real-time remaining quota validation.
  - Strict guest limits per invitation:
    - **Free**: 100 max registered guests / invitation.
    - **Personal Plus**: 1,000 max registered guests / invitation.
    - **Creator Pro**: Unlimited guests / invitation.
    - **Vendor Studio**: Unlimited guests / invitation.
  - Concurrency-safe database enforcement & transactional integrity.
- **Template Engine**: 5 distinct design templates (Minimalist Wedding, Elegant Floral Wedding, Modern Dark Wedding, Birthday Celebration, Corporate Event).
- **Vendor Portal**: Client management, project management, team seats (Owner, Admin, Editor), publication credit accounting, custom branding.
- **Admin Portal**: User management, template management, subscription & entitlement configuration, transaction reconciliation, audit logs.
- **Payments & Billing**: Modular Indonesian payment gateway adapter (Midtrans Snap & Xendit Invoice sandbox) with HMAC webhook signature verification, monthly/annual billing, publication credits, and safe downgrade rules (never deleting existing data).

---

## 2. Phase-by-Phase Roadmap

### Phase 1: Inspection, Architecture & Foundations (Current)
- [x] Inspect workspace and initialize Next.js App Router + TypeScript + Tailwind CSS.
- [x] Create `PROJECT_PLAN.md`, `ARCHITECTURE.md`, and `.env.example`.
- [x] Define database schema, RLS policies, and database migration SQL.

### Phase 2: Design System, Supabase Client & Migrations
- [x] Establish luxury brand design system (Ivory `#FCFBF7`, Warm White, Charcoal `#1F2421`, Muted Champagne `#E8DFD8`, Muted Gold `#C5A880`).
- [x] Setup Supabase clients (Browser client, Server client, Admin/Service Role client).
- [x] Implement comprehensive SQL migrations:
  - `profiles`, `workspaces`, `workspace_members`, `plans`, `subscriptions`, `payment_transactions`, `templates`, `invitations`, `invitation_sections`, `guests`, `rsvps`, `wishes`, `media_assets`, `publish_credits`, `audit_logs`, `vendor_clients`.
  - Stored procedures: `check_and_create_guest()`, `get_workspace_entitlements()`, `consume_publish_credit()`.
  - Row Level Security (RLS) policies for multi-tenancy and role isolation.
  - Safe initial seed data for plans, categories, and 5 templates.

### Phase 3: Public Website & Template Showcase
- [x] Marketing Homepage (Hero, Live interactive preview, Categories, How It Works, Simple vs Visual Editor, Personal vs Vendor, Pricing comparison, FAQ, Footer).
- [x] Template Catalog (`/templates`) with category filtering, search, and responsive mobile/desktop live preview dialogs.
- [x] Public Invitation Experience (`/i/[slug]`):
  - Cover hero with animation & countdown.
  - Couple/Host information & Love story timeline.
  - Event schedules (Akad/Ceremony & Reception) with Google Maps navigation.
  - Interactive RSVP submission with attendance counts & messages.
  - Public Guest Wishes stream with moderation status.
  - Digital Gift / Angpao with bank accounts and copy-to-clipboard.
  - Floating background music player with auto-play toggle on interaction.
  - Personalized guest greeting (`?to=...` or secure token).

### Phase 4: Dashboard, Simple Editor & Guest Engine
- [x] User Dashboard (`/dashboard`): Workspace switcher, active invitations, guest statistics, subscription badge.
- [x] Simple Editor (`/editor/new` & `/editor/[id]` step-based wizard):
  - Step 1: Event Category.
  - Step 2: Template Selection.
  - Step 3: Event Info (Couple/Organizer, date, time, venue, address, maps).
  - Step 4: Media Assets (Cover image, gallery, audio).
  - Step 5: Visual Theme (Color palette, typography, layout options).
  - Step 6: Section configuration (Enable/disable timeline, gifts, RSVP, gallery, music).
  - Step 7: Live Preview (Mobile & Desktop).
  - Step 8: Publication & Entitlement checks.
- [x] Guest Management (`/dashboard/invitations/[id]/guests`):
  - Add single guest with phone/notes.
  - Bulk CSV import with capacity validation against plan limits.
  - Strict enforcement (100 for Free, 1000 for Personal Plus, Unlimited for Pro/Vendor).
  - Export guests, generate personalized links, QR code check-in modal.

### Phase 5: Advanced Visual Editor
- [x] Visual Builder layout (`/editor/[id]/visual`):
  - Left panel: Section management (reorder, duplicate, add, hide/show, delete).
  - Center: Live responsive iframe/canvas preview (Mobile, Tablet, Desktop) with selection highlights.
  - Right panel: Typography, colors, spacing, alignment, backgrounds, content properties.
  - Autosave with debouncing & dirty state indicator.
  - Undo / Redo history state stack.

### Phase 6: Dedicated Vendor Workspace
- [x] Vendor Portal (`/vendor`):
  - Overview KPI metrics: Clients, projects, published invitations, publication credits.
  - Client Management: Add/edit client details, assign projects.
  - Project Management: Client invitation creation, duplicate, archive, publish with credits.
  - Team Seats: Owner, Admin, Editor invitations and role management.
  - Vendor Branding: Studio name, logo, contact info, brand badge on invitations.

### Phase 7: Subscription, Entitlements & Payment Gateway
- [x] Centralized plan entitlement evaluation (`lib/billing/entitlements.ts`).
- [x] Modular Payment Gateway: Midtrans Snap & Xendit Invoice sandbox adapter.
- [x] Webhook Handler (`/api/webhooks/payments`) with HMAC signature validation, idempotency key checking, period extension, and audit logging.
- [x] Safe downgrade lifecycle: Preserve all existing guest data; block additions if count exceeds new plan limit.

### Phase 8: Administrative Control Center
- [x] Admin Portal (`/admin`):
  - Overview metrics (Total users, active workspaces, revenue, subscriptions).
  - User management (search, detail view, suspend/activate).
  - Template manager (create, edit JSON config, publish/unpublish, toggle premium).
  - Subscription & Plan editor (modify prices, billing cycles, quotas).
  - Payment transaction auditor with status filter & manual sync.
  - Audit log viewer.

### Phase 9: Testing, Quality Assurance & Production Readiness
- [x] Test suite: Guest limit enforcement, CSV capacity check, webhook signature validation, workspace isolation, invitation slug uniqueness.
- [x] Type checking (`tsc --noEmit`) and production build (`npm run build`).
- [x] Deployment documentation and environment checklist.

---

## 3. Success Metrics & Verification Protocol
- **Guest Limits**: Verified strictly per invitation (Free stops at 100, Personal Plus stops at 1000, Creator Pro & Vendor allow >1000).
- **Security**: Supabase RLS isolates personal and vendor tenant data. No secret keys in client bundles.
- **Reliability**: Webhook processing is idempotent and immune to replay attacks.
- **UX**: Fast load time, responsive on mobile devices, clean aesthetic aligned with Indonesian wedding & event industry standards.
