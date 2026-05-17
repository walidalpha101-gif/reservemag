import { Instagram, Twitter, Facebook, ArrowUp, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';

export default function Footer() {
  const { siteSettings } = useFirebase();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-reserve-bg pt-32 pb-16 border-t border-reserve-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold tracking-tighter mb-8 uppercase">
              {siteSettings?.title || 'THE RESERVE'}<span className="text-reserve-accent">.</span>
            </h2>
            <p className="text-reserve-gray max-w-sm font-light leading-relaxed mb-12">
              {siteSettings?.description || 'An international media platform curated for the modern elite. Exploring the intersection of luxury, culture, and progress in South Asia and beyond.'}
            </p>
            <div className="flex gap-4">
              <a 
                href={siteSettings?.socialUrls?.instagram || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="p-3 border border-reserve-border rounded-full hover:border-reserve-accent transition-colors"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href={siteSettings?.socialUrls?.facebook || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="p-3 border border-reserve-border rounded-full hover:border-reserve-accent transition-colors"
                title="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <span className="text-[10px] uppercase tracking-widest text-reserve-gray block mb-8 font-bold">Registry Index</span>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                'Navigation', 'Digital Archive', 'Editorial Policy', 'Private Ledger',
                'Editorial Board', 'Advertising', 'Legal'
              ].map((label) => {
                const url = siteSettings?.footerUrls?.[label] || '/';
                const isInternal = url.startsWith('/');
                
                return (
                  <div key={label}>
                    {isInternal ? (
                      <Link 
                        to={url}
                        className="text-[11px] font-light hover:text-reserve-accent transition-colors uppercase tracking-widest text-zinc-400"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a 
                        href={url} 
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-light hover:text-reserve-accent transition-colors uppercase tracking-widest text-zinc-400"
                      >
                        {label}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-reserve-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            © 2026 The Reserve Magazine Group. All Rights Reserved. Crafted in Dhaka.
          </p>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <span className="text-[10px] uppercase tracking-widest text-reserve-gray group-hover:text-reserve-text transition-colors">Back to Top</span>
            <div className="p-3 border border-reserve-border rounded-full group-hover:border-reserve-accent group-hover:-translate-y-1 transition-all">
              <ArrowUp size={16} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
