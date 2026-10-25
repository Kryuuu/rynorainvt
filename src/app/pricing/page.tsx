'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_PLANS } from '@/lib/billing/plans';
import { formatIDR } from '@/lib/utils';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plansForCycle = INITIAL_PLANS.filter(p => p.billing_period === billingCycle || p.slug === 'free');

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="gold">Investasi Transparan</Badge>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#1F2421]">
              Pilih Paket Sesuai Kebutuhan Anda
            </h1>
            <p className="text-[#555C57] text-base">
              Tanpa biaya tersembunyi. Batas kuota tamu diterapkan per undangan secara independen, bukan akumulasi akun.
            </p>

            {/* Toggle Monthly vs Annual */}
            <div className="pt-6">
              <div className="p-1 rounded-xl bg-[#F3EFE6] border border-[#E8E3DA] inline-flex items-center gap-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-[#1F2421] text-white shadow-sm'
                      : 'text-[#4E5450] hover:text-[#1F2421]'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-[#C5A880] text-white shadow-sm'
                      : 'text-[#4E5450] hover:text-[#1F2421]'
                  }`}
                >
                  <span>Tahunan (Hemat 2 Bulan)</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plansForCycle.map((plan) => (
              <div
                key={plan.id}
                className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6 bg-white border border-[#E8E3DA]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">{plan.name}</h3>
                      <p className="text-xs text-[#7A807C]">Periode {plan.billing_period}</p>
                    </div>
                    {plan.slug === 'personal-plus' && (
                      <Badge variant="gold" className="text-[10px]">Pilihan Populer</Badge>
                    )}
                  </div>

                  <div className="space-y-0.5">
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
                    <p className="text-[10px] text-[#7A807C]">Bebas biaya tambahan per RSVP</p>
                  </div>

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
                      <span>{plan.entitlements.can_use_qr_checkin ? 'QR Check-in Scanner Tamu' : 'Tanpa QR Check-in'}</span>
                    </li>
                  </ul>
                </div>

                <Link href={plan.slug === 'vendor-studio' ? '/vendor' : `/dashboard/subscription?plan=${plan.slug}`}>
                  <Button
                    variant={plan.slug === 'personal-plus' || plan.slug === 'vendor-studio' ? 'gold' : 'outline'}
                    size="sm"
                    className="w-full text-xs"
                  >
                    Pilih Paket Ini
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Guarantee notice */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E3DA] max-w-3xl mx-auto flex items-start gap-4 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#C5A880] flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-[#555C57]">
              <h4 className="font-semibold text-sm text-[#1F2421]">
                Kebijakan Downgrade Aman & Privasi Data
              </h4>
              <p className="leading-relaxed">
                Data undangan, foto, ucapan, dan tamu Anda tidak akan pernah dihapus secara sepihak saat langganan berakhir atau diturunkan. Sistem hanya membatasi penambahan data tamu baru jika jumlah tamu yang ada melampaui kuota paket baru Anda.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
