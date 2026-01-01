'use client';

import { ReactNode, useEffect } from 'react';

export default function SmoothProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Simple smooth scroll polyfill
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const targetId = href.replace('#', '');
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80, // Account for header
              behavior: 'smooth'
            });
          }
        }
      }
    };

    // Add CSS for smooth scrolling
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
        scroll-padding-top: 80px;
      }
      
      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
      }
    `;
    document.head.appendChild(style);

    // Handle anchor clicks
    document.addEventListener('click', handleSmoothScroll);

    return () => {
      document.removeEventListener('click', handleSmoothScroll);
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
}