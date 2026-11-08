'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SectionAnimation } from '@/types';

/**
 * Pembungkus seksi undangan dengan animasi masuk (fitur PRO).
 *
 * - `animation="none"` atau `enabled={false}` -> pembungkus biasa, konten
 *   selalu terlihat, tanpa kelas animasi sama sekali.
 * - Selain itu, kelas `rynora-section-anim` + `data-animation` baru dipasang
 *   setelah mount (di dalam useEffect) dan `.is-visible` ditambahkan oleh
 *   IntersectionObserver saat seksi masuk layar.
 * - Jika JS tidak jalan, IntersectionObserver tidak tersedia, atau pengguna
 *   memakai prefers-reduced-motion -> tidak ada kelas tersembunyi yang
 *   dipasang, jadi konten TIDAK PERNAH hilang.
 */
export function AnimatedSection({
  animation = 'none',
  enabled = true,
  className,
  children,
}: {
  animation?: SectionAnimation;
  enabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  const active = enabled && animation !== 'none';

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    // Pasang keadaan awal tersembunyi HANYA setelah JS berjalan.
    setArmed(true);
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={ref}
      data-animation={active && armed ? animation : undefined}
      className={`${active && armed ? 'rynora-section-anim' : ''} ${
        visible ? 'is-visible' : ''
      }${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}
