import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, ChevronRight } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
  const { siteSettings } = useFirebase();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    'Fashion', 'Business', 'Sports', 'Cinema', 
    'Culture', 'Luxury', 'Influence', 'Leadership'
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? 'glass-nav py-4' : 'bg-transparent py-8'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between relative">
          <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0 md:flex-initial">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="hidden md:flex text-reserve-text hover:text-reserve-accent transition-colors items-center gap-2 group"
            >
              <Menu size={20} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Menu</span>
            </button>
            
            <div className="hidden lg:flex items-center gap-6">
              <Search 
                size={18} 
                className="text-reserve-gray cursor-pointer hover:text-reserve-text transition-colors"
                onClick={() => setIsSearchOpen(true)}
              />
            </div>

            <Link to="/" className="md:absolute md:left-1/2 md:-translate-x-1/2 flex-shrink min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-4xl font-bold tracking-tighter text-reserve-text uppercase flex-shrink min-w-0 truncate">
                {siteSettings?.title || 'THE RESERVE'}<span className="text-reserve-accent">.</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-shrink-0 ml-4">
            <Link 
              to={siteSettings?.ctaButton.url || '/get-featured'}
              className="flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 border border-reserve-border rounded-full text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-widest whitespace-nowrap hover:bg-reserve-text hover:text-reserve-bg transition-all duration-300 flex-shrink-0"
            >
              {siteSettings?.ctaButton.text || 'Get Featured'}
            </Link>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-reserve-text hover:text-reserve-accent transition-colors p-1.5 sm:p-2"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-reserve-text hover:text-reserve-accent transition-colors p-1.5 sm:p-2"
            >
              <Menu size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-reserve-bg bg-opacity-95 backdrop-blur-xl flex"
          >
            <div className="w-full lg:w-1/3 h-full border-r border-reserve-border p-12 flex flex-col justify-between">
              <div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="mb-16 text-reserve-gray hover:text-reserve-text transition-colors flex items-center gap-2"
                >
                  <X size={24} />
                  <span className="text-[11px] uppercase tracking-widest">Close</span>
                </button>

                <div className="space-y-6">
                  {menuItems.map((item, i) => (
                    <motion.a
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      href={`#${item.toLowerCase()}`}
                      className="group flex items-center justify-between text-3xl md:text-5xl font-serif text-reserve-text hover:text-reserve-accent transition-all pl-2 hover:pl-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                      <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="pb-8">
                <p className="text-[11px] text-reserve-gray uppercase tracking-widest mb-4">The Reserve Magazine</p>
                <div className="flex gap-4">
                  <a href={siteSettings?.socialUrls?.instagram || '#'} target="_blank" rel="noreferrer" className="text-xs hover:text-reserve-accent transition-colors">Instagram</a>
                  <a href={siteSettings?.socialUrls?.facebook || '#'} target="_blank" rel="noreferrer" className="text-xs hover:text-reserve-accent transition-colors">Facebook</a>
                  <Link to="/archive" className="text-xs hover:text-reserve-accent transition-colors">Archive</Link>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block flex-1 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale hover:grayscale-0 transition-all duration-1000" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
