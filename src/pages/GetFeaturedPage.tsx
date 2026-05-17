import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, CheckCircle2, Loader2, Star, ShieldCheck, TrendingUp, Presentation } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { leadService } from '../services/leadService';

export default function GetFeaturedPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    email: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    industry: '',
    budget: '',
    message: ''
  });
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.whatsapp.trim()) {
      setShowError(true);
      return;
    }
    
    setShowError(false);
    setLoading(true);
    try {
      await leadService.submitRequest(formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      alert('Engagement failed. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    {
      id: 'entry',
      name: 'The Entry',
      description: 'For emerging founders and visionary rising brands.',
      price: '৳15,000',
      features: ['Editorial Spotlight', 'Standard Distribution', 'Digital Archive Placement']
    },
    {
      id: 'feature',
      name: 'The Feature',
      description: 'Premium editorial immersion and strategic homepage visibility.',
      price: '৳40,000',
      features: ['Full Interview / Profile', 'Homepage Hero Placement', 'Social Media Amplification', 'Cinematic Photography Option']
    },
    {
      id: 'cover',
      name: 'The Cover',
      description: 'The ultimate editorial campaign with luxury artistic treatment.',
      price: 'Custom Pricing',
      features: ['Cover Story Status', 'Exclusive Video Portrait', 'Full Brand Architecture', 'Multi-channel Domination']
    }
  ];

  const offerings = [
    { title: 'Editorial Features', icon: Star, desc: 'Executive profiles, founder interviews, and cultural narratives shaped by our senior editorial board.' },
    { title: 'Brand Visibility', icon: TrendingUp, desc: 'Strategic positioning across The Reserve homepage and digital infrastructure for maximum influence.' },
    { title: 'Prestige Positioning', icon: Presentation, desc: 'Fashion editorial treatment and public image refinement for modern icons and luxury icons.' }
  ];

  return (
    <div className="bg-reserve-bg min-h-screen text-reserve-text selection:bg-reserve-accent selection:text-reserve-bg">
      <Navbar />

      <main className="pt-32 pb-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              <h2 className="text-[10px] uppercase tracking-[0.6em] text-reserve-accent font-bold">Partnerships</h2>
              <h1 className="text-5xl md:text-8xl font-serif leading-[1.1] tracking-tight">
                Visibility Reserved for <br />
                <span className="italic font-normal">the Exceptional.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-light leading-relaxed">
                The Reserve partners with founders, athletes, cultural figures, luxury brands, and modern icons shaping Bangladesh in 2026.
              </p>
              <div className="flex flex-col items-center gap-4 pt-8">
                <a 
                  href="#application" 
                  className="px-10 py-5 bg-reserve-text text-reserve-bg text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-reserve-accent transition-all duration-500"
                >
                  Request Editorial Consideration
                </a>
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Limited editorial placements annually.</span>
              </div>
            </motion.div>
          </section>

          {/* Offerings Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-40 border-y border-white/5 py-32">
            {offerings.map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="space-y-6"
              >
                <item.icon className="text-reserve-accent" size={32} strokeWidth={1} />
                <h3 className="text-2xl font-serif">{item.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </section>

          {/* Editorial Access Tiers */}
          <section className="mb-40">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Editorial Access</h2>
              <p className="text-zinc-600 uppercase tracking-widest text-[10px]">Select your tier of cultural integration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 border border-white/5 bg-white/[0.01] hover:border-reserve-accent/30 transition-all duration-700 group flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <h3 className="text-2xl font-serif group-hover:text-reserve-accent transition-colors">{tier.name}</h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed">{tier.description}</p>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-zinc-700 uppercase tracking-[0.2em] text-[9px] mb-6">Inclusions:</p>
                      <ul className="space-y-4">
                        {tier.features.map(f => (
                          <li key={f} className="text-xs text-zinc-400 flex items-center gap-3">
                            <span className="w-1 h-1 bg-reserve-accent rounded-full" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="pt-12 mt-12 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Investment:</p>
                    <p className="text-2xl font-medium tracking-tight font-serif">{tier.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-full">
                <ShieldCheck size={18} className="text-reserve-accent" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Private Retainer / Long-term partnerships availabile on request.</span>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section id="application" className="max-w-4xl mx-auto bg-white/[0.02] border border-white/5 p-10 md:p-20 relative overflow-hidden">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 bg-reserve-accent/10 border border-reserve-accent rounded-full flex items-center justify-center mx-auto mb-10">
                  <CheckCircle2 size={40} className="text-reserve-accent" />
                </div>
                <h2 className="text-3xl md:text-5xl font-serif">Consideration Received.</h2>
                <p className="text-zinc-400 text-lg leading-relaxed max-w-lg mx-auto">
                  Our editorial board will privately review your profile. You will be contacted via the provided credentials if selected for partnership.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-reserve-accent uppercase tracking-widest text-[10px] hover:underline"
                >
                  Submit another request
                </button>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-16 space-y-4">
                   <h2 className="text-3xl md:text-5xl font-serif">Request Editorial Consideration</h2>
                   <p className="text-zinc-600 uppercase tracking-widest text-[10px]">Confidential submission for the 2026 archive.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Legal Name / Representative (Optional)</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                        placeholder="e.g. ARYA SHAH"
                      />
                    </div>
                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Brand / Entity Name (Optional)</label>
                      <input 
                        type="text" 
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                        placeholder="e.g. ARCHITECTURE LABS"
                      />
                    </div>
                    
                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="space-y-4 group">
                      <label className={`text-[10px] uppercase tracking-widest transition-colors ${showError ? 'text-reserve-accent' : 'text-zinc-600 group-focus-within:text-reserve-accent'}`}>WhatsApp Number (Required)</label>
                      <input 
                        required
                        type="tel" 
                        inputMode="tel"
                        value={formData.whatsapp}
                        onChange={(e) => {
                          setFormData({...formData, whatsapp: e.target.value});
                          if (showError && e.target.value.trim()) setShowError(false);
                        }}
                        className={`w-full bg-transparent border-b py-4 focus:outline-none transition-colors text-white ${showError ? 'border-reserve-accent' : 'border-white/10 focus:border-reserve-accent'}`}
                        placeholder="+880 / Global Format"
                      />
                      {showError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="text-reserve-accent text-[9px] uppercase tracking-widest"
                        >
                          WhatsApp contact is required.
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Facebook URL (Optional)</label>
                      <input 
                        type="url" 
                        value={formData.facebookUrl}
                        onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                        placeholder="Facebook profile/page link"
                      />
                    </div>

                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Instagram URL (Optional)</label>
                      <input 
                        type="url" 
                        value={formData.instagramUrl}
                        onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                        placeholder="Instagram profile link"
                      />
                    </div>

                    <div className="space-y-4 group md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">LinkedIn URL (Optional)</label>
                      <input 
                        type="url" 
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                        placeholder="LinkedIn profile link"
                      />
                    </div>

                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Industry (Optional)</label>
                      <select 
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white appearance-none"
                      >
                        <option value="" className="bg-zinc-950">SELECT INDUSTRY</option>
                        <option value="Fashion" className="bg-zinc-950">FASHION & LIFESTYLE</option>
                        <option value="Business" className="bg-zinc-950">TECH & BUSINESS</option>
                        <option value="Arts" className="bg-zinc-950">ARTS & EXHIBITION</option>
                        <option value="Luxury" className="bg-zinc-950">LUXURY REAL ESTATE</option>
                        <option value="Entertainment" className="bg-zinc-950">ENTERTAINMENT</option>
                      </select>
                    </div>
                    <div className="space-y-4 group">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Investment Range (Approx - Optional)</label>
                      <select 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white appearance-none"
                      >
                        <option value="" className="bg-zinc-950">SELECT RANGE</option>
                        <option value="৳15k - ৳40k" className="bg-zinc-950">৳15,000 - ৳40,000</option>
                        <option value="৳40k - ৳100k" className="bg-zinc-950">৳40,000 - ৳100,000</option>
                        <option value="৳100k+" className="bg-zinc-950">৳100,000+</option>
                        <option value="Retainer" className="bg-zinc-950">CUSTOM / RETAINER</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 group">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Project Intent / Editorial Message (Optional)</label>
                    <textarea 
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-transparent border border-white/10 p-6 focus:outline-none focus:border-reserve-accent transition-colors text-white resize-none"
                      placeholder="DESCRIBE YOUR NARRATIVE..."
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-6 bg-white text-black text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-reserve-accent transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        TRANSMITTING...
                      </>
                    ) : (
                      'SUBMIT APPLICATION'
                    )}
                  </button>
                </form>
              </>
            )}
          </section>

          {/* Outro */}
          <section className="mt-40 text-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-serif max-w-4xl mx-auto leading-tight italic">
              "The Reserve exists for those shaping the next era of influence, culture, and authority."
            </h2>
            <div className="flex justify-center pt-8">
              <a href="#application" className="flex items-center gap-4 group">
                <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 group-hover:text-reserve-accent transition-colors">Begin the Conversation</span>
                <ChevronRight size={18} className="text-reserve-accent" />
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
