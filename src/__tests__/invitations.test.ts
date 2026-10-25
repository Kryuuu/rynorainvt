import { describe, it, expect } from 'vitest';
import { slugify, generateSecureToken } from '../lib/utils';
import { dataStore, INITIAL_TEMPLATES } from '../lib/data-store';
import { Invitation } from '../types';

describe('Invitations & Template Engine (Section 11, 14, 15)', () => {

  it('Generates URL-safe and normalized slugs', () => {
    expect(slugify('The Wedding of Andi & Siti!')).toBe('the-wedding-of-andi-siti');
    expect(slugify('Perayaan Ulang Tahun Ke-17 Maya')).toBe('perayaan-ulang-tahun-ke-17-maya');
    expect(slugify('  Spasi Berlebih   -- Dan Simbol $$ ')).toBe('spasi-berlebih-dan-simbol');
  });

  it('Generates unguessable non-sequential tokens', () => {
    const token1 = generateSecureToken(16);
    const token2 = generateSecureToken(16);
    expect(token1).toHaveLength(16);
    expect(token2).toHaveLength(16);
    expect(token1).not.toBe(token2);
  });

  it('Copies template configuration without mutating the original template definition', () => {
    const originalTemplate = INITIAL_TEMPLATES[0];
    const initialColor = originalTemplate.default_configuration.theme.primary_color;

    const newInvitation: Invitation = {
      id: 'inv_test_mutation',
      workspace_id: 'ws_personal_01',
      created_by: 'user_personal_01',
      template_id: originalTemplate.id,
      title: 'Undangan Uji Coba',
      slug: 'undangan-uji-coba',
      category: 'wedding',
      status: 'draft',
      event_data: {
        event_title: 'Undangan Uji Coba',
        event_date: '2026-12-01',
        timezone: 'Asia/Makassar',
        sessions: [],
        gallery_images: [],
        enable_rsvp: true,
        enable_wishes: true,
        enable_gift: false,
        enable_countdown: true,
        enable_gallery: false,
        enable_story: false,
      },
      theme_configuration: {
        ...originalTemplate.default_configuration.theme,
        primary_color: '#FF0000', // Customized
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dataStore.saveInvitation(newInvitation);

    // Original template definition remains pristine
    expect(originalTemplate.default_configuration.theme.primary_color).toBe(initialColor);
    expect(newInvitation.theme_configuration.primary_color).toBe('#FF0000');
  });

  it('Validates QR check-in tokens and prevents duplicate check-in', () => {
    const guest = dataStore.addGuest('inv_andi_siti', {
      name: 'dr. Test Guest',
      phone: '0812334455',
      pax_limit: 1,
    });

    // 1st Check-in -> Success
    const check1 = dataStore.checkInGuestByQrToken(guest.qr_code_token, 'operator_01');
    expect(check1.success).toBe(true);
    expect(check1.guest?.checked_in_at).toBeDefined();

    // 2nd Check-in -> Rejected with duplicate error message
    const check2 = dataStore.checkInGuestByQrToken(guest.qr_code_token, 'operator_01');
    expect(check2.success).toBe(false);
    expect(check2.alreadyCheckedIn).toBe(true);
    expect(check2.error).toContain('sudah check-in sebelumnya');

    // Undo Check-in
    const undoRes = dataStore.undoCheckIn(guest.id);
    expect(undoRes.success).toBe(true);
    expect(undoRes.guest?.checked_in_at).toBeNull();

    // Manual check-in by ID
    const manualCheck = dataStore.checkInGuestById(guest.id, 'operator_manual');
    expect(manualCheck.success).toBe(true);
    expect(manualCheck.guest?.checked_in_at).toBeDefined();

    // Lookup by invitation token
    const foundGuest = dataStore.getGuestByInvitationToken(guest.invitation_token, 'inv_andi_siti');
    expect(foundGuest).toBeDefined();
    expect(foundGuest?.name).toBe('dr. Test Guest');
  });

  it('Persists and retrieves rich multimedia: photos (JPG/PNG), prewedding video (MP4), and audio (MP3)', () => {
    const mediaInvitation: Invitation = {
      id: 'inv_media_rich_01',
      workspace_id: 'ws_personal_01',
      created_by: 'user_personal_01',
      template_id: 'tpl_royal_javanese',
      title: 'The Wedding of Kevin & Jessica',
      slug: 'kevin-jessica-wedding',
      category: 'wedding',
      status: 'published',
      event_data: {
        event_title: 'The Wedding of Kevin & Jessica',
        event_date: '2026-11-15',
        timezone: 'Asia/Makassar',
        cover_image_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        bride_name: 'Jessica Tan, B.A.',
        groom_name: 'Kevin Pratama, S.Kom.',
        bride_photo_url: 'data:image/png;base64,iVBORw0KGgo...',
        groom_photo_url: 'data:image/png;base64,iVBORw0KGgo...',
        enable_video: true,
        video_url: 'https://example.com/videos/prewedding-cinematic.mp4',
        video_title: 'Sinematik Prewedding Kevin & Jessica',
        gallery_images: [
          'data:image/jpeg;base64,/9j/photo1...',
          'data:image/jpeg;base64,/9j/photo2...',
        ],
        sessions: [],
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
        background_color: '#FAF8F5',
        card_color: '#FFFFFF',
        text_primary: '#1F2421',
        text_secondary: '#636965',
        accent_gold: '#C5A880',
        font_heading: 'cinzel',
        font_body: 'plus-jakarta',
        cover_layout: 'centered',
        border_radius: 'md',
        background_music_url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-harp-and-strings-1002.mp3',
        background_music_title: 'Romantic Harp & Strings (MP3)',
        show_floating_music_button: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dataStore.saveInvitation(mediaInvitation);
    const retrieved = dataStore.getInvitationBySlug('kevin-jessica-wedding');

    expect(retrieved).toBeDefined();
    expect(retrieved?.event_data.bride_photo_url).toContain('data:image/png;base64');
    expect(retrieved?.event_data.groom_photo_url).toContain('data:image/png;base64');
    expect(retrieved?.event_data.enable_video).toBe(true);
    expect(retrieved?.event_data.video_url).toBe('https://example.com/videos/prewedding-cinematic.mp4');
    expect(retrieved?.event_data.video_title).toBe('Sinematik Prewedding Kevin & Jessica');
    expect(retrieved?.event_data.gallery_images).toHaveLength(2);
    expect(retrieved?.theme_configuration.background_music_url).toContain('.mp3');
    expect(retrieved?.theme_configuration.background_music_title).toBe('Romantic Harp & Strings (MP3)');
  });
});
