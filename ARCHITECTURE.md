# Rynora Invite — System Architecture & Technical Specifications

## 1. Architectural Philosophy
Rynora Invite is engineered as a **Modular Monolith** using Next.js App Router (React 19, TypeScript strict mode, Tailwind CSS). It combines high-performance server-side rendering for public invitation pages (`/i/[slug]`) and SEO-optimized marketing routes with highly interactive client interfaces for the dual editors and multi-tenant management dashboards.

```
+----------------------------------------------------------------------------------+
|                                  NEXT.JS FRONTEND                                |
|  Marketing ((marketing))  |  Public Invitation (/i/[slug])  | Dashboard & Studio |
+----------------------------------------------------------------------------------+
|                                    APP LAYER                                     |
|  Server Actions   |   Route Handlers (/api/webhooks)   |   Client Components     |
|  - Entitlements   |   - Midtrans / Xendit HMAC Verify  |   - Simple Wizard       |
|  - Guest Guards   |   - Idempotent Transaction Updates |   - Visual Builder      |
+----------------------------------------------------------------------------------+
|                                SUPABASE DATA LAYER                               |
|  - Supabase Auth (JWT, Row Level Security session context)                       |
|  - PostgreSQL Database (Tables, Foreign Keys, Indexes, Check Constraints)       |
|  - Stored Procedures & Triggers (Atomic guest limit counter & credit ledger)     |
|  - Storage Buckets (Public invitation covers/music, Private vendor assets)       |
+----------------------------------------------------------------------------------+
```

---

## 2. Multi-Tenant Workspace & Role Model
Every user belongs to at least one workspace upon registration:
- **Personal Workspace** (`type: 'personal'`): Default workspace created for regular users. Focuses strictly on the user's personal events without team/client management overhead.
- **Vendor Workspace** (`type: 'vendor'`): Provisioned for studios, wedding planners, and freelance designers. Includes client records, project allocation, publication credits ledger, team seats, and white-label vendor branding.

### Roles & RBAC:
1. `personal_user`: Can manage their own invitations, guests, and subscription in their personal workspace.
2. `vendor_owner`: Full administrative rights over their vendor workspace, billing, client roster, and team members.
3. `vendor_admin`: Can manage projects, clients, and invitations; cannot alter workspace billing or delete workspace.
4. `vendor_editor`: Can edit invitations and guest lists assigned to them; cannot invite team members or publish without credits.
5. `platform_admin`: Superuser role governed by system metadata or designated admin flag in `profiles.is_platform_admin`.

---

## 3. Database Schema Design & Relationships

### Core Entities:
- **`profiles`**: User metadata, avatar, phone, system admin flag (`references auth.users.id`).
- **`workspaces`**: Tenant container (`id`, `name`, `slug`, `type`, `owner_id`, `settings`).
- **`workspace_members`**: Link table between `workspaces` and `profiles` (`workspace_id`, `user_id`, `role`, `membership_status`).
- **`plans`**: Authoritative subscription tier definitions:
  - `id`, `name`, `slug`, `billing_period`, `price_amount`, `currency`, `entitlements JSONB`, `is_active`.
- **`subscriptions`**: Active workspace plan instances (`workspace_id`, `plan_id`, `status`, `provider`, `current_period_start`, `current_period_end`, `cancel_at_period_end`).
- **`payment_transactions`**: Audit trail of checkout sessions, payments, and renewals (`provider_transaction_id`, `workspace_id`, `amount`, `status`, `idempotency_key`, `paid_at`).
- **`templates`**: Ready-to-use invitation starter kits (`name`, `slug`, `category`, `preview_image_url`, `is_premium`, `default_configuration JSONB`).
- **`invitations`**: The core invitation record:
  - `id`, `workspace_id`, `created_by`, `template_id`, `title`, `slug` (unique), `category`, `status` ('draft', 'published', 'archived'), `event_data JSONB`, `theme_configuration JSONB`, `published_at`.
- **`invitation_sections`**: Structured modular content blocks for visual building (`section_key`, `component_type`, `configuration JSONB`, `sort_order`, `is_visible`).
- **`guests`**: Guest records for an invitation:
  - `id`, `invitation_id`, `name`, `phone`, `email`, `category`, `pax_limit`, `invitation_token`, `qr_code_token`, `checked_in_at`.
- **`rsvps`**: Attendance confirmations (`invitation_id`, `guest_id`, `attendance_status`, `attendee_count`, `message`, `submitted_at`).
- **`wishes`**: Guest book messages (`invitation_id`, `guest_name`, `message`, `moderation_status`).
- **`publish_credits`**: Ledger tracking publication quota usage for vendor plans.
- **`vendor_clients`**: Client directory for vendor workspaces (`workspace_id`, `name`, `phone`, `email`, `notes`).
- **`audit_logs`**: System audit trail for security-sensitive actions.

---

## 4. Mandatory Guest Limit Enforcement Architecture

### Non-Negotiable Limits:
| Plan Slug | Plan Name | Registered Guests Allowed per Invitation |
| :--- | :--- | :---: |
| `free` | Free | **100** |
| `personal-plus` | Personal Plus | **1,000** |
| `creator-pro` | Creator Pro | **Unlimited** (`null` in entitlements) |
| `vendor-studio` | Vendor Studio | **Unlimited** (`null` in entitlements) |

### Invariant Rules:
1. **Per-Invitation Scope**: Limits apply to each invitation independently, never pooled across the account.
2. **Entity Definition**: 1 registered guest record in the `guests` table = 1 unit consumed. A guest record with an attendee count of 4 (e.g., family ticket) counts as **1 guest record**, not 4.
3. **RSVP Independence**: RSVP submissions do **not** increment or affect the registered guest count.
4. **Explicit Unlimited Representation**: In `plans.entitlements.max_guests_per_invitation`, unlimited is represented explicitly as `null` with `is_unlimited_guests: true`. Missing or malformed configurations default strictly to `100` (Free tier safety fallback).
5. **Atomic Concurrency-Safe Enforcement**: Implemented in PostgreSQL via `check_and_create_guest()` stored procedure using `SELECT COUNT(*) ... FOR UPDATE` or an active count guard within the transaction to eliminate race conditions.
6. **Safe Downgrade Policy**: When a workspace transitions to a lower tier or lapses:
   - Zero existing guest records are deleted or hidden.
   - If the current count >= new limit, additional guest insertions are rejected with an informative upgrade prompt.

---

## 5. Dual Editor Architecture

### A. Simple Editor
A guided step-based progressive disclosure flow:
1. Category selection
2. Template gallery selection
3. Structured event details (Couple, Date, Time, Venue, Maps)
4. Media assets (Covers, Gallery, Audio)
5. Theme styling (Palette, Fonts, Backgrounds)
6. Optional section toggles (RSVP, Wishes, Gift/Angpao, Timeline)
7. Responsive preview (Device selector)
8. Entitlement verification & Publish

### B. Advanced Visual Editor
A section-driven website builder:
- **Component Registry**: Strict JSON Schema definitions for every block (`hero`, `couple`, `event_details`, `timeline`, `gallery`, `rsvp`, `wishes`, `digital_gift`, `closing`).
- **Left Sidebar**: Drag/reorder, duplicate, add, hide/show, and delete sections.
- **Center Canvas**: Live responsive iframe rendering the actual invitation with immediate state synchronization.
- **Right Inspector**: Real-time property inspector for colors, typography, paddings, borders, and section-specific content.
- **State Engine**: Client-side history buffer (Undo/Redo), debounced autosave (1,500ms), and dirty-state indicators.

---

## 6. Payment & Billing Architecture (Indonesian Context)
- Supported gateway adapters: **Midtrans Snap** and **Xendit Invoice**.
- Sandbox mode enabled by default with mock simulator option for local verification without live credentials.
- **Webhook Security**:
  - SHA-512 / HMAC signature verification on every incoming payment notification.
  - Idempotency key recorded in `payment_transactions`.
  - Transaction state machine: `pending` -> `settlement` -> `expired` / `failed`.
  - Subscription period auto-computed on `settlement` event.
  - Publication credit grants recorded immediately in the ledger.

---

## 7. Security & Row Level Security (RLS)
- Every table has RLS enabled.
- Workspace membership helper function `auth.user_in_workspace(ws_id)` verifies tenant access.
- Invitations public access policy allows `SELECT` only where `status = 'published'`.
- All service-role operations (billing webhooks, system admin overrides) are strictly contained within server-side route handlers using non-exported Supabase admin clients.
