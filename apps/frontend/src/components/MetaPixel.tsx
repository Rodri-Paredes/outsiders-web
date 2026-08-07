'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Meta (Facebook) Pixel initializer.
 *
 * Renders the base Pixel snippet and fires PageView on every route change.
 * If NEXT_PUBLIC_META_PIXEL_ID is not set, renders nothing — safe to include
 * in layout.tsx before having the actual Pixel ID.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const isInitialized = useRef(false);

  // Fire PageView on client-side navigation (SPA route changes).
  // The initial PageView is handled by fbq('track', 'PageView') in the
  // inline script below (runs once on first load).
  useEffect(() => {
    if (!PIXEL_ID) return;
    // Skip the very first render — the inline script already fires PageView.
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      {/* Inline init — runs before any route component mounts */}
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
