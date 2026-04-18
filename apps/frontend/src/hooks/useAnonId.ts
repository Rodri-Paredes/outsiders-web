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
      // crypto.randomUUID() está disponible en todos los navegadores modernos
      id = crypto.randomUUID();
      localStorage.setItem(ANON_ID_KEY, id);
    }
    setAnonId(id);
  }, []);

  return anonId;
}
