import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Article } from '../types';

interface FeaturedStripProps {
  articles: Article[];
}

export default function FeaturedStrip({ articles }: FeaturedStripProps) {
  return (
    <section className="py-24 bg-reserve-bg border-y border-reserve-border overflow-hidden">
      <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-reserve-accent mb-4 block">The Selection</span>
          <h3 className="text-4xl md:text-5xl font-serif">Featured Stories</h3>
        </div>
        <Link to="#" className="text-[11px] uppercase tracking-widest text-reserve-gray hover:text-reserve-text transition-colors">
          View All Stories
        </Link>
      </div>

      <div className="flex gap-8 overflow-x-auto no-scrollbar px-6 md:px-[calc((100vw-1200px)/2)] lg:px-[calc((100vw-1400px)/2)] pb-4">
        {articles.map((article, index) => {
          const slug = article.slug || article.title.toLowerCase().replace(/ /g, '-');
          return (
            <Link key={article.id} to={`/${slug}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex-shrink-0 w-72 md:w-96 group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-6 cinematic-bg">
                  <img 
                    src={article.image?.url || undefined} 
                    alt={article.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  {article.image?.credit && (
                    <div className="absolute inset-0 flex items-end justify-end p-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-[7px] uppercase tracking-widest text-white/40 font-mono rotate-90 origin-bottom-right translate-y-[-10px]">
                        {article.image.credit}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-reserve-accent mb-2 block">{article.category}</span>
                  <h4 className="text-xl md:text-2xl font-serif leading-tight group-hover:text-reserve-accent transition-colors underline-offset-8 group-hover:underline">
                    {article.title}
                  </h4>
                  <div className="mt-4 flex items-center gap-4 text-reserve-gray text-[10px] uppercase tracking-widest">
                    <span>{article.author || 'The Reserve Editorial'}</span>
                    <span className="w-1 h-1 bg-reserve-border rounded-full" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

