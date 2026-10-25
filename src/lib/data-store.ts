import { 
  Template, 
  Invitation, 
  Guest, 
  RsvpResponse, 
  GuestWish, 
  Workspace, 
  UserProfile, 
  Subscription, 
  PaymentTransaction,
  VendorClient,
  PublishCredit,
  AuditLog
} from '@/types';
import { INITIAL_PLANS, DEFAULT_FREE_ENTITLEMENTS, DEFAULT_VENDOR_STUDIO_ENTITLEMENTS } from './billing/plans';
import { checkGuestCreationLimit } from './billing/entitlements';
import { generateSecureToken } from './utils';

const STATIC_TIMESTAMP = '2026-10-25T00:00:00.000Z';

// Initial Mock Profiles
export const MOCK_USERS: Record<string, UserProfile> = {
  user_personal: {
    id: 'user_personal_01',
    full_name: 'Andi Pratama',
    email: 'andi.pratama@gmail.com',
    phone: '081234567890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_platform_admin: false,
    status: 'active',
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  user_vendor: {
    id: 'user_vendor_01',
    full_name: 'Budi Santoso (Studio Kreasi)',
    email: 'budi@lenterastudio.id',
    phone: '081987654321',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    is_platform_admin: false,
    status: 'active',
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  user_creator: {
    id: 'user_creator_01',
    full_name: 'Citra Lestari',
    email: 'citra.lestari@gmail.com',
    phone: '082155667788',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_platform_admin: false,
    status: 'active',
    created_at: '2026-10-18T00:00:00.000Z',
    updated_at: '2026-10-18T00:00:00.000Z',
  },
  user_free: {
    id: 'user_free_01',
    full_name: 'Dian Permatasari',
    email: 'dian.permatasari@gmail.com',
    phone: '085233441122',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    is_platform_admin: false,
    status: 'active',
    created_at: '2026-10-22T00:00:00.000Z',
    updated_at: '2026-10-22T00:00:00.000Z',
  },
  user_admin: {
    id: '53860f2b-2808-43d2-9d53-066d504e4a20',
    full_name: 'Ahmad Shawity',
    email: 'ahmadshawity@gmail.com',
    phone: '081112223334',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    is_platform_admin: true,
    status: 'active',
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
};

// Initial Mock Workspaces
export const MOCK_WORKSPACES: Record<string, Workspace> = {
  ws_personal: {
    id: 'ws_personal_01',
    name: 'Andi & Siti Wedding',
    slug: 'andi-siti-personal',
    type: 'personal',
    owner_id: 'user_personal_01',
    settings: {},
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  ws_vendor: {
    id: 'ws_vendor_01',
    name: 'Lentera Creative Studio',
    slug: 'lentera-studio',
    type: 'vendor',
    owner_id: 'user_vendor_01',
    settings: {
      brand_name: 'Lentera Studio',
      brand_logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      brand_color: '#C5A880',
      contact_phone: '081233445566',
      contact_email: 'halo@lenterastudio.id',
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  ws_creator: {
    id: 'ws_creator_01',
    name: 'Citra Creative Invitations',
    slug: 'citra-creative',
    type: 'personal',
    owner_id: 'user_creator_01',
    settings: {},
    created_at: '2026-10-18T00:00:00.000Z',
    updated_at: '2026-10-18T00:00:00.000Z',
  },
  ws_free: {
    id: 'ws_free_01',
    name: 'Dian & Dimas Engagement',
    slug: 'dian-dimas',
    type: 'personal',
    owner_id: 'user_free_01',
    settings: {},
    created_at: '2026-10-22T00:00:00.000Z',
    updated_at: '2026-10-22T00:00:00.000Z',
  },
  ws_admin: {
    id: 'ws_admin_01',
    name: 'Rynora Platform HQ',
    slug: 'rynora-admin',
    type: 'vendor',
    owner_id: '53860f2b-2808-43d2-9d53-066d504e4a20',
    settings: {
      brand_name: 'Rynora Admin HQ',
      brand_color: '#1F2421',
      contact_email: 'ahmadshawity@gmail.com',
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
};

// Initial Mock Subscriptions
export const MOCK_SUBSCRIPTIONS: Record<string, Subscription> = {
  sub_personal: {
    id: 'sub_personal_01',
    workspace_id: 'ws_personal_01',
    plan_id: 'plan_personal_plus_monthly',
    plan: INITIAL_PLANS.find(p => p.id === 'plan_personal_plus_monthly'),
    status: 'active',
    billing_period: 'monthly',
    provider: 'sandbox',
    current_period_start: '2026-10-15T00:00:00.000Z',
    current_period_end: '2026-11-15T00:00:00.000Z',
    cancel_at_period_end: false,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  sub_vendor: {
    id: 'sub_vendor_01',
    workspace_id: 'ws_vendor_01',
    plan_id: 'plan_vendor_studio_annual',
    plan: INITIAL_PLANS.find(p => p.id === 'plan_vendor_studio_annual'),
    status: 'active',
    billing_period: 'annual',
    provider: 'midtrans',
    current_period_start: '2026-09-15T00:00:00.000Z',
    current_period_end: '2027-09-15T00:00:00.000Z',
    cancel_at_period_end: false,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  sub_creator: {
    id: 'sub_creator_01',
    workspace_id: 'ws_creator_01',
    plan_id: 'plan_creator_pro_annual',
    plan: INITIAL_PLANS.find(p => p.id === 'plan_creator_pro_annual'),
    status: 'active',
    billing_period: 'annual',
    provider: 'midtrans',
    current_period_start: '2026-10-18T00:00:00.000Z',
    current_period_end: '2027-10-18T00:00:00.000Z',
    cancel_at_period_end: false,
    created_at: '2026-10-18T00:00:00.000Z',
    updated_at: '2026-10-18T00:00:00.000Z',
  },
  sub_free: {
    id: 'sub_free_01',
    workspace_id: 'ws_free_01',
    plan_id: 'plan_free',
    plan: INITIAL_PLANS.find(p => p.id === 'plan_free'),
    status: 'active',
    billing_period: 'monthly',
    provider: 'sandbox',
    current_period_start: '2026-10-22T00:00:00.000Z',
    current_period_end: '2027-10-22T00:00:00.000Z',
    cancel_at_period_end: false,
    created_at: '2026-10-22T00:00:00.000Z',
    updated_at: '2026-10-22T00:00:00.000Z',
  },
  sub_admin: {
    id: 'sub_admin_01',
    workspace_id: 'ws_admin_01',
    plan_id: 'plan_vendor_studio_annual',
    plan: INITIAL_PLANS.find(p => p.id === 'plan_vendor_studio_annual'),
    status: 'active',
    billing_period: 'annual',
    provider: 'sandbox',
    current_period_start: '2026-10-01T00:00:00.000Z',
    current_period_end: '2099-12-31T23:59:59.000Z',
    cancel_at_period_end: false,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
};

// Comprehensive Initial Payment Transactions (Berhasil, Gagal, Batal, Pending)
export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'TRX-20261025-001',
    order_id: 'ORD-RYN-98214',
    workspace_id: 'ws_vendor_01',
    user_id: 'user_vendor_01',
    user_name: 'Budi Santoso (Studio Kreasi)',
    user_email: 'budi@lenterastudio.id',
    plan_id: 'plan_vendor_studio_annual',
    plan_name: 'Vendor Studio (Tahunan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_99182371',
    amount: 1990000,
    currency: 'IDR',
    status: 'settlement',
    idempotency_key: 'idemp_txn_001',
    payment_method: 'BCA Virtual Account',
    paid_at: '2026-10-25T14:32:00.000Z',
    created_at: '2026-10-25T14:28:10.000Z',
  },
  {
    id: 'TRX-20261024-002',
    order_id: 'ORD-RYN-88123',
    workspace_id: 'ws_personal_01',
    user_id: 'user_personal_01',
    user_name: 'Andi Pratama',
    user_email: 'andi.pratama@gmail.com',
    plan_id: 'plan_personal_plus_monthly',
    plan_name: 'Personal Plus (Bulanan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_88192344',
    amount: 39000,
    currency: 'IDR',
    status: 'settlement',
    idempotency_key: 'idemp_txn_002',
    payment_method: 'QRIS (GoPay/ShopeePay)',
    paid_at: '2026-10-24T10:15:22.000Z',
    created_at: '2026-10-24T10:14:00.000Z',
  },
  {
    id: 'TRX-20261023-003',
    order_id: 'ORD-RYN-77401',
    workspace_id: 'ws_creator_01',
    user_id: 'user_creator_01',
    user_name: 'Citra Lestari',
    user_email: 'citra.lestari@gmail.com',
    plan_id: 'plan_creator_pro_annual',
    plan_name: 'Creator Pro (Tahunan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_77192311',
    amount: 599000,
    currency: 'IDR',
    status: 'capture',
    idempotency_key: 'idemp_txn_003',
    payment_method: 'Kartu Kredit (Visa Platinum)',
    paid_at: '2026-10-23T16:45:00.000Z',
    created_at: '2026-10-23T16:42:30.000Z',
  },
  {
    id: 'TRX-20261024-004',
    order_id: 'ORD-RYN-81920',
    workspace_id: 'ws_hendra_01',
    user_id: 'user_hendra_01',
    user_name: 'Hendra Wijaya',
    user_email: 'hendra.wijaya@outlook.com',
    plan_id: 'plan_creator_pro_monthly',
    plan_name: 'Creator Pro (Bulanan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_81920033',
    amount: 79000,
    currency: 'IDR',
    status: 'expire',
    failure_reason: 'Batas waktu pembayaran (24 jam) via Virtual Account Mandiri telah habis tanpa penerimaan dana.',
    idempotency_key: 'idemp_txn_004',
    payment_method: 'Mandiri Bill Payment',
    paid_at: null,
    created_at: '2026-10-23T09:00:00.000Z',
  },
  {
    id: 'TRX-20261022-005',
    order_id: 'ORD-RYN-65129',
    workspace_id: 'ws_maya_01',
    user_id: 'user_maya_01',
    user_name: 'Maya Kartika',
    user_email: 'maya.kartika@gmail.com',
    plan_id: 'plan_personal_plus_annual',
    plan_name: 'Personal Plus (Tahunan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_65129944',
    amount: 299000,
    currency: 'IDR',
    status: 'deny',
    failure_reason: 'Transaksi ditolak oleh Bank Penerbit Kartu Kredit (Insufficient balance / Security Risk Check).',
    idempotency_key: 'idemp_txn_005',
    payment_method: 'Kartu Kredit (Mastercard)',
    paid_at: null,
    created_at: '2026-10-22T21:10:00.000Z',
  },
  {
    id: 'TRX-20261025-006',
    order_id: 'ORD-RYN-90112',
    workspace_id: 'ws_rizky_01',
    user_id: 'user_rizky_01',
    user_name: 'Rizky Ramadhan',
    user_email: 'rizky.ramadhan@gmail.com',
    plan_id: 'plan_personal_plus_monthly',
    plan_name: 'Personal Plus (Bulanan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_90112455',
    amount: 39000,
    currency: 'IDR',
    status: 'cancel',
    failure_reason: 'Transaksi dibatalkan secara sadar oleh pengguna pada halaman pembayaran checkout Midtrans.',
    idempotency_key: 'idemp_txn_006',
    payment_method: 'BNI Virtual Account',
    paid_at: null,
    created_at: '2026-10-25T11:20:00.000Z',
  },
  {
    id: 'TRX-20261021-007',
    order_id: 'ORD-RYN-51203',
    workspace_id: 'ws_wahyu_01',
    user_id: 'user_wahyu_01',
    user_name: 'Wahyu Hidayat',
    user_email: 'wahyu.hidayat@yahoo.com',
    plan_id: 'plan_creator_pro_annual',
    plan_name: 'Creator Pro (Tahunan)',
    provider: 'midtrans',
    provider_transaction_id: 'mid_snap_51203876',
    amount: 599000,
    currency: 'IDR',
    status: 'cancel',
    failure_reason: 'Pembeli membatalkan pesanan untuk berganti paket ke Vendor Studio.',
    idempotency_key: 'idemp_txn_007',
    payment_method: 'QRIS',
    paid_at: null,
    created_at: '2026-10-21T18:40:00.000Z',
  },
  {
    id: 'TRX-20261026-008',
    order_id: 'ORD-RYN-99881',
    workspace_id: 'ws_free_01',
    user_id: 'user_free_01',
    user_name: 'Dian Permatasari',
    user_email: 'dian.permatasari@gmail.com',
    plan_id: 'plan_personal_plus_monthly',
    plan_name: 'Personal Plus (Bulanan)',
    provider: 'sandbox',
    provider_transaction_id: 'snd_box_9988123',
    amount: 39000,
    currency: 'IDR',
    status: 'pending',
    failure_reason: null,
    idempotency_key: 'idemp_txn_008',
    payment_method: 'Transfer Bank Manual (BCA)',
    paid_at: null,
    created_at: '2026-10-26T00:30:00.000Z',
  },
];

// 5 Rich Initial Templates
export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl_minimalist_wedding',
    name: 'Minimalist Wedding',
    slug: 'minimalist-wedding',
    description: 'Desain bersih, anggun dengan nuansa warm ivory, tipografi serif modern dan tata letak lapang yang elegan.',
    category: 'wedding',
    preview_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    is_premium: false,
    status: 'published',
    default_configuration: {
      theme: {
        primary_color: '#1F2421',
        secondary_color: '#C5A880',
        background_color: '#FCFBF7',
        card_color: '#FFFFFF',
        text_primary: '#1F2421',
        text_secondary: '#636965',
        accent_gold: '#C5A880',
        font_heading: 'playfair',
        font_body: 'plus-jakarta',
        cover_layout: 'centered',
        border_radius: 'md',
        background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
        background_music_title: 'A Thousand Years (Acoustic)',
        show_floating_music_button: true,
      },
      sections: [
        { id: 'sec_1', section_key: 'hero', component_type: 'HeroSection', sort_order: 1, is_visible: true },
        { id: 'sec_2', section_key: 'couple', component_type: 'CoupleSection', sort_order: 2, is_visible: true },
        { id: 'sec_3', section_key: 'events', component_type: 'EventsSection', sort_order: 3, is_visible: true },
        { id: 'sec_4', section_key: 'story', component_type: 'StorySection', sort_order: 4, is_visible: true },
        { id: 'sec_5', section_key: 'gallery', component_type: 'GallerySection', sort_order: 5, is_visible: true },
        { id: 'sec_6', section_key: 'rsvp', component_type: 'RsvpSection', sort_order: 6, is_visible: true },
        { id: 'sec_7', section_key: 'wishes', component_type: 'WishesSection', sort_order: 7, is_visible: true },
        { id: 'sec_8', section_key: 'gifts', component_type: 'GiftsSection', sort_order: 8, is_visible: true },
        { id: 'sec_9', section_key: 'closing', component_type: 'ClosingSection', sort_order: 9, is_visible: true },
      ],
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'tpl_elegant_floral',
    name: 'Elegant Floral Wedding',
    slug: 'elegant-floral-wedding',
    description: 'Sentuhan bunga botanikal berkelas dengan palet champagne lembut dan aksen rose gold yang memikat.',
    category: 'wedding',
    preview_image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
    is_premium: true,
    status: 'published',
    default_configuration: {
      theme: {
        primary_color: '#2C2B29',
        secondary_color: '#D4A373',
        background_color: '#FAF7F2',
        card_color: '#FFFFFF',
        text_primary: '#2C2B29',
        text_secondary: '#7D7973',
        accent_gold: '#D4A373',
        font_heading: 'cormorant',
        font_body: 'inter',
        cover_layout: 'framed',
        border_radius: 'lg',
        background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
        background_music_title: 'Canon in D (Orchestral)',
        show_floating_music_button: true,
      },
      sections: [
        { id: 'sec_1', section_key: 'hero', component_type: 'HeroSection', sort_order: 1, is_visible: true },
        { id: 'sec_2', section_key: 'couple', component_type: 'CoupleSection', sort_order: 2, is_visible: true },
        { id: 'sec_3', section_key: 'events', component_type: 'EventsSection', sort_order: 3, is_visible: true },
        { id: 'sec_4', section_key: 'gallery', component_type: 'GallerySection', sort_order: 4, is_visible: true },
        { id: 'sec_5', section_key: 'rsvp', component_type: 'RsvpSection', sort_order: 5, is_visible: true },
        { id: 'sec_6', section_key: 'wishes', component_type: 'WishesSection', sort_order: 6, is_visible: true },
        { id: 'sec_7', section_key: 'gifts', component_type: 'GiftsSection', sort_order: 7, is_visible: true },
        { id: 'sec_8', section_key: 'closing', component_type: 'ClosingSection', sort_order: 8, is_visible: true },
      ],
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'tpl_modern_dark',
    name: 'Modern Dark Wedding',
    slug: 'modern-dark-wedding',
    description: 'Nuansa gelap premium berkelas (moody charcoal) berpadu kilau emas tembaga yang mewah dan memikat.',
    category: 'wedding',
    preview_image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80',
    is_premium: true,
    status: 'published',
    default_configuration: {
      theme: {
        primary_color: '#F3EFE6',
        secondary_color: '#D4AF37',
        background_color: '#121413',
        card_color: '#1C1F1D',
        text_primary: '#F7F5F0',
        text_secondary: '#A2A7A4',
        accent_gold: '#D4AF37',
        font_heading: 'cinzel',
        font_body: 'plus-jakarta',
        cover_layout: 'fullscreen',
        border_radius: 'md',
        background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
        background_music_title: 'Moonlight Sonata (Modern Piano)',
        show_floating_music_button: true,
      },
      sections: [
        { id: 'sec_1', section_key: 'hero', component_type: 'HeroSection', sort_order: 1, is_visible: true },
        { id: 'sec_2', section_key: 'couple', component_type: 'CoupleSection', sort_order: 2, is_visible: true },
        { id: 'sec_3', section_key: 'events', component_type: 'EventsSection', sort_order: 3, is_visible: true },
        { id: 'sec_4', section_key: 'story', component_type: 'StorySection', sort_order: 4, is_visible: true },
        { id: 'sec_5', section_key: 'gallery', component_type: 'GallerySection', sort_order: 5, is_visible: true },
        { id: 'sec_6', section_key: 'rsvp', component_type: 'RsvpSection', sort_order: 6, is_visible: true },
        { id: 'sec_7', section_key: 'wishes', component_type: 'WishesSection', sort_order: 7, is_visible: true },
        { id: 'sec_8', section_key: 'gifts', component_type: 'GiftsSection', sort_order: 8, is_visible: true },
        { id: 'sec_9', section_key: 'closing', component_type: 'ClosingSection', sort_order: 9, is_visible: true },
      ],
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'tpl_birthday_celebration',
    name: 'Birthday Celebration',
    slug: 'birthday-celebration',
    description: 'Gembira, cerah dan dinamis untuk perayaan ulang tahun, sweet seventeen, atau anniversary dengan konfeti emas.',
    category: 'birthday',
    preview_image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80',
    is_premium: false,
    status: 'published',
    default_configuration: {
      theme: {
        primary_color: '#1B2430',
        secondary_color: '#E5A93C',
        background_color: '#FBF9F5',
        card_color: '#FFFFFF',
        text_primary: '#1B2430',
        text_secondary: '#515C6F',
        accent_gold: '#E5A93C',
        font_heading: 'playfair',
        font_body: 'outfit',
        cover_layout: 'centered',
        border_radius: 'lg',
        background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-celebration-party-loop-1123.mp3',
        background_music_title: 'Celebration Joy',
        show_floating_music_button: true,
      },
      sections: [
        { id: 'sec_1', section_key: 'hero', component_type: 'HeroSection', sort_order: 1, is_visible: true },
        { id: 'sec_2', section_key: 'events', component_type: 'EventsSection', sort_order: 2, is_visible: true },
        { id: 'sec_3', section_key: 'gallery', component_type: 'GallerySection', sort_order: 3, is_visible: true },
        { id: 'sec_4', section_key: 'rsvp', component_type: 'RsvpSection', sort_order: 4, is_visible: true },
        { id: 'sec_5', section_key: 'wishes', component_type: 'WishesSection', sort_order: 5, is_visible: true },
        { id: 'sec_6', section_key: 'gifts', component_type: 'GiftsSection', sort_order: 6, is_visible: true },
        { id: 'sec_7', section_key: 'closing', component_type: 'ClosingSection', sort_order: 7, is_visible: true },
      ],
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'tpl_corporate_event',
    name: 'Corporate Event',
    slug: 'corporate-event',
    description: 'Profesional, prestisius, dan tertata rapi untuk seminar, gala dinner korporat, konferensi, dan peluncuran produk.',
    category: 'corporate',
    preview_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    is_premium: true,
    status: 'published',
    default_configuration: {
      theme: {
        primary_color: '#0F172A',
        secondary_color: '#0284C7',
        background_color: '#F8FAFC',
        card_color: '#FFFFFF',
        text_primary: '#0F172A',
        text_secondary: '#475569',
        accent_gold: '#0284C7',
        font_heading: 'serif',
        font_body: 'inter',
        cover_layout: 'split',
        border_radius: 'sm',
        background_music_url: null,
        background_music_title: null,
        show_floating_music_button: false,
      },
      sections: [
        { id: 'sec_1', section_key: 'hero', component_type: 'HeroSection', sort_order: 1, is_visible: true },
        { id: 'sec_2', section_key: 'events', component_type: 'EventsSection', sort_order: 2, is_visible: true },
        { id: 'sec_3', section_key: 'rsvp', component_type: 'RsvpSection', sort_order: 3, is_visible: true },
        { id: 'sec_4', section_key: 'closing', component_type: 'ClosingSection', sort_order: 4, is_visible: true },
      ],
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];

// Seed Invitations with Rich Real-World Data
export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv_andi_siti',
    workspace_id: 'ws_personal_01',
    created_by: 'user_personal_01',
    template_id: 'tpl_minimalist_wedding',
    title: 'The Wedding of Andi & Siti',
    slug: 'andi-siti',
    category: 'wedding',
    status: 'published',
    published_at: '2026-10-20T08:00:00.000Z',
    event_data: {
      bride_name: 'Siti Nurhaliza, S.E.',
      bride_nickname: 'Siti',
      bride_parents: 'Putri pertama dari Bpk. Ir. H. Ahmad Dahlan & Ibu Hj. Marwah',
      groom_name: 'Andi Pratama, M.Kom.',
      groom_nickname: 'Andi',
      groom_parents: 'Putra kedua dari Bpk. Drs. H. Usman Ali & Ibu Hj. Aminah',
      event_title: 'The Wedding of Andi & Siti',
      event_description: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.',
      event_date: '2026-12-15',
      timezone: 'Asia/Makassar',
      sessions: [
        {
          id: 'ses_1',
          title: 'Akad Nikah',
          date: '2026-12-15',
          start_time: '08:30',
          end_time: '10:30',
          venue_name: 'Masjid Raya Makassar',
          venue_address: 'Jl. Masjid Raya No. 1, Bontoala, Makassar, Sulawesi Selatan',
          maps_url: 'https://maps.google.com/?q=Masjid+Raya+Makassar',
        },
        {
          id: 'ses_2',
          title: 'Resepsi Pernikahan',
          date: '2026-12-15',
          start_time: '19:00',
          end_time: '22:00',
          venue_name: 'Grand Clarion Ballroom',
          venue_address: 'Jl. A. P. Pettarani No. 3, Makassar, Sulawesi Selatan',
          maps_url: 'https://maps.google.com/?q=Grand+Clarion+Makassar',
        },
      ],
      love_story: [
        {
          year: '2021',
          title: 'Pertama Bertemu',
          story: 'Kami pertama kali dipertemukan saat sama-sama mengikuti konferensi teknologi di Bandung.',
        },
        {
          year: '2023',
          title: 'Menjalin Komitmen',
          story: 'Setelah dua tahun saling mengenal dan berbagi impian, kami sepakat untuk melangkah ke jenjang yang lebih serius.',
        },
        {
          year: '2026',
          title: 'Hari Bahagia',
          story: 'Momen sakral saat kami mengikat janji suci di hadapan Allah SWT dan keluarga tercinta.',
        },
      ],
      cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      ],
      digital_gifts: [
        {
          id: 'gift_1',
          bank_name: 'Bank Mandiri',
          account_number: '1520018899221',
          account_holder: 'Andi Pratama',
        },
        {
          id: 'gift_2',
          bank_name: 'BCA',
          account_number: '7880992314',
          account_holder: 'Siti Nurhaliza',
        },
      ],
      gift_delivery_address: 'Jl. Boulevard Panakkukang Mas Blok F No. 12, Makassar',
      enable_rsvp: true,
      enable_wishes: true,
      enable_gift: true,
      enable_countdown: true,
      enable_gallery: true,
      enable_story: true,
    },
    theme_configuration: {
      primary_color: '#1F2421',
      secondary_color: '#C5A880',
      background_color: '#FCFBF7',
      card_color: '#FFFFFF',
      text_primary: '#1F2421',
      text_secondary: '#636965',
      accent_gold: '#C5A880',
      font_heading: 'playfair',
      font_body: 'plus-jakarta',
      cover_layout: 'centered',
      border_radius: 'md',
      background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
      background_music_title: 'A Thousand Years (Acoustic)',
      show_floating_music_button: true,
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'inv_reza_dinda',
    workspace_id: 'ws_vendor_01',
    created_by: 'user_vendor_01',
    template_id: 'tpl_elegant_floral',
    title: 'The Wedding of Reza & Dinda',
    slug: 'reza-dinda',
    category: 'wedding',
    status: 'published',
    published_at: '2026-10-23T08:00:00.000Z',
    event_data: {
      bride_name: 'Dinda Kirana, S.Ked.',
      bride_nickname: 'Dinda',
      bride_parents: 'Putri Bpk. dr. H. Ridwan & Ibu Hj. Fatimah',
      groom_name: 'Reza Rahardian, S.T.',
      groom_nickname: 'Reza',
      groom_parents: 'Putra Bpk. Ir. Gunawan & Ibu Ratna',
      event_title: 'The Wedding of Reza & Dinda',
      event_date: '2026-11-20',
      timezone: 'Asia/Makassar',
      sessions: [
        {
          id: 'ses_1',
          title: 'Akad & Resepsi',
          date: '2026-11-20',
          start_time: '10:00',
          end_time: '15:00',
          venue_name: 'The Rinra Hotel Ballroom',
          venue_address: 'Jl. Metro Tanjung Bunga No. 2, Makassar',
          maps_url: 'https://maps.google.com/?q=The+Rinra+Makassar',
        },
      ],
      cover_image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
      gallery_images: [
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      ],
      enable_rsvp: true,
      enable_wishes: true,
      enable_gift: true,
      enable_countdown: true,
      enable_gallery: true,
      enable_story: false,
    },
    theme_configuration: {
      primary_color: '#2C2B29',
      secondary_color: '#D4A373',
      background_color: '#FAF7F2',
      card_color: '#FFFFFF',
      text_primary: '#2C2B29',
      text_secondary: '#7D7973',
      accent_gold: '#D4A373',
      font_heading: 'cormorant',
      font_body: 'inter',
      cover_layout: 'framed',
      border_radius: 'lg',
      background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
      background_music_title: 'Canon in D (Orchestral)',
      show_floating_music_button: true,
    },
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];

// Initial Guests
export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'guest_1',
    invitation_id: 'inv_andi_siti',
    name: 'Bapak H. Syamsuddin & Keluarga',
    phone: '081244556677',
    category: 'VIP',
    pax_limit: 4, // 1 guest record with household of 4 (consumes 1 registered guest record!)
    invitation_token: 'tok_syamsuddin',
    qr_code_token: 'qr_syamsuddin_checkin',
    checked_in_at: null,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'guest_2',
    invitation_id: 'inv_andi_siti',
    name: 'dr. Farah Maulida',
    phone: '081299887766',
    category: 'Sahabat',
    pax_limit: 2,
    invitation_token: 'tok_farah',
    qr_code_token: 'qr_farah_checkin',
    checked_in_at: '2026-10-24T12:00:00.000Z',
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'guest_3',
    invitation_id: 'inv_andi_siti',
    name: 'Fajar Nugraha',
    phone: '085211223344',
    category: 'Teman Kantor',
    pax_limit: 1,
    invitation_token: 'tok_fajar',
    qr_code_token: 'qr_fajar_checkin',
    checked_in_at: null,
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];

// Initial RSVPs
export const INITIAL_RSVPS: RsvpResponse[] = [
  {
    id: 'rsvp_1',
    invitation_id: 'inv_andi_siti',
    guest_id: 'guest_1',
    guest_name: 'Bapak H. Syamsuddin & Keluarga',
    attendance_status: 'attending',
    attendee_count: 4,
    message: 'Insya Allah kami sekeluarga hadir mendoakan langsung kedua mempelai.',
    created_at: STATIC_TIMESTAMP,
  },
  {
    id: 'rsvp_2',
    invitation_id: 'inv_andi_siti',
    guest_id: 'guest_2',
    guest_name: 'dr. Farah Maulida',
    attendance_status: 'attending',
    attendee_count: 2,
    message: 'Selamat Siti & Andi! Lancar sampai hari H.',
    created_at: STATIC_TIMESTAMP,
  },
];

// Initial Wishes
export const INITIAL_WISHES: GuestWish[] = [
  {
    id: 'wish_1',
    invitation_id: 'inv_andi_siti',
    guest_name: 'Bapak H. Syamsuddin',
    message: 'Barakallahu laka wa baraka alaika wa jamaa bainakuma fii khoir. Semoga menjadi keluarga sakinah mawaddah warahmah.',
    moderation_status: 'approved',
    created_at: STATIC_TIMESTAMP,
  },
  {
    id: 'wish_2',
    invitation_id: 'inv_andi_siti',
    guest_name: 'dr. Farah Maulida',
    message: 'Happy wedding Siti sayang! Cantik banget undangannya. Semoga langgeng bahagia selalu sampai kakek nenek!',
    moderation_status: 'approved',
    created_at: STATIC_TIMESTAMP,
  },
  {
    id: 'wish_3',
    invitation_id: 'inv_andi_siti',
    guest_name: 'Fajar Nugraha',
    message: 'Selamat menempuh hidup baru Mas Andi! Semoga dilimpahi rezeki dan kebahagiaan.',
    moderation_status: 'approved',
    created_at: STATIC_TIMESTAMP,
  },
];

// Initial Vendor Clients
export const INITIAL_VENDOR_CLIENTS: VendorClient[] = [
  {
    id: 'vc_1',
    workspace_id: 'ws_vendor_01',
    name: 'Reza & Dinda',
    phone: '081233445566',
    email: 'reza.dinda@gmail.com',
    notes: 'Paket Wedding Premium The Rinra Hotel Ballroom. Target publish H-30.',
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: 'vc_2',
    workspace_id: 'ws_vendor_01',
    name: 'Haikal & Maya',
    phone: '081299881122',
    email: 'haikal.maya@yahoo.com',
    notes: 'Paket Akad Nikah Garden Party. Masih menunggu revisi foto prewedding.',
    created_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];

// Initial Publish Credits Ledger
export const INITIAL_PUBLISH_CREDITS: PublishCredit[] = [
  {
    id: 'cred_1',
    workspace_id: 'ws_vendor_01',
    subscription_id: 'sub_vendor_01',
    credit_delta: 30,
    balance_after: 30,
    reason: 'Alokasi kuota publikasi bulanan paket Vendor Studio',
    idempotency_key: 'credit_initial_grant',
    created_at: STATIC_TIMESTAMP,
  },
  {
    id: 'cred_2',
    workspace_id: 'ws_vendor_01',
    subscription_id: 'sub_vendor_01',
    credit_delta: -1,
    balance_after: 29,
    reason: 'Publikasi undangan klien: Reza & Dinda',
    invitation_id: 'inv_reza_dinda',
    idempotency_key: 'credit_consume_inv_reza_dinda',
    created_at: STATIC_TIMESTAMP,
  },
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    actor_id: 'user_vendor_01',
    workspace_id: 'ws_vendor_01',
    action: 'INVITATION_PUBLISHED',
    target_type: 'invitation',
    target_id: 'inv_reza_dinda',
    metadata: { slug: 'reza-dinda', template: 'tpl_elegant_floral' },
    created_at: STATIC_TIMESTAMP,
  },
  {
    id: 'log_2',
    actor_id: 'user_admin_01',
    action: 'TEMPLATE_CREATED',
    target_type: 'template',
    target_id: 'tpl_corporate_event',
    metadata: { name: 'Corporate Event' },
    created_at: STATIC_TIMESTAMP,
  },
];

// In-Memory Dynamic Store Singleton for testing and graceful offline/local runtime
class MemoryStore {
  templates = [...INITIAL_TEMPLATES];
  invitations = [...INITIAL_INVITATIONS];
  guests = [...INITIAL_GUESTS];
  rsvps = [...INITIAL_RSVPS];
  wishes = [...INITIAL_WISHES];
  workspaces = { ...MOCK_WORKSPACES };
  subscriptions = { ...MOCK_SUBSCRIPTIONS };
  users = { ...MOCK_USERS };
  vendorClients = [...INITIAL_VENDOR_CLIENTS];
  publishCredits = [...INITIAL_PUBLISH_CREDITS];
  auditLogs = [...INITIAL_AUDIT_LOGS];
  transactions = [...INITIAL_TRANSACTIONS];

  // Invitations
  getInvitationBySlug(slug: string) {
    return this.invitations.find(i => i.slug === slug);
  }

  getInvitationById(id: string) {
    return this.invitations.find(i => i.id === id);
  }

  getInvitationsByWorkspace(workspaceId: string) {
    return this.invitations.filter(i => i.workspace_id === workspaceId);
  }

  saveInvitation(invitation: Invitation) {
    const idx = this.invitations.findIndex(i => i.id === invitation.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      this.invitations[idx] = { ...invitation, updated_at: now };
    } else {
      this.invitations.push({
        ...invitation,
        created_at: now,
        updated_at: now,
      });
    }
    return invitation;
  }

  // Guests & Guest Limit Enforcement
  getGuestsByInvitation(invitationId: string) {
    return this.guests.filter(g => g.invitation_id === invitationId);
  }

  addGuest(invitationId: string, guestData: Omit<Guest, 'id' | 'invitation_id' | 'invitation_token' | 'qr_code_token' | 'created_at' | 'updated_at'>) {
    const inv = this.getInvitationById(invitationId);
    if (!inv) throw new Error('Undangan tidak ditemukan');

    // Get workspace entitlements
    const sub = Object.values(this.subscriptions).find(s => s.workspace_id === inv.workspace_id);
    const entitlements = sub?.plan?.entitlements || DEFAULT_FREE_ENTITLEMENTS;

    const currentGuests = this.getGuestsByInvitation(invitationId);
    const check = checkGuestCreationLimit(currentGuests.length, entitlements, 1);

    if (!check.allowed) {
      throw new Error(check.errorMessage || 'Batas tamu terlampaui');
    }

    const now = new Date().toISOString();
    const newGuest: Guest = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invitation_id: invitationId,
      name: guestData.name,
      phone: guestData.phone || null,
      email: guestData.email || null,
      category: guestData.category || 'Tamu',
      pax_limit: guestData.pax_limit || 1,
      invitation_token: generateSecureToken(12),
      qr_code_token: generateSecureToken(16),
      checked_in_at: null,
      created_at: now,
      updated_at: now,
    };

    this.guests.push(newGuest);
    return newGuest;
  }

  batchAddGuests(invitationId: string, guestsList: Array<{ name: string; phone?: string; category?: string; pax_limit?: number }>) {
    const inv = this.getInvitationById(invitationId);
    if (!inv) throw new Error('Undangan tidak ditemukan');

    const sub = Object.values(this.subscriptions).find(s => s.workspace_id === inv.workspace_id);
    const entitlements = sub?.plan?.entitlements || DEFAULT_FREE_ENTITLEMENTS;

    const currentGuests = this.getGuestsByInvitation(invitationId);
    const check = checkGuestCreationLimit(currentGuests.length, entitlements, guestsList.length);

    if (!check.allowed) {
      throw new Error(check.errorMessage || 'Kapasitas tamu tidak mencukupi untuk batch import ini.');
    }

    const now = new Date().toISOString();
    const added: Guest[] = [];
    for (const item of guestsList) {
      const g: Guest = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        invitation_id: invitationId,
        name: item.name,
        phone: item.phone || null,
        category: item.category || 'Tamu',
        pax_limit: item.pax_limit || 1,
        invitation_token: generateSecureToken(12),
        qr_code_token: generateSecureToken(16),
        checked_in_at: null,
        created_at: now,
        updated_at: now,
      };
      this.guests.push(g);
      added.push(g);
    }
    return added;
  }

  // RSVP
  submitRsvp(invitationId: string, data: { guest_id?: string; guest_name: string; attendance_status: 'attending' | 'not_attending' | 'uncertain'; attendee_count: number; message?: string }) {
    const newRsvp: RsvpResponse = {
      id: `rsvp_${Date.now()}`,
      invitation_id: invitationId,
      guest_id: data.guest_id || null,
      guest_name: data.guest_name,
      attendance_status: data.attendance_status,
      attendee_count: data.attendee_count,
      message: data.message || null,
      created_at: new Date().toISOString(),
    };
    this.rsvps.push(newRsvp);
    return newRsvp;
  }

  // Wishes
  submitWish(invitationId: string, guest_name: string, message: string) {
    const newWish: GuestWish = {
      id: `wish_${Date.now()}`,
      invitation_id: invitationId,
      guest_name,
      message,
      moderation_status: 'approved',
      created_at: new Date().toISOString(),
    };
    this.wishes.unshift(newWish);
    return newWish;
  }

  getWishesByInvitation(invitationId: string) {
    return this.wishes.filter(w => w.invitation_id === invitationId && w.moderation_status === 'approved');
  }

  // QR Check-in & Guest Lookup
  getGuestByInvitationToken(token: string, invitationId?: string) {
    return this.guests.find(g => 
      g.invitation_token === token && (!invitationId || g.invitation_id === invitationId)
    );
  }

  getGuestByQrToken(qrToken: string) {
    return this.guests.find(g => g.qr_code_token === qrToken);
  }

  getGuestByName(name: string, invitationId: string) {
    const cleanName = name.trim().toLowerCase();
    return this.guests.find(g => 
      g.invitation_id === invitationId && g.name.toLowerCase().includes(cleanName)
    );
  }

  checkInGuestByQrToken(qrToken: string, operatorUserId?: string) {
    const guest = this.guests.find(g => g.qr_code_token === qrToken);
    if (!guest) {
      return { success: false, error: 'QR Code tidak valid atau tamu tidak terdaftar.' };
    }
    if (guest.checked_in_at) {
      return { 
        success: false, 
        alreadyCheckedIn: true, 
        guest, 
        error: `Tamu ${guest.name} sudah check-in sebelumnya pada ${new Date(guest.checked_in_at).toLocaleTimeString('id-ID')}.` 
      };
    }
    guest.checked_in_at = new Date().toISOString();
    guest.checked_in_by = operatorUserId || 'operator_reception';
    return { success: true, guest };
  }

  checkInGuestById(guestId: string, operatorUserId?: string) {
    const guest = this.guests.find(g => g.id === guestId);
    if (!guest) {
      return { success: false, error: 'Tamu tidak ditemukan.' };
    }
    if (guest.checked_in_at) {
      return { 
        success: false, 
        alreadyCheckedIn: true, 
        guest, 
        error: `Tamu ${guest.name} sudah check-in sebelumnya pada ${new Date(guest.checked_in_at).toLocaleTimeString('id-ID')}.` 
      };
    }
    guest.checked_in_at = new Date().toISOString();
    guest.checked_in_by = operatorUserId || 'operator_reception';
    return { success: true, guest };
  }

  undoCheckIn(guestId: string) {
    const guest = this.guests.find(g => g.id === guestId);
    if (!guest) {
      return { success: false, error: 'Tamu tidak ditemukan.' };
    }
    guest.checked_in_at = null;
    guest.checked_in_by = null;
    return { success: true, guest };
  }

  // User Management & Subscriptions
  getAllUsers() {
    return Object.values(this.users).map(user => {
      const ws = Object.values(this.workspaces).find(w => w.owner_id === user.id) || null;
      const sub = ws ? Object.values(this.subscriptions).find(s => s.workspace_id === ws.id) : null;
      const plan = sub?.plan || (sub ? INITIAL_PLANS.find(p => p.id === sub.plan_id) : INITIAL_PLANS.find(p => p.id === 'plan_free')) || INITIAL_PLANS[0];
      return {
        ...user,
        workspace: ws,
        subscription: sub,
        plan,
      };
    });
  }

  registerUser(userData: { id?: string; full_name: string; email: string; phone?: string; role?: string }) {
    const userId = userData.id || `user_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Check if user already exists
    const existing = Object.values(this.users).find(u => u.email === userData.email || u.id === userId);
    if (existing) {
      return existing;
    }

    const newUser: UserProfile = {
      id: userId,
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone || null,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.full_name)}`,
      is_platform_admin: userData.email === 'ahmadshawity@gmail.com',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    this.users[userId] = newUser;

    // Create default workspace
    const wsId = `ws_${Date.now()}`;
    const newWs: Workspace = {
      id: wsId,
      name: `${userData.full_name}'s Workspace`,
      slug: userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${Date.now().toString(36)}`,
      type: userData.role === 'vendor' ? 'vendor' : 'personal',
      owner_id: userId,
      settings: {},
      created_at: now,
      updated_at: now,
    };
    this.workspaces[wsId] = newWs;

    // Create initial subscription
    const subId = `sub_${Date.now()}`;
    const freePlan = INITIAL_PLANS.find(p => p.id === 'plan_free') || INITIAL_PLANS[0];
    this.subscriptions[subId] = {
      id: subId,
      workspace_id: wsId,
      plan_id: freePlan.id,
      plan: freePlan,
      status: 'active',
      billing_period: 'monthly',
      provider: 'sandbox',
      current_period_start: now,
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      created_at: now,
      updated_at: now,
    };

    return newUser;
  }

  updateUserSubscription(
    userId: string, 
    newPlanId: string, 
    newStatus: any = 'active', 
    durationMonths: number = 1, 
    notes?: string,
    actorId: string = 'user_admin_01'
  ) {
    const user = Object.values(this.users).find(u => u.id === userId);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }

    let ws = Object.values(this.workspaces).find(w => w.owner_id === userId);
    const now = new Date();

    if (!ws) {
      const wsId = `ws_${Date.now()}`;
      ws = {
        id: wsId,
        name: `${user.full_name} Workspace`,
        slug: user.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${Date.now().toString(36)}`,
        type: 'personal',
        owner_id: userId,
        settings: {},
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      this.workspaces[wsId] = ws;
    }

    const targetPlan = INITIAL_PLANS.find(p => p.id === newPlanId);
    if (!targetPlan) {
      throw new Error(`Paket dengan ID '${newPlanId}' tidak valid`);
    }

    // Find or create subscription
    let sub = Object.values(this.subscriptions).find(s => s.workspace_id === ws!.id);
    const oldPlanId = sub?.plan_id || 'plan_free';

    // Calculate end date
    let periodEnd: Date;
    if (durationMonths >= 999) {
      periodEnd = new Date('2099-12-31T23:59:59.000Z'); // Lifetime
    } else {
      periodEnd = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
    }

    if (sub) {
      sub.plan_id = targetPlan.id;
      sub.plan = targetPlan;
      sub.status = newStatus;
      sub.current_period_start = now.toISOString();
      sub.current_period_end = periodEnd.toISOString();
      sub.updated_at = now.toISOString();
    } else {
      const subId = `sub_${Date.now()}`;
      sub = {
        id: subId,
        workspace_id: ws.id,
        plan_id: targetPlan.id,
        plan: targetPlan,
        status: newStatus,
        billing_period: targetPlan.billing_period,
        provider: 'sandbox',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      this.subscriptions[subId] = sub;
    }

    // Record in Audit Log
    const auditEntry: AuditLog = {
      id: `log_${Date.now()}`,
      actor_id: actorId,
      workspace_id: ws.id,
      action: 'SUBSCRIPTION_MANUAL_OVERRIDE',
      target_type: 'subscription',
      target_id: sub.id,
      metadata: {
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        old_plan: oldPlanId,
        new_plan: targetPlan.id,
        new_plan_name: targetPlan.name,
        status: newStatus,
        duration_months: durationMonths,
        notes: notes || 'Admin manual subscription override',
        applied_at: now.toISOString(),
      },
      created_at: now.toISOString(),
    };
    this.auditLogs.unshift(auditEntry);

    return {
      success: true,
      user,
      subscription: sub,
      plan: targetPlan,
      auditLog: auditEntry,
    };
  }

  // Transactions Management
  getAllTransactions() {
    return [...this.transactions];
  }

  updateTransactionStatus(
    transactionId: string, 
    newStatus: any, 
    reason?: string, 
    actorId: string = 'user_admin_01'
  ) {
    const txn = this.transactions.find(t => t.id === transactionId || t.order_id === transactionId);
    if (!txn) {
      throw new Error(`Transaksi '${transactionId}' tidak ditemukan.`);
    }

    const oldStatus = txn.status;
    txn.status = newStatus;
    const now = new Date().toISOString();

    if (newStatus === 'settlement' || newStatus === 'capture') {
      txn.paid_at = now;
    }
    if (reason) {
      txn.failure_reason = reason;
    }

    // Audit log
    const auditEntry: AuditLog = {
      id: `log_${Date.now()}`,
      actor_id: actorId,
      workspace_id: txn.workspace_id,
      action: 'TRANSACTION_STATUS_UPDATED',
      target_type: 'payment_transaction',
      target_id: txn.id,
      metadata: {
        order_id: txn.order_id,
        old_status: oldStatus,
        new_status: newStatus,
        amount: txn.amount,
        customer_email: txn.user_email,
        reason: reason || 'Manual status change by administrator',
        updated_at: now,
      },
      created_at: now,
    };
    this.auditLogs.unshift(auditEntry);

    // If transaction changed to settlement and user has workspace, activate their subscription
    if (newStatus === 'settlement' && txn.plan_id && txn.workspace_id) {
      const sub = Object.values(this.subscriptions).find(s => s.workspace_id === txn.workspace_id);
      const plan = INITIAL_PLANS.find(p => p.id === txn.plan_id);
      if (sub && plan) {
        sub.plan_id = plan.id;
        sub.plan = plan;
        sub.status = 'active';
        sub.updated_at = now;
      }
    }

    return { success: true, transaction: txn, auditLog: auditEntry };
  }
}

// Global singleton instance
export const dataStore = new MemoryStore();
