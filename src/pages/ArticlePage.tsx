import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, Clock, User, Share2, ArrowLeft, Bookmark } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../types';
import { articleService } from '../services/articleService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import RichTextRenderer from '../components/ui/RichTextRenderer';
import SocialShare from '../components/SocialShare';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    const data = await articleService.getArticleBySlug(slug!);
    if (data) {
      setArticle(data);
    } else {
      // Fallback or navigate home
      navigate('/');
    }
    setLoading(false);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-reserve-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

// Inside ArticlePage component
  const displayAuthor = article.author || 'The Reserve Editorial';
  const displayDate = article.date || (article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'March 14, 2026'));
  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}/${article.slug}`;
  const metaImage = article.seo?.socialImage || article.image?.url;
  // Ensure absolute image URL if it's relative
  const absoluteImage = metaImage?.startsWith('http') ? metaImage : `${baseUrl}${metaImage}`;

  return (
    <div className="bg-reserve-bg text-reserve-text selection:bg-reserve-accent selection:text-black">
      <Helmet>
        <title>{`${article.seo?.metaTitle || article.title} | THE RESERVE`}</title>
        <meta name="description" content={article.seo?.metaDescription || article.excerpt || 'Luxury editorial from Bangladesh'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={article.seo?.metaTitle || article.title} />
        <meta property="og:description" content={article.seo?.metaDescription || article.excerpt} />
        <meta property="og:image" content={absoluteImage} />
        <meta property="og:site_name" content="THE RESERVE" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={article.seo?.metaTitle || article.title} />
        <meta property="twitter:description" content={article.seo?.metaDescription || article.excerpt} />
        <meta property="twitter:image" content={absoluteImage} />

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />

      <main className="pt-20 md:pt-32 pb-20">
        <article>
          {/* Hero Section */}
          <section className="relative px-6 pb-12 md:pb-24 overflow-hidden border-b border-white/5">
            <div className="container mx-auto">
              <div className="max-w-5xl mx-auto">
                <header className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <Link 
                    to="/"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-reserve-gray hover:text-reserve-accent transition-colors mb-4 md:mb-8"
                  >
                    <ArrowLeft size={12} /> Back to Archive
                  </Link>

                  <div className="space-y-6 md:space-y-10">
                    <div className="space-y-4 md:space-y-6">
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="block text-[11px] md:text-[12px] uppercase tracking-[0.5em] text-reserve-accent font-bold"
                      >
                        {article.category}
                      </motion.span>
                      <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-serif leading-[1.05] tracking-tight text-balance">
                        {article.title}
                      </h1>
                    </div>
                    
                    {article.subtitle && (
                      <p className="text-lg md:text-2xl text-reserve-gray font-light leading-relaxed max-w-3xl italic border-l-2 border-reserve-accent/30 pl-6 md:pl-8">
                        {article.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Metadata Row - Moved above image for better mobile flow */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 md:py-12 border-y border-white/5">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-zinc-900 border border-white/10 flex items-center justify-center font-serif text-lg md:text-xl text-reserve-accent">
                          {displayAuthor[0]}
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Words by</p>
                          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em]">{displayAuthor}</p>
                        </div>
                      </div>
                      <div className="hidden sm:block h-10 w-[1px] bg-white/10" />
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Published</p>
                        <p className="text-[11px] md:text-xs uppercase tracking-[0.1em]">{displayDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 border-t border-white/5 md:border-none pt-6 md:pt-0">
                      <div className="flex items-center gap-4 mr-4">
                        <Clock size={14} className="text-reserve-accent" />
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400">8 Min Read</span>
                      </div>
                      <button className="p-3 text-zinc-500 hover:text-reserve-accent transition-colors hover:bg-white/5 rounded-full">
                        <Share2 size={20} />
                      </button>
                      <button className="p-3 text-zinc-500 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                        <Bookmark size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Hero Image - Art Directed for Desktop & Mobile */}
                  <motion.figure 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative group overflow-hidden bg-zinc-950 rounded-sm shadow-2xl"
                  >
                    <picture className="block w-full">
                      {article.mobileImage?.url && (
                        <source media="(max-width: 768px)" srcSet={article.mobileImage.url} />
                      )}
                      <img 
                        src={article.image?.url || undefined} 
                        className={`w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105 grayscale hover:grayscale-0 ${
                          article.mobileImage?.url 
                            ? 'aspect-[4/5] md:aspect-[21/9]' 
                            : 'aspect-[4/5] object-contain md:aspect-[21/9] md:object-cover'
                        }`} 
                        style={{ 
                          objectPosition: `${article.mobileCropX || 50}% 50%`
                        }}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                      />
                    </picture>

                    {/* Fallback blurred background for centered portrait images if no mobile image */}
                    {!article.mobileImage?.url && (
                      <div className="absolute inset-0 -z-10 bg-zinc-900 md:hidden overflow-hidden">
                        <img 
                          src={article.image?.url || undefined} 
                          className="w-full h-full object-cover blur-2xl opacity-30 scale-110"
                          alt=""
                        />
                      </div>
                    )}

                    {/* Editorial Overlay on Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />
                    
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-auto md:right-8 flex flex-col md:items-end gap-3">
                      {article.image?.credit && (
                        <div>
                          {article.image.source ? (
                            <a 
                              href={article.image.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-[9px] md:text-[10px] uppercase tracking-widest text-white/50 bg-black/60 px-3 py-1.5 md:px-5 md:py-2.5 backdrop-blur-md hover:bg-reserve-accent hover:text-black transition-all"
                            >
                              Image: {article.image.credit}
                            </a>
                          ) : (
                            <span className="inline-block text-[9px] md:text-[10px] uppercase tracking-widest text-white/50 bg-black/60 px-3 py-1.5 md:px-5 md:py-2.5 backdrop-blur-md">
                              Image: {article.image.credit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.figure>
                </header>
              </div>
            </div>
          </section>

          {/* Article Content */}
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="max-w-3xl mx-auto py-16 md:py-24">
                {Array.isArray(article.content) ? (
                  <RichTextRenderer blocks={article.content} />
                ) : (
                  <div 
                    className="prose prose-invert prose-lg max-w-none 
                      prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight
                      prose-p:text-reserve-text/90 prose-p:leading-relaxed prose-p:mb-8
                      prose-blockquote:border-reserve-accent prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:text-reserve-accent/80 prose-blockquote:py-4
                      prose-a:text-reserve-accent prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: article.content || '' }} 
                  />
                )}

                <SocialShare 
                  url={window.location.href} 
                  title={article.title} 
                  className="mt-24 pt-12 border-t border-white/5"
                />
              </div>

              <footer className="pt-20 pb-12 border-t border-white/5 space-y-16">
                <div className="text-center space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-600">Finis</p>
                    <h3 className="text-2xl font-serif italic text-reserve-gray">The Archive Ends Here</h3>
                  </div>
                  <Link 
                    to="/"
                    className="inline-block px-12 py-5 bg-white text-black hover:bg-reserve-accent transition-all text-[11px] uppercase tracking-[0.4em] font-bold"
                  >
                    Return to Main Deck
                  </Link>
                </div>
                <Newsletter />
              </footer>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
