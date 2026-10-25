'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Sparkles, Eye, ArrowRight, Smartphone, Monitor } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INITIAL_TEMPLATES } from '@/lib/data-store';
import { EventCategory } from '@/types';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | 'free' | 'premium'>('all');

  const categories = [
    { id: 'all', name: 'Semua Kategori' },
    { id: 'wedding', name: 'Pernikahan' },
    { id: 'birthday', name: 'Ulang Tahun' },
    { id: 'corporate', name: 'Korporat' },
    { id: 'aqiqah', name: 'Aqiqah' },
  ];

  const filteredTemplates = useMemo(() => {
    return INITIAL_TEMPLATES.filter(tpl => {
      const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
      const matchesTier = selectedTier === 'all' ||
        (selectedTier === 'premium' && tpl.is_premium) ||
        (selectedTier === 'free' && !tpl.is_premium);

      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [searchQuery, selectedCategory, selectedTier]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="gold">Katalog Template</Badge>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#1F2421]">
              Pilih Desain Impian Anda
            </h1>
            <p className="text-[#555C57] text-base">
              Setiap template dibuat dengan tata letak proporsional, kombinasi warna estetis, dan animasi yang halus. Siap disesuaikan dengan mudah.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-6 rounded-2xl border border-[#E8E3DA] bg-white shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A807C]" />
                <input
                  type="text"
                  placeholder="Cari nama atau gaya template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:border-transparent text-[#1F2421]"
                />
              </div>

              {/* Free vs Premium Toggle */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setSelectedTier('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedTier === 'all'
                      ? 'bg-[#1F2421] text-[#FCFBF7]'
                      : 'bg-[#F3EFE6] text-[#4E5450] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedTier('free')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedTier === 'free'
                      ? 'bg-[#1F2421] text-[#FCFBF7]'
                      : 'bg-[#F3EFE6] text-[#4E5450] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Gratis
                </button>
                <button
                  onClick={() => setSelectedTier('premium')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedTier === 'premium'
                      ? 'bg-[#C5A880] text-white'
                      : 'bg-[#F3EFE6] text-[#4E5450] hover:bg-[#EAE4D7]'
                  }`}
                >
                  Premium
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-t border-[#E8E3DA] pt-3 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#1F2421] text-[#FCFBF7] shadow-sm'
                      : 'bg-[#FAF8F5] text-[#555C57] hover:bg-[#EAE4D7] border border-[#E8E3DA]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E3DA] space-y-3">
              <Sparkles className="w-8 h-8 text-[#C5A880] mx-auto opacity-50" />
              <h3 className="font-serif-luxury text-xl font-bold text-[#1F2421]">Tidak ada template yang cocok</h3>
              <p className="text-sm text-[#7A807C]">Coba gunakan kata kunci pencarian lain atau ganti filter kategori.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((tpl) => (
                <div key={tpl.id} className="luxury-card rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div>
                    {/* Preview Image */}
                    <div className="relative h-72 overflow-hidden bg-gray-100">
                      <img
                        src={tpl.preview_image_url}
                        alt={tpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {tpl.is_premium ? (
                          <Badge variant="gold">Premium</Badge>
                        ) : (
                          <Badge variant="secondary">Gratis</Badge>
                        )}
                        <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider">
                          {tpl.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-6 space-y-2">
                      <h3 className="font-serif-luxury text-2xl font-bold text-[#1F2421]">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-[#555C57] leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 border-t border-[#E8E3DA] flex items-center justify-between gap-3 mt-4">
                    <Link href={`/templates/${tpl.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                    </Link>
                    <Link href={`/dashboard?create=true&template=${tpl.id}`} className="flex-1">
                      <Button variant="gold" size="sm" className="w-full text-xs">
                        Gunakan Template
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
