'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const WHATSAPP_NUMBER = '59164884458';

export function Footer() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
  };

  return (
    <footer className="bg-dark-card border-t border-white/10 mt-32">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-3xl font-light text-white tracking-[0.3em] mb-4 uppercase">OUTSIDERS</h3>
            <p className="text-sm text-gray-light font-light leading-relaxed mb-6">
              Streetwear de calidad para los que marcan tendencia.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/outsiders_brand/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/p/Outsiders-Brand-61563886501950/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@outsiders.bo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-medium text-white mb-6 uppercase tracking-[0.25em]">Tienda</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-sm text-gray-light hover:text-white transition-colors font-light">
                  Todos los Productos
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-gray-light hover:text-white transition-colors font-light">
                  Carrito de Compras
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Branches */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-medium text-white mb-6 uppercase tracking-[0.25em]">Contacto & Sucursales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Branches Column */}
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-light mt-0.5 flex-shrink-0" />
                  <a
                    href="https://maps.app.goo.gl/mXpEFRJ5z2CXwd2Y8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-light hover:text-white transition-colors font-light leading-relaxed"
                  >
                    Av. Potosí 1384, entre Av. Portales y Pedro Blanco<br />
                    <span className="font-medium text-white/70 text-xs uppercase tracking-widest mt-1 block">Cochabamba</span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-light mt-0.5 flex-shrink-0" />
                  <a
                    href="https://maps.app.goo.gl/MNdXKaCzUu9VS8Zf9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-light hover:text-white transition-colors font-light leading-relaxed"
                  >
                    Av. Busch 970, entre 2 y 3 anillo<br />
                    <span className="font-medium text-white/70 text-xs uppercase tracking-widest mt-1 block">Santa Cruz</span>
                  </a>
                </li>
              </ul>

              {/* Direct Contact Column */}
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-light mt-1 flex-shrink-0" />
                  <button
                    onClick={handleWhatsApp}
                    className="text-sm text-gray-light hover:text-white transition-colors font-light text-left"
                  >
                    +591 64884458
                  </button>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-light mt-1 flex-shrink-0" />
                  <a
                    href="mailto:outsidersbrandstudios@gmail.com"
                    className="text-sm text-gray-light hover:text-white transition-colors font-light break-all"
                  >
                    outsidersbrandstudios@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-medium font-light tracking-wider">
            © 2026 OUTSIDERS. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-medium font-light tracking-wider uppercase">Envíos a todo Bolivia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
