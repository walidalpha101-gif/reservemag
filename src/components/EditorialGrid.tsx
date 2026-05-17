import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import ResponsiveImage from './ui/ResponsiveImage';

interface EditorialGridProps {
  articles: Article[];
}

export default function EditorialGrid({ articles }: EditorialGridProps) {
  return (
    <section className="py-32 bg-reserve-bg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 items-start">
          {articles.map((article, index) => {
            const isLarge = index % 5 === 0;
            const isTall = index % 3 === 0;
            const slug = article.slug || article.title.toLowerCase().replace(/ /g, '-');

            return (
              <Link key={article.id} to={`/${slug}`} className={isLarge ? 'lg:col-span-2' : ''}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.2, 0, 0.2, 1] }}
                  className="group cursor-pointer"
                >
                  <ResponsiveImage 
                    article={article}
                    aspectRatio={`mb-8 aspect-[4/5] md:aspect-[16/9] ${
                      isTall ? 'md:aspect-[3/4]' : ''
                    } ${isLarge ? 'lg:aspect-[21/9]' : ''}`}
                    containerClassName="shadow-xl"
                  />

                  <div className={`${isLarge ? 'max-w-2xl' : ''}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-reserve-accent">{article.category}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-reserve-gray">{article.date}</span>
                    </div>
                    <h3 className={`font-serif leading-tight mb-4 group-hover:text-reserve-accent transition-colors ${
                      isLarge ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl'
                    }`}>
                      {article.title}
                    </h3>
                    <p className="text-reserve-gray font-light leading-relaxed mb-6 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-reserve-text">By {article.author || 'The Reserve Editorial'}</span>
                      <span className="text-[10px] uppercase tracking-widest text-reserve-gray">{article.readTime}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

