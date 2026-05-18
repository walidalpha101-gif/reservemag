import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Author } from '../types';

interface AuthorProfileCardProps {
  author: Author;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthorProfileCard({ author, isOpen, onClose }: AuthorProfileCardProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          />
          
          {/* Card */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-reserve-bg border border-white/10 w-full max-w-xs p-8 flex flex-col items-center text-center shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Subtle texture or accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-reserve-accent" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="mb-6 relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-700">
                  {author.imageUrl ? (
                    <img 
                      src={author.imageUrl} 
                      alt={author.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-serif text-2xl uppercase italic">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-serif text-white uppercase tracking-wider mb-1">{author.name}</h3>
                  <div className="h-0.5 w-8 bg-reserve-accent/30 mx-auto" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-reserve-accent font-medium">
                    {author.designation}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 italic">
                    {author.role}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 w-full">
                <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-bold">The Reserve Editorial Board</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
