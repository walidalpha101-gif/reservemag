import React, { useState } from 'react';
import { newsletterService } from '../services/newsletterService';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await newsletterService.subscribe(email, 'homepage_cta');
      if (res.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(res.message || 'Subscription failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <section className="py-40 bg-reserve-bg relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <h2 className="text-[20vw] font-bold tracking-tighter uppercase whitespace-nowrap">The Ledger</h2>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[11px] uppercase tracking-[0.5em] text-reserve-accent mb-8 block">Exclusive Insight</span>
          <h3 className="text-5xl md:text-7xl font-serif mb-12">Subscribe to The Ledger</h3>
          <p className="text-reserve-gray text-lg mb-16 font-light leading-relaxed">
            The week’s most essential narratives, delivered with cinematic clarity. Join our inner circle of international thinkers and leaders.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-center">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL ADDRESS" 
              className="flex-1 w-full bg-transparent border-b border-reserve-border py-4 text-center md:text-left text-xl focus:outline-none focus:border-reserve-accent transition-colors placeholder:text-zinc-800"
            />
            <button 
              disabled={status === 'loading'}
              className="w-full md:w-auto px-12 py-4 bg-reserve-text text-reserve-bg text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-reserve-accent transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'BEING PROCESSED...' : 'Join'}
            </button>
          </form>
          
          <div className="h-6 mt-4">
            {status === 'success' && (
              <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold animate-in fade-in slide-in-from-top-1">
                Your place in the archive is secured. Selection complete.
              </p>
            )}
            {status === 'error' && (
              <p className="text-[10px] uppercase tracking-widest text-rose-500 font-bold animate-in fade-in slide-in-from-top-1">
                {message}
              </p>
            )}
          </div>

          <p className="mt-8 text-[9px] uppercase tracking-widest text-zinc-700">
            By joining, you agree to our Terms of Service and Privacy Protocol.
          </p>
        </div>
      </div>
    </section>
  );
}
