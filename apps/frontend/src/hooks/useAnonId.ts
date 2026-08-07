'use client';

import { useEffect, useState } from 'react';

const ANON_ID_KEY = 'outsiders_anon_id';

/**
 * Identifica al visitante de forma anónima sin requerir una cuenta.
 * Genera un UUID único la primera vez y lo persiste en localStorage.
 * Devuelve null durante SSR (servidor) — solo disponible en el cliente.
 */
export function useAnonId(): string | null {
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
      } else {
        // Fallback para entornos HTTP no seguros (ej. pruebas en red local desde celular)
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem(ANON_ID_KEY, id);
    }
    setAnonId(id);
  }, []);

  return anonId;
}
