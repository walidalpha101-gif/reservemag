import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { Article } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // We get all articles and filter on client side for best UX/speed if list isn't massive
        // Alternatively we can implement a search query in service
        const allArticles = await articleService.getAllArticles(false);
        const searchResults = allArticles.filter(article => 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.slug.toLowerCase().includes(query.toLowerCase()) ||
          article.category.toLowerCase().includes(query.toLowerCase()) ||
          article.author.toLowerCase().includes(query.toLowerCase())
        );
        setResults(searchResults.slice(0, 8)); // Limit to 8 for cinematic layout
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleResultClick = (slug: string) => {
    navigate(`/article/${slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-reserve-bg bg-opacity-98 backdrop-blur-2xl flex flex-col p-6 md:p-20"
        >
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-12 md:mb-20">
              <span className="text-[10px] uppercase tracking-[0.4em] text-reserve-accent font-bold">Search Archive</span>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-reserve-text"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${query ? 'text-reserve-accent' : 'text-reserve-gray group-focus-within:text-reserve-accent'}`} size={28} />
              <input 
                ref={inputRef}
                type="text"
                placeholder="DISCOVER NARRATIVES..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 py-6 pl-16 pr-10 text-3xl md:text-5xl font-serif text-white placeholder:text-zinc-800 transition-all focus:outline-none focus:border-reserve-accent/50 lowercase"
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-reserve-accent" size={24} />
                </div>
              )}
            </div>

            <div className="mt-12 md:mt-24 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
              <AnimatePresence mode="popLayout">
                {results.length > 0 ? (
                  results.map((article, i) => (
                    <motion.button
                      key={article.id || article.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleResultClick(article.slug)}
                      className="w-full group flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-reserve-accent/30 transition-all duration-500 rounded-lg text-left"
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 hidden sm:block">
                        <img 
                          src={article.image.url || undefined} 
                          alt="" 
                          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-1000 rounded-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-widest text-reserve-accent font-bold px-2 py-0.5 bg-reserve-accent/10 rounded-sm">
                            {article.category}
                          </span>
                          {article.readTime && (
                            <span className="text-[9px] uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                              <Clock size={10} /> {article.readTime}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-serif text-reserve-text group-hover:text-reserve-accent transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-zinc-500 text-xs md:text-sm line-clamp-1 font-light tracking-wide">
                          {article.excerpt}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-zinc-800 self-center group-hover:text-reserve-accent group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))
                ) : query.trim() && !loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-10 text-center space-y-3"
                  >
                    <BookOpen size={40} className="mx-auto text-zinc-800" />
                    <p className="text-zinc-600 uppercase tracking-[0.2em] text-[10px]">No narratives match your exploration in the archive.</p>
                  </motion.div>
                ) : !query && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {['FASHION', 'BUSINESS', 'CULTURE', 'CINEMA'].map((cat, i) => (
                      <button 
                        key={cat}
                        onClick={() => setQuery(cat)}
                        className="p-8 border border-white/5 bg-white/[0.01] hover:border-reserve-accent/20 hover:bg-reserve-accent/[0.02] transition-all text-center rounded-lg group"
                      >
                        <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 group-hover:text-reserve-accent transition-colors">{cat}</span>
                      </button>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
