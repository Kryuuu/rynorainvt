import { describe, it, expect } from 'vitest';
import { errorMessage, copyText } from '../lib/feedback';
import { dataStore } from '../lib/data-store';

describe('Umpan balik tombol — helper errorMessage', () => {
  it('mengambil pesan asli dari Error', () => {
    expect(errorMessage(new Error('Kuota tamu habis'), 'Gagal')).toBe('Kuota tamu habis');
  });

  it('memakai fallback bila error kosong', () => {
    expect(errorMessage(null, 'Gagal menyimpan')).toBe('Gagal menyimpan');
    expect(errorMessage(new Error(''), 'Gagal menyimpan')).toBe('Gagal menyimpan');
    expect(errorMessage('teks mentah', 'Gagal')).toBe('teks mentah');
  });

  it('copyText mengembalikan false tanpa clipboard (lingkungan node)', async () => {
    await expect(copyText('https://contoh.id/i/test')).resolves.toBe(false);
  });
});

describe('Umpan balik tombol — dataStore persist & metode baru', () => {
  it('saveInvitation tetap bekerja dan tidak melempar di lingkungan tanpa window', () => {
    const inv = dataStore.getInvitationById('inv_andi_siti');
    expect(inv).toBeDefined();
    expect(() => dataStore.saveInvitation({ ...inv!, title: inv!.title })).not.toThrow();
  });

  it('persist() aman dipanggil di lingkungan tanpa window (no-op)', () => {
    expect(() => dataStore.persist()).not.toThrow();
  });

  it('updateTemplate mengubah template dan melempar bila id tidak ada', () => {
    const tpl = dataStore.templates[0];
    const before = tpl.is_premium;
    const updated = dataStore.updateTemplate(tpl.id, { is_premium: !before });
    expect(updated.is_premium).toBe(!before);
    // kembalikan seperti semula agar test lain tidak terpengaruh
    dataStore.updateTemplate(tpl.id, { is_premium: before });
    expect(() => dataStore.updateTemplate('tpl_tidak_ada', { is_premium: true })).toThrow('Template tidak ditemukan');
  });

  it('saveWorkspace menyimpan perubahan workspace', () => {
    const ws = dataStore.workspaces.ws_vendor;
    expect(ws).toBeDefined();
    const saved = dataStore.saveWorkspace({
      ...ws,
      settings: { ...ws.settings, brand_name: 'Studio Uji' },
    });
    expect(saved.settings.brand_name).toBe('Studio Uji');
    dataStore.saveWorkspace({ ...ws, settings: { ...ws.settings, brand_name: ws.settings.brand_name } });
  });

  it('addVendorClient menambahkan klien', () => {
    const before = dataStore.vendorClients.length;
    const client = dataStore.addVendorClient({
      id: `vc_test_${Date.now()}`,
      workspace_id: 'ws_vendor_01',
      name: 'Klien Uji',
      phone: null,
      email: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    expect(dataStore.vendorClients.length).toBe(before + 1);
    expect(client.name).toBe('Klien Uji');
    // bersihkan agar tidak mengotori store bersama
    dataStore.vendorClients = dataStore.vendorClients.filter((c) => c.id !== client.id);
  });

  it('check-in lalu undo tetap konsisten (jalur yang dipakai tombol check-in)', () => {
    const guest = dataStore.getGuestsByInvitation('inv_andi_siti')[0];
    expect(guest).toBeDefined();
    const wasCheckedIn = Boolean(guest.checked_in_at);
    if (!wasCheckedIn) {
      const res = dataStore.checkInGuestById(guest.id, 'test');
      expect(res.success).toBe(true);
      const undone = dataStore.undoCheckIn(guest.id);
      expect(undone.success).toBe(true);
      expect(dataStore.getGuestsByInvitation('inv_andi_siti')[0].checked_in_at).toBeNull();
    }
  });
});
