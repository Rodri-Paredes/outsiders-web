'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Evitar SSR para esta página
const AuthPageContent = dynamic(() => Promise.resolve(AuthPageInner), {
  ssr: false,
});

function AuthPageInner() {
  const { useAuth } = require('../../contexts/AuthContext');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (resetError) throw resetError;
        setResetSent(true);
      } else if (mode === 'signup') {
        await signUp(email, password, name);
        setSignupSent(true);
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setError('');
    setResetSent(false);
    setSignupSent(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex">
      {/* LEFT — brand image panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden">
        <img
          src="/logos/_DSC5826-2.jpg.jpeg"
          alt="Outsiders"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

      </div>

      {/* RIGHT — form panel */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col overflow-y-auto bg-[#0A0A0A]">
        {/* Top bar */}
        <div className="flex items-center justify-end px-8 pt-8 pb-0 shrink-0">
          <Link
            href="/"
            className="text-[10px] text-white/40 hover:text-white transition-colors tracking-[0.2em] uppercase"
          >
            ← Tienda
          </Link>
        </div>

        {/* Form wrapper — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link href="/">
                <img
                  src="/logos/navbar logo negro.png"
                  alt="øutsiders"
                  className="h-16 md:h-20 w-auto brightness-0 invert"
                />
              </Link>
            </div>

            {/* Title */}
            <div className="mb-10">
              <h1 className="text-lg font-light text-white tracking-tight mb-2">
                {mode === 'forgot'
                  ? 'Recuperar\ncontraseña'
                  : mode === 'signup'
                  ? 'Crear\ncuenta'
                  : 'Iniciar sesión'}
              </h1>
              {mode === 'forgot' && !resetSent && (
                <p className="text-sm text-white/40 mt-3 leading-relaxed">
                  Te enviaremos un enlace para restablecer tu contraseña.
                </p>
              )}
            </div>

            {/* Success states */}
            {mode === 'forgot' && resetSent ? (
              <div className="space-y-6">
                <div className="border border-white/10 p-6">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">¡Correo enviado!</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Revisa tu bandeja en <span className="text-white">{email}</span> y sigue el enlace para restablecer tu contraseña.
                  </p>
                </div>
                <button type="button" onClick={() => switchMode('signin')} className="text-xs text-white/40 hover:text-white transition-colors tracking-wide">
                  ← Volver a iniciar sesión
                </button>
              </div>
            ) : signupSent ? (
              <div className="space-y-6">
                <div className="border border-white/10 p-6">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">¡Revisa tu correo!</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Enviamos un enlace de verificación a <span className="text-white">{email}</span>. Confirma tu cuenta para iniciar sesión.
                  </p>
                </div>
                <button type="button" onClick={() => switchMode('signin')} className="text-xs text-white/40 hover:text-white transition-colors tracking-wide">
                  ← Volver a iniciar sesión
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-[10px] text-white/40 tracking-[0.2em] uppercase">
                        Nombre
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-0 py-3 bg-transparent border-b border-white/15 text-white text-sm focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[10px] text-white/40 tracking-[0.2em] uppercase">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-b border-white/15 text-white text-sm focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  {mode !== 'forgot' && (
                    <div className="space-y-1.5">
                      <label htmlFor="password" className="block text-[10px] text-white/40 tracking-[0.2em] uppercase">
                        Contraseña
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-0 py-3 bg-transparent border-b border-white/15 text-white text-sm focus:outline-none focus:border-white transition-colors"
                        minLength={6}
                      />
                    </div>
                  )}

                  {error && (
                    <p className="text-red-400 text-xs py-2 border-l-2 border-red-500 pl-3">
                      {error}
                    </p>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-black py-4 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? 'Cargando...'
                        : mode === 'forgot'
                        ? 'Enviar enlace'
                        : mode === 'signup'
                        ? 'Crear cuenta'
                        : 'Ingresar'}
                    </button>
                  </div>
                </form>

                {/* Secondary actions */}
                <div className="mt-6 flex flex-col items-center gap-3">
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-white/30 hover:text-white/70 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                  <div className="w-full border-t border-white/8 pt-5 text-center">
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'signup' ? 'signin' : mode === 'forgot' ? 'signin' : 'signup')}
                      className="text-[11px] text-white/40 hover:text-white transition-colors tracking-wide"
                    >
                      {mode === 'signup'
                        ? '¿Ya tienes cuenta? Inicia sesión'
                        : mode === 'forgot'
                        ? '← Volver a iniciar sesión'
                        : '¿No tienes cuenta? Regístrate'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <AuthPageContent />;
}
