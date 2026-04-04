'use client';

import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section className="section-padding bg-black">
      <div className="container-custom">
        <div className="border-t border-b border-white/10 py-20 text-center">
          {/* Content */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4 mb-12">
              <h2 className="text-5xl md:text-7xl font-light text-white tracking-tighter">
                Newsletter
              </h2>
              <div className="h-px w-24 bg-white/30 mx-auto" />
            </div>
            <p className="text-gray-light text-xs mb-12 tracking-[0.3em] uppercase font-light">
              Stay updated with our latest drops
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="flex-1 px-6 py-4 bg-dark-card border border-white/10 text-white placeholder-gray-medium focus:outline-none focus:border-white transition-colors text-sm font-light tracking-wider"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-12 py-4 bg-white text-black text-xs font-light tracking-widest uppercase hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : 'Subscribe'}
              </button>
            </form>

            {/* Status Messages */}
            {status === 'success' && (
              <p className="mt-6 text-gray-light font-light text-sm tracking-widest uppercase">
                Thank you for subscribing
              </p>
            )}
            {status === 'error' && (
              <p className="mt-6 text-gray-light font-light text-sm tracking-widest uppercase">
                Error. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
