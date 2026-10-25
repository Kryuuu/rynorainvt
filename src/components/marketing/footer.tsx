import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#E8E3DA] bg-[#FAF8F5] text-[#4E5450] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1F2421] flex items-center justify-center text-[#FCFBF7]">
                <span className="font-serif-luxury text-lg font-bold italic text-[#C5A880]">R</span>
              </div>
              <span className="font-serif-luxury text-xl font-bold tracking-tight text-[#1F2421]">
                Rynora<span className="text-[#C5A880]">.</span>Invite
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#636965]">
              Platform SaaS website undangan digital premium untuk mempelai personal dan studio vendor profesional.
            </p>
            <p className="text-xs text-[#8A908C]">
              Zona Waktu Standar: Asia/Makassar (WITA)
            </p>
          </div>

          {/* Produk */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F2421] mb-4">
              Produk
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/templates" className="hover:text-[#1F2421] transition-colors">
                  Katalog Template
                </Link>
              </li>
              <li>
                <Link href="/#editor-simple" className="hover:text-[#1F2421] transition-colors">
                  Simple Guided Editor
                </Link>
              </li>
              <li>
                <Link href="/#editor-visual" className="hover:text-[#1F2421] transition-colors">
                  Advanced Visual Builder
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#1F2421] transition-colors">
                  Daftar Paket & Harga
                </Link>
              </li>
              <li>
                <Link href="/vendor" className="hover:text-[#1F2421] transition-colors">
                  Vendor Studio Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategori Acara */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F2421] mb-4">
              Kategori Acara
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/templates?category=wedding" className="hover:text-[#1F2421] transition-colors">
                  Pernikahan & Resepsi
                </Link>
              </li>
              <li>
                <Link href="/templates?category=birthday" className="hover:text-[#1F2421] transition-colors">
                  Ulang Tahun & Sweet 17
                </Link>
              </li>
              <li>
                <Link href="/templates?category=aqiqah" className="hover:text-[#1F2421] transition-colors">
                  Aqiqah & Khitan
                </Link>
              </li>
              <li>
                <Link href="/templates?category=corporate" className="hover:text-[#1F2421] transition-colors">
                  Acara Korporat & Seminar
                </Link>
              </li>
              <li>
                <Link href="/templates?category=graduation" className="hover:text-[#1F2421] transition-colors">
                  Wisuda & Kelulusan
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan & Keamanan */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F2421] mb-4">
              Dukungan & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#faq" className="hover:text-[#1F2421] transition-colors">
                  Bantuan & FAQ
                </a>
              </li>
              <li>
                <span className="text-[#8A908C]">Keamanan Data & Privasi</span>
              </li>
              <li>
                <span className="text-[#8A908C]">Syarat & Ketentuan Layanan</span>
              </li>
              <li>
                <Link href="/admin" className="text-xs text-[#C5A880] hover:underline font-medium">
                  Portal Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8E3DA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A807C] gap-4">
          <p>© 2026 Rynora Invite. Hak cipta dilindungi undang-undang.</p>
          <p>Didesain dengan presisi dan keanggunan untuk momen istimewa Anda.</p>
        </div>
      </div>
    </footer>
  );
}
