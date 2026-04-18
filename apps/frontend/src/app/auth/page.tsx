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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-28 pb-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-4xl font-light text-white tracking-[0.25em]">OUTSIDERS</span>
          </Link>
          <h2 className="text-2xl font-light text-white tracking-tight">
            {mode === 'forgot' ? 'Recuperar Contraseña' : mode === 'signup' ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          {mode === 'forgot' && !resetSent && (
            <p className="text-sm text-gray-400 mt-2">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
          )}
        </div>

        {mode === 'forgot' && resetSent ? (
          <div className="text-center space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium mb-2">¡Correo enviado!</p>
              <p className="text-gray-400 text-xs">
                Revisa tu bandeja de entrada en <span className="text-white">{email}</span> y sigue el enlace para restablecer tu contraseña.
              </p>
            </div>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Volver a iniciar sesión
            </button>
          </div>
        ) : signupSent ? (
          <div className="text-center space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium mb-2">¡Revisa tu correo!</p>
              <p className="text-gray-400 text-xs">
                Enviamos un enlace de verificación a <span className="text-white">{email}</span>. Confirma tu cuenta para poder iniciar sesión.
              </p>
            </div>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-light text-gray-light mb-2 tracking-wide">
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-light text-gray-light mb-2 tracking-wide">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-card border border-white/10 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-light text-gray-light mb-2 tracking-wide">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-card border border-white/10 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-4 px-4 font-light text-xs tracking-widest uppercase hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Cargando...'
                  : mode === 'forgot'
                  ? 'Enviar enlace de recuperación'
                  : mode === 'signup'
                  ? 'Crear Cuenta'
                  : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Forgot password link (only on signin) */}
            {mode === 'signin' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              {mode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  ← Volver a iniciar sesión
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-sm text-gray-light hover:text-white transition-colors"
                >
                  {mode === 'signup' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-medium hover:text-gray-light transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <AuthPageContent />;
}
