'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  QrCode,
  Building2,
  Lock
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_PLANS } from '@/lib/billing/plans';
import { formatIDR } from '@/lib/utils';
import { paymentGateway } from '@/lib/billing/payment-gateway';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/lib/feedback';

export default function SubscriptionBillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currentPlanSlug, setCurrentPlanSlug] = useState<'free' | 'personal-plus' | 'creator-pro' | 'vendor-studio'>('personal-plus');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState<string | null>(null);
  const toast = useToast();

  const plansForCycle = INITIAL_PLANS.filter(p => p.billing_period === billingCycle || p.slug === 'free');

  const handleSimulateUpgrade = async (planId: string) => {
    setIsProcessingCheckout(true);
    setCheckoutSuccessMsg(null);

    try {
      // 1. Authoritative transaction session
      const session = await paymentGateway.createCheckoutSession({
        workspaceId: 'ws_personal_01',
        planId,
        billingPeriod: billingCycle,
        customerName: 'Andi Pratama',
        customerEmail: 'andi@example.com',
      });

      // 2. Simulate Midtrans/Xendit Settlement
      setTimeout(async () => {
        try {
          await paymentGateway.processPaymentNotification({
            order_id: session.orderId,
            transaction_status: 'settlement',
            gross_amount: String(session.amount),
          });

          const selectedPlan = INITIAL_PLANS.find(p => p.id === planId);
          if (selectedPlan) {
            setCurrentPlanSlug(selectedPlan.slug);
          }

          setIsProcessingCheckout(false);
          setCheckoutSuccessMsg(`Pembayaran berhasil diverifikasi melalui Gateway Sandbox! Paket telah ditingkatkan.`);
          toast.success('Pembayaran berhasil!', 'Paket Anda telah ditingkatkan. Fitur paket baru langsung aktif.');
        } catch (err: unknown) {
          // Sebelumnya error di dalam setTimeout ini tidak tertangkap
          // (di luar try/catch) sehingga tombol macet di status memproses.
          setIsProcessingCheckout(false);
          toast.error('Gagal memproses pembayaran', errorMessage(err, 'Gagal memproses pembayaran') + ' — tidak ada biaya yang dibebankan, silakan coba lagi.');
        }
      }, 1000);
    } catch (err: unknown) {
      setIsProcessingCheckout(false);
      toast.error('Gagal memulai checkout', errorMessage(err, 'Gagal memulai checkout') + ' — silakan coba lagi.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
                Langganan & Pembayaran
              </span>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F2421]">
                Paket Langganan Workspace
              </h1>
              <p className="text-xs sm:text-sm text-[#636965]">
                Kelola paket aktif, tinjau kuota tamu dan fitur, serta tingkatkan paket dengan payment gateway aman Indonesia.
              </p>
            </div>

            {/* Current status pill */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F2421] text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div>
                <p className="text-[10px] text-[#7A807C] font-semibold uppercase">Paket Aktif Saat Ini</p>
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury text-base font-bold text-[#1F2421]">
                    {currentPlanSlug.toUpperCase()}
                  </span>
                  <Badge variant="gold" className="text-[9px]">Aktif</Badge>
                </div>
              </div>
            </div>
          </div>

          {checkoutSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{checkoutSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Billing cycle toggle */}
        <div className="flex justify-center">
          <div className="p-1 rounded-xl bg-[#F3EFE6] border border-[#E8E3DA] inline-flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#1F2421] text-white shadow-sm'
                  : 'text-[#4E5450] hover:text-[#1F2421]'
              }`}
            >
              Bulanan (Monthly)
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-[#C5A880] text-white shadow-sm'
                  : 'text-[#4E5450] hover:text-[#1F2421]'
              }`}
            >
              <span>Tahunan (Hemat s.d 2 Bulan)</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plansForCycle.map((plan) => {
            const isCurrent = currentPlanSlug === plan.slug;
            return (
              <div
                key={plan.id}
                className={`luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6 ${
                  isCurrent ? 'ring-2 ring-[#C5A880] bg-white' : 'bg-white'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">{plan.name}</h3>
                      <p className="text-xs text-[#7A807C]">Periode {plan.billing_period}</p>
                    </div>
                    {isCurrent && (
                      <Badge variant="gold" className="text-[10px]">Aktif</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="font-serif-luxury text-3xl font-bold text-[#1F2421]">
                      {formatIDR(plan.price_amount)}
                    </span>
                    <span className="text-xs text-[#7A807C]">
                      {plan.price_amount > 0 ? ` / ${plan.billing_period === 'monthly' ? 'bulan' : 'tahun'}` : ' / selamanya'}
                    </span>
                  </div>

                  {/* CRITICAL GUEST LIMIT DISPLAY */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-center">
                    <p className="text-[11px] font-semibold text-[#1F2421]">Batas Tamu per Undangan:</p>
                    <p className="font-serif-luxury text-lg font-bold text-[#9A7B4F]">
                      {plan.entitlements.is_unlimited_guests
                        ? 'Unlimited Tamu'
                        : `Maks. ${plan.entitlements.max_guests_per_invitation?.toLocaleString('id-ID')} Tamu`}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 text-xs text-[#4E5450] pt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{plan.entitlements.max_active_invitations ? `Hingga ${plan.entitlements.max_active_invitations} undangan aktif` : 'Unlimited undangan aktif'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{plan.entitlements.can_use_visual_editor ? 'Simple & Visual Editor' : 'Simple Editor Saja'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{plan.entitlements.can_remove_branding ? 'Tanpa Watermark Rynora' : 'Dengan Watermark Rynora'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{plan.entitlements.can_use_qr_checkin ? 'QR Code Check-in Scanner' : 'Tanpa QR Check-in'}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <Button variant="outline" size="sm" disabled className="w-full text-xs">
                      Paket Saat Ini
                    </Button>
                  ) : (
                    <Button
                      variant={plan.slug === 'creator-pro' ? 'gold' : 'primary'}
                      size="sm"
                      className="w-full text-xs"
                      isLoading={isProcessingCheckout}
                      onClick={() => handleSimulateUpgrade(plan.id)}
                    >
                      Pilih & Upgrade Paket
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Safe Downgrade Guarantee Notice */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E3DA] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#C5A880] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-[#555C57]">
            <h4 className="font-semibold text-sm text-[#1F2421]">
              Jaminan Keamanan Data & Kebijakan Downgrade
            </h4>
            <p className="leading-relaxed">
              Jika paket langganan Anda berakhir atau diubah ke paket yang lebih rendah, seluruh data tamu, galeri foto, dan undangan yang telah Anda buat tetap tersimpan aman dan tidak akan dihapus. Anda hanya dibatasi dalam menambah data tamu baru jika jumlah tamu yang ada telah melampaui kuota paket baru.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
