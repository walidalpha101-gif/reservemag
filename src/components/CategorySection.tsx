import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import ResponsiveImage from './ui/ResponsiveImage';

export interface CategorySectionProps {
  category: Category;
  articles: Article[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, articles }) => {
  const mainArticle = articles[0];
  const listArticles = articles.slice(1, 5);

  const mainSlug = mainArticle ? (mainArticle.slug || mainArticle.title.toLowerCase().replace(/ /g, '-')) : '';

  return (
    <section id={category.toLowerCase()} className="py-24 border-t border-reserve-border">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter opacity-10 absolute -translate-y-12 select-none uppercase">
            {category}
          </h2>
          <div className="relative z-10">
            <span className="text-[11px] uppercase tracking-[0.4em] text-reserve-accent mb-2 block">Archive</span>
            <h3 className="text-4xl font-serif">{category}</h3>
          </div>
          <button className="text-[11px] uppercase tracking-widest text-reserve-gray border-b border-transparent hover:border-reserve-accent transition-all">
            Explore All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article */}
          {mainArticle && (
            <Link to={`/${mainSlug}`} className="lg:col-span-8 group cursor-pointer">
              <div>
                <ResponsiveImage 
                  article={mainArticle}
                  aspectRatio="aspect-[4/5] md:aspect-[16/9] mb-8"
                  containerClassName="shadow-lg"
                />
                <div className="relative">
                  <div className="absolute -top-16 left-6 z-20">
                    <span className="bg-black/50 backdrop-blur-md px-4 py-1 text-[10px] uppercase tracking-widest border border-white/10">Lead Story</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-4xl md:text-5xl font-serif mb-6 group-hover:text-reserve-accent transition-colors">
                    {mainArticle.title}
                  </h4>
                  <p className="text-reserve-gray text-lg mb-8 max-w-2xl font-light leading-relaxed">
                    {mainArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-reserve-gray">
                    <span>{mainArticle.author || 'The Reserve Editorial'}</span>
                    <span>{mainArticle.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Sidebar List */}
          <div className="lg:col-span-4 space-y-12">
            {listArticles.map((article, idx) => {
              const slug = article.slug || article.title.toLowerCase().replace(/ /g, '-');
              return (
                <Link key={article.id} to={`/${slug}`} className="block">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group cursor-pointer border-b border-reserve-border pb-8 last:border-0"
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] text-reserve-accent mb-4 block">0{idx + 1}</span>
                    <h5 className="text-xl font-serif mb-4 group-hover:text-reserve-accent transition-colors">
                      {article.title}
                    </h5>
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-reserve-gray">
                      <span>{article.author || 'The Reserve Editorial'}</span>
                      <span>{article.readTime}</span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
