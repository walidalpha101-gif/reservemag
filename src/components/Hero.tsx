import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import ResponsiveImage from './ui/ResponsiveImage';

interface HeroProps {
  article: Article;
}

export default function Hero({ article }: HeroProps) {
  const slug = article.slug || article.title.toLowerCase().replace(/ /g, '-');
  
  return (
    <Link to={`/${slug}`} className="block">
      <section 
        className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-reserve-bg cursor-pointer"
      >
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 1.5, ease: [0.2, 0, 0.2, 1] }}
        className="absolute inset-0 z-0"
      >
        <ResponsiveImage 
          article={article} 
          aspectRatio="h-full w-full"
          containerClassName="h-full w-full"
          imageClassName="h-full w-full"
          hoverScale={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-reserve-bg via-reserve-bg/20 to-transparent" />
        {article.image?.credit && (
          <div className="absolute bottom-6 right-6 z-20 pointer-events-none hidden md:block">
            <span className="text-[9px] uppercase tracking-[0.2em] text-reserve-gray/50 font-mono">
              Credit: {article.image.credit}
            </span>
          </div>
        )}
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-24 md:pb-32">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold py-1 px-3 border border-reserve-accent text-reserve-accent">
              Exclusive {article.category}
            </span>
            <span className="text-[11px] text-reserve-gray uppercase tracking-widest">{article.date}</span>
          </div>

          <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tighter mb-8 text-reserve-text text-balance">
            {article.title}
          </h2>

          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
            <p className="text-lg md:text-xl text-reserve-gray max-w-xl font-light leading-relaxed">
              {article.excerpt}
            </p>
            
            <div className="flex items-center gap-6 divide-x divide-reserve-border">
              <div className="text-center">
                <span className="block text-[10px] uppercase text-reserve-gray tracking-widest mb-1">Author</span>
                <span className="text-sm font-medium">{article.author || 'The Reserve Editorial'}</span>
              </div>
              <div className="pl-6 text-center">
                <span className="block text-[10px] uppercase text-reserve-gray tracking-widest mb-1">Read Time</span>
                <span className="text-sm font-medium">{article.readTime}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute right-12 bottom-12 hidden lg:flex flex-col items-end gap-12"
      >
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] uppercase tracking-widest text-reserve-gray">Scroll to Explore</span>
          <div className="w-[1px] h-24 bg-reserve-border relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 96] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 w-full h-1/2 bg-reserve-accent"
            />
          </div>
        </div>
      </motion.div>
      </section>
    </Link>
  );
}
