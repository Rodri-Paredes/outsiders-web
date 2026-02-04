'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const WHATSAPP_NUMBER = '59178788416';

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
                href="https://instagram.com/outsiders" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/outsiders" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
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

          {/* Info */}
          <div>
            <h4 className="text-xs font-medium text-white mb-6 uppercase tracking-[0.25em]">Información</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-light hover:text-white transition-colors font-light">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-light hover:text-white transition-colors font-light">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-light hover:text-white transition-colors font-light">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-light hover:text-white transition-colors font-light">
                  Guía de Tallas
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium text-white mb-6 uppercase tracking-[0.25em]">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-light mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-light font-light">
                  Santa Cruz, Bolivia
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-light mt-1 flex-shrink-0" />
                <button 
                  onClick={handleWhatsApp}
                  className="text-sm text-gray-light hover:text-white transition-colors font-light text-left"
                >
                  +591 78788416
                </button>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-light mt-1 flex-shrink-0" />
                <a 
                  href="mailto:info@outsiders.com" 
                  className="text-sm text-gray-light hover:text-white transition-colors font-light"
                >
                  info@outsiders.com
                </a>
              </li>
            </ul>
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
