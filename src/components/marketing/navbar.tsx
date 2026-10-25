'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Menu, 
  X, 
  Sparkles, 
  LayoutTemplate, 
  Layers, 
  CreditCard, 
  HelpCircle, 
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E3DA]/80 bg-[#FCFBF7]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1F2421] flex items-center justify-center text-[#FCFBF7] shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-serif-luxury text-xl font-bold italic text-[#C5A880]">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif-luxury text-xl font-bold tracking-tight text-[#1F2421]">
              Rynora<span className="text-[#C5A880]">.</span>Invite
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#7A807C] font-semibold -mt-1">
              Digital Invitation
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/templates"
            className="text-sm font-medium text-[#4E5450] hover:text-[#1F2421] transition-colors flex items-center gap-1.5"
          >
            <LayoutTemplate className="w-4 h-4 text-[#C5A880]" />
            Katalog Template
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-[#4E5450] hover:text-[#1F2421] transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-[#C5A880]" />
            Fitur Editor
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[#4E5450] hover:text-[#1F2421] transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4 text-[#C5A880]" />
            Paket & Harga
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-[#4E5450] hover:text-[#1F2421] transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-[#C5A880]" />
            FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {displayName ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs font-semibold flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{displayName}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-xs text-gray-500 hover:text-red-600"
                title="Keluar (Sign Out)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
          )}

          <Link href="/editor/new">
            <Button variant="gold" size="sm" className="shadow-sm">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Buat Undangan
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1F2421] hover:bg-[#F3EFE6]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E3DA] bg-[#FCFBF7] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3">
            <Link
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#1F2421] py-2 border-b border-[#E8E3DA]/50 flex items-center justify-between"
            >
              <span>Katalog Template</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#1F2421] py-2 border-b border-[#E8E3DA]/50 flex items-center justify-between"
            >
              <span>Fitur Editor</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#1F2421] py-2 border-b border-[#E8E3DA]/50 flex items-center justify-between"
            >
              <span>Paket & Harga</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#1F2421] py-2 border-b border-[#E8E3DA]/50 flex items-center justify-between"
            >
              <span>Pertanyaan Umum (FAQ)</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </Link>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            {displayName ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full justify-center">
                    Dashboard ({displayName})
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  Masuk ke Akun
                </Button>
              </Link>
            )}
            <Link href="/editor/new" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="gold" className="w-full justify-center">
                Buat Undangan Sekarang
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
