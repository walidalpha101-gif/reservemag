import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Layout, CheckCircle2, ChevronRight, LayoutGrid, Search, Save } from 'lucide-react';
import { Article, HomepageConfig } from '../../types';
import { articleService } from '../../services/articleService';
import { settingsService } from '../../services/settingsService';

export default function HomepageSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [config, setConfig] = useState<HomepageConfig>({
    heroArticleId: '',
    featuredArticleIds: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allArticles, homepageConfig] = await Promise.all([
      articleService.getAllArticles(false),
      settingsService.getHomepageConfig()
    ]);
    setArticles(allArticles);
    if (homepageConfig) {
      setConfig(homepageConfig);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateHomepageConfig(config);
      alert('Homepage structure updated successfully');
    } finally {
      setSaving(false);
    }
  };

  const setHero = (id: string) => {
    setConfig({ ...config, heroArticleId: id });
  };

  const toggleFeatured = (id: string) => {
    let newFeatured = [...config.featuredArticleIds];
    if (newFeatured.includes(id)) {
      newFeatured = newFeatured.filter(fid => fid !== id);
    } else {
      if (newFeatured.length >= 6) {
        alert('Maximum of 6 featured stories allowed in the archive grid.');
        return;
      }
      newFeatured.push(id);
    }
    setConfig({ ...config, featuredArticleIds: newFeatured });
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const heroArticle = articles.find(a => a.id === config.heroArticleId);
  const featuredArticles = articles.filter(a => config.featuredArticleIds.includes(a.id));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif">Front-Page Control</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Curate the landing experience</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-reserve-accent text-black px-10 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white transition-all flex items-center gap-2 active:scale-95"
        >
          {saving ? 'UPDATING ARCHIVE...' : 'SAVE HOMEPAGE ARCHITECTURE'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-reserve-accent">1. Current Structure</h3>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest">Read Only</div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 block">Main Hero</label>
                {heroArticle ? (
                  <div className="flex items-center gap-4 bg-black/50 p-3 border border-white/10">
                    <img src={heroArticle.image?.url || undefined} className="w-12 h-12 object-cover grayscale" alt="" />
                    <span className="text-xs truncate flex-1">{heroArticle.title}</span>
                    <Star className="text-reserve-accent fill-reserve-accent" size={14} />
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-white/10 text-[10px] text-zinc-600 uppercase tracking-widest text-center">
                    No Hero Selected
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-widest text-zinc-500 block">Featured Grid ({config.featuredArticleIds.length}/6)</label>
                <div className="grid grid-cols-2 gap-3">
                  {featuredArticles.map(a => (
                    <div key={a.id} className="flex items-center gap-3 bg-black/50 p-2 border border-white/10">
                      <img src={a.image?.url || undefined} className="w-8 h-8 object-cover grayscale" alt="" />
                      <span className="text-[10px] truncate">{a.title}</span>
                    </div>
                  ))}
                  {[...Array(Math.max(0, 6 - config.featuredArticleIds.length))].map((_, i) => (
                    <div key={i} className="h-12 border border-dashed border-white/10 flex items-center justify-center">
                      <span className="text-[8px] text-zinc-800 font-bold">VACANT</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold">2. Select Articles</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text"
                placeholder="Find story..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-reserve-accent transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredArticles.map(article => (
              <div key={article.id} className="group p-4 bg-zinc-900/30 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={article.image?.url || undefined} className="w-10 h-10 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                  <div className="max-w-[200px]">
                    <p className="text-xs font-serif truncate group-hover:text-reserve-accent transition-colors">{article.title}</p>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{article.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setHero(article.id)}
                    className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all ${
                      config.heroArticleId === article.id 
                        ? 'bg-reserve-accent border-reserve-accent text-black' 
                        : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
                    }`}
                  >
                    Set Hero
                  </button>
                  <button 
                    onClick={() => toggleFeatured(article.id)}
                    className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all ${
                      config.featuredArticleIds.includes(article.id)
                        ? 'bg-white border-white text-black' 
                        : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {config.featuredArticleIds.includes(article.id) ? 'Featured' : 'Add to Grid'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
