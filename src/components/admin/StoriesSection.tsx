import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Article, ArticleStatus, Category, Author } from '../../types';
import { articleService } from '../../services/articleService';
import { authorService } from '../../services/authorService';
import { mediaService } from '../../services/mediaService';
import RichTextEditor from './RichTextEditor';

import ImageUploadForm from './ImageUploadForm';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function StoriesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadArticles();
    loadAuthors();
    
    // Setup categories listener
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name as string);
      setCategories(cats);
    });

    return () => unsubscribe();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const data = await articleService.getAllArticles(true);
    setArticles(data);
    setLoading(false);
  };

  const loadAuthors = async () => {
    const data = await authorService.getAllAuthors();
    setAuthors(data.filter(a => a.active));
  };

  const handleCreateNew = () => {
    const newArticle: Partial<Article> = {
      title: '',
      slug: '',
      content: [],
      category: categories[0] || 'Culture',
      status: 'draft',
      featured: false,
      author: 'THE RESERVE Editorial',
      excerpt: '',
      image: {
        url: '',
        credit: '',
        source: ''
      },
      mobileImage: {
        url: '',
        credit: '',
        source: ''
      },
      publishDate: new Date().toISOString().split('T')[0],
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: '5 min',
      seo: {
        metaTitle: '',
        metaDescription: '',
        socialImage: ''
      }
    };
    setEditingArticle(newArticle);
  };

  const handleMobileCropDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!editingArticle) return;
    const container = (e.currentTarget as HTMLElement);
    const rect = container.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setEditingArticle({ ...editingArticle, mobileCropX: Math.round(percentage) });
  };

  // Autosave logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (editingArticle && editingArticle.id && saveStatus === 'idle') {
      timeout = setTimeout(() => {
        handleAutosave();
      }, 5000); // Autosave every 5 seconds of idle
    }
    return () => clearTimeout(timeout);
  }, [editingArticle]);

  const handleAutosave = async () => {
    if (!editingArticle || !editingArticle.id || !editingArticle.title) return;
    setSaveStatus('saving');
    try {
      await articleService.updateArticle(editingArticle.id, editingArticle);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const handleSave = async (statusOverride?: ArticleStatus) => {
    if (!editingArticle || !editingArticle.title) return;
    
    setSaveStatus('saving');
    try {
      const slug = editingArticle.slug || articleService.generateSlug(editingArticle.title);
      
      // Calculate display date from publishDate
      let displayDate = editingArticle.date;
      if (editingArticle.publishDate) {
        const d = new Date(editingArticle.publishDate);
        displayDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      const articleData = { 
        ...editingArticle, 
        slug,
        date: displayDate,
        status: statusOverride || editingArticle.status || 'draft'
      } as Article;
      
      if (editingArticle.id) {
        await articleService.updateArticle(editingArticle.id, articleData);
      } else {
        const newId = await articleService.createArticle(articleData);
        if (newId) setEditingArticle({ ...articleData, id: newId });
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      loadArticles();
      if (statusOverride === 'published') {
        setEditingArticle(null);
      }
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      await articleService.deleteArticle(id);
      loadArticles();
    }
  };

  if (editingArticle) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <button 
            onClick={() => setEditingArticle(null)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} />
            Back to Stories
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Changes Saved' : 'Draft'}
            </span>
            <button 
              onClick={() => handleSave()}
              className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold border border-white/10 hover:bg-white/5 transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleSave('published')}
              className="bg-white text-black px-8 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-reserve-accent transition-colors"
            >
              Publish Story
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-12 py-10">
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Enter Story Title..."
              value={editingArticle.title}
              onChange={(e) => {
                const title = e.target.value;
                setEditingArticle({ 
                  ...editingArticle, 
                  title,
                  slug: editingArticle.id ? editingArticle.slug : articleService.generateSlug(title)
                });
              }}
              className="w-full bg-transparent text-5xl font-serif border-none focus:outline-none placeholder:text-zinc-800"
            />
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-reserve-accent">
                <span>thereservemag.com/</span>
                <input 
                  type="text"
                  value={editingArticle.slug}
                  onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                  className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-48"
                />
              </div>
              {editingArticle.id && (
                <a 
                  href={`/${editingArticle.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <ExternalLink size={12} /> View Live
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6 bg-zinc-900/30 border border-white/5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Category</label>
              <select 
                value={editingArticle.category}
                onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                className="w-full bg-black border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-reserve-accent"
              >
                {categories.length > 0 ? (
                  categories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                ) : (
                  <option value={editingArticle.category}>{editingArticle.category}</option>
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Status</label>
              <select 
                value={editingArticle.status}
                onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as ArticleStatus })}
                className="w-full bg-black border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-reserve-accent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Editorial Author</label>
              <select 
                value={editingArticle.authorId || 'custom'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setEditingArticle({ ...editingArticle, authorId: undefined });
                  } else {
                    const selected = authors.find(a => a.id === val);
                    if (selected) {
                      setEditingArticle({ 
                        ...editingArticle, 
                        authorId: selected.id,
                        author: selected.name 
                      });
                    }
                  }
                }}
                className="w-full bg-black border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-reserve-accent"
              >
                <option value="custom">-- Custom/Independent --</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>
            {!editingArticle.authorId && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Manual Name</label>
                <input 
                  type="text"
                  placeholder="Editors of The Reserve"
                  value={editingArticle.author}
                  onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-reserve-accent"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Publish Date</label>
              <input 
                type="date"
                value={editingArticle.publishDate ? (typeof editingArticle.publishDate === 'string' ? editingArticle.publishDate.split('T')[0] : new Date(editingArticle.publishDate).toISOString().split('T')[0]) : ''}
                onChange={(e) => setEditingArticle({ ...editingArticle, publishDate: e.target.value })}
                className="w-full bg-black border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-reserve-accent"
              />
            </div>
            <div className="space-y-2 flex flex-col justify-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={editingArticle.featured}
                  onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })}
                  className="w-4 h-4 rounded-none bg-black border-white/10 text-reserve-accent focus:ring-0"
                />
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors uppercase">Featured Hero</span>
              </label>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <ImageUploadForm 
                    label="Desktop Hero Image (Cinematic)"
                    value={editingArticle.image?.url || ''}
                    onChange={(url) => setEditingArticle({
                      ...editingArticle,
                      image: { ...editingArticle.image!, url }
                    })}
                    storagePath="articles"
                  />
                  <div className="bg-black/40 border border-white/5 p-4 space-y-2">
                    <h4 className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Desktop Recommended</h4>
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                      2000×850px or wider. High-resolution cinematic crop for immersive desktop experience.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <ImageUploadForm 
                    label="Mobile Hero Image (Portrait/Art Direction)"
                    value={editingArticle.mobileImage?.url || ''}
                    onChange={(url) => setEditingArticle({
                      ...editingArticle,
                      mobileImage: { ...editingArticle.mobileImage!, url }
                    })}
                    storagePath="articles"
                  />
                  <div className="bg-black/40 border border-white/5 p-4 space-y-2">
                    <h4 className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Mobile Recommended (Optional)</h4>
                    <p className="text-[10px] text-zinc-600 leading-relaxed uppercase">
                      800×1200px or similar. Use high-composition portrait crops to avoid destructive scaling. Fallback: Desktop Image.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Crop Positioner */}
              {(editingArticle.image?.url || editingArticle.mobileImage?.url) && (
                <div className="pt-12 border-t border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-serif text-white uppercase tracking-widest">Mobile Hero Crop Position</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Define the focal point for portrait viewports</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">X-Offset: {editingArticle.mobileCropX || 50}%</div>
                      <button 
                        onClick={() => setEditingArticle({ ...editingArticle, mobileCropX: 50 })}
                        className="text-[9px] uppercase tracking-widest text-reserve-accent hover:text-white transition-colors"
                      >
                        Reset to Center
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div 
                        className="relative w-full max-w-[300px] mx-auto aspect-[4/5] bg-zinc-950 border border-white/10 overflow-hidden cursor-ew-resize group shadow-2xl"
                        onMouseDown={(e) => { setIsDragging(true); handleMobileCropDrag(e); }}
                        onMouseMove={(e) => { if (isDragging) handleMobileCropDrag(e); }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        onTouchStart={(e) => { setIsDragging(true); handleMobileCropDrag(e); }}
                        onTouchMove={(e) => { if (isDragging) handleMobileCropDrag(e); }}
                        onTouchEnd={() => setIsDragging(false)}
                      >
                        <img 
                          src={editingArticle.mobileImage?.url || editingArticle.image?.url} 
                          className="w-full h-full object-cover pointer-events-none select-none"
                          style={{ objectPosition: `${editingArticle.mobileCropX || 50}% 50%` }}
                          alt="Crop Preview"
                          referrerPolicy="no-referrer"
                        />
                        {/* Frame Info */}
                        <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10">
                          <span className="text-[8px] uppercase tracking-[0.2em] text-white">Mobile Preview Frame</span>
                        </div>
                        {/* Guide Lines */}
                        <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-20 transition-opacity group-hover:opacity-40">
                          <div className="border-r border-white" />
                          <div className="border-r border-white" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="p-6 bg-black/40 border border-white/5 space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                            <span>Left</span>
                            <span>Center</span>
                            <span>Right</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={editingArticle.mobileCropX || 50}
                            onChange={(e) => setEditingArticle({ ...editingArticle, mobileCropX: parseInt(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-reserve-accent"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-[10px] uppercase tracking-widest text-zinc-300 font-bold">Positioning Guidelines</h4>
                          <ul className="space-y-2">
                            <li className="flex gap-3 text-[10px] text-zinc-500 leading-relaxed uppercase">
                              <span className="text-reserve-accent">→</span>
                              Drag the image or use the slider to center the primary subject.
                            </li>
                            <li className="flex gap-3 text-[10px] text-zinc-500 leading-relaxed uppercase">
                              <span className="text-reserve-accent">→</span>
                              This position applies to both "Mobile Image" and "Desktop Fallback".
                            </li>
                            <li className="flex gap-3 text-[10px] text-zinc-500 leading-relaxed uppercase">
                              <span className="text-reserve-accent">→</span>
                              Use the Rule of Thirds guides to help frame the focal point.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-white/5 pt-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 block font-bold">Attribution / Credit (Required)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Photo via Prothom Alo"
                    value={editingArticle.image?.credit}
                    onChange={(e) => setEditingArticle({ ...editingArticle, image: { ...editingArticle.image!, credit: e.target.value } })}
                    className="w-full bg-black/50 border border-white/10 p-4 text-xs focus:outline-none focus:border-reserve-accent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Source Link (Optional)</label>
                  <input 
                    type="text"
                    placeholder="https://originalsource.com"
                    value={editingArticle.image?.source}
                    onChange={(e) => setEditingArticle({ ...editingArticle, image: { ...editingArticle.image!, source: e.target.value } })}
                    className="w-full bg-black/50 border border-white/10 p-4 text-xs focus:outline-none focus:border-reserve-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
              <button 
                type="button"
                onClick={() => {
                  const seoSection = document.getElementById('seo-section');
                  if (seoSection) {
                    seoSection.classList.toggle('hidden');
                  }
                }}
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-reserve-accent/10 p-2 rounded-sm group-hover:bg-reserve-accent/20 transition-colors">
                    <Search className="text-reserve-accent" size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-serif text-white uppercase tracking-widest">Social SEO Settings</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Customize appearance on Search & Social platforms</p>
                  </div>
                </div>
                <ChevronDown size={18} className="text-zinc-600" />
              </button>

              <div id="seo-section" className="hidden border-t border-white/5 p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Meta Title</label>
                        <span className={`text-[9px] uppercase tracking-widest ${
                          (editingArticle.seo?.metaTitle?.length || 0) > 60 ? 'text-rose-500' : 'text-zinc-600'
                        }`}>
                          {editingArticle.seo?.metaTitle?.length || 0} / 60 Characters
                        </span>
                      </div>
                      <input 
                        type="text"
                        placeholder={editingArticle.title || "Custom SEO Title..."}
                        value={editingArticle.seo?.metaTitle || ''}
                        onChange={(e) => setEditingArticle({ 
                          ...editingArticle, 
                          seo: { ...editingArticle.seo, metaTitle: e.target.value } 
                        })}
                        className="w-full bg-black/50 border border-white/10 p-4 text-xs focus:outline-none focus:border-reserve-accent transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Meta Description</label>
                        <span className={`text-[9px] uppercase tracking-widest ${
                          (editingArticle.seo?.metaDescription?.length || 0) > 160 ? 'text-rose-500' : 'text-zinc-600'
                        }`}>
                          {editingArticle.seo?.metaDescription?.length || 0} / 160 Characters
                        </span>
                      </div>
                      <textarea 
                        placeholder={editingArticle.excerpt || "Custom SEO description for search engines and social cards..."}
                        value={editingArticle.seo?.metaDescription || ''}
                        onChange={(e) => setEditingArticle({ 
                          ...editingArticle, 
                          seo: { ...editingArticle.seo, metaDescription: e.target.value } 
                        })}
                        className="w-full bg-black/50 border border-white/10 p-4 text-xs h-32 focus:outline-none focus:border-reserve-accent transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ImageUploadForm 
                      label="Social Share Image (Open Graph)"
                      value={editingArticle.seo?.socialImage || ''}
                      onChange={(url) => setEditingArticle({
                        ...editingArticle,
                        seo: { ...editingArticle.seo, socialImage: url }
                      })}
                      storagePath="seo"
                    />
                    <div className="bg-black/40 border border-white/5 p-4 space-y-2">
                      <h4 className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Preview Hint</h4>
                      <p className="text-[10px] text-zinc-600 leading-relaxed">
                        1200×630px is the recommended dimension for high-quality social previews. This image will appear on Facebook, X, LinkedIn, and messaging apps. Fallback: Main cover image.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-white/5 p-6 space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Google Preview Card</h4>
                  <div className="space-y-1">
                    <div className="text-sky-400 text-lg font-medium hover:underline cursor-pointer">
                      {editingArticle.seo?.metaTitle || editingArticle.title || 'Thereservemag.com: Story Preview Title'}
                    </div>
                    <div className="text-emerald-700 text-xs truncate">
                      https://thereservemag.com/{editingArticle.slug || 'story-slug'}
                    </div>
                    <div className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                      {editingArticle.seo?.metaDescription || editingArticle.excerpt || 'Briefly describes the story for search engine results. This summary appears below the title in the Google SERP.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Excerpt (Card View)</label>
              <textarea 
                placeholder="Brief summary for indexing..."
                value={editingArticle.excerpt}
                onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                className="w-full bg-zinc-950 border border-white/5 p-4 text-xs h-24 focus:outline-none focus:border-reserve-accent resize-none focus:bg-black transition-all"
              />
            </div>
            <div className="space-y-4">
              <RichTextEditor 
                blocks={Array.isArray(editingArticle.content) ? editingArticle.content : []} 
                onChange={(blocks) => setEditingArticle({ ...editingArticle, content: blocks })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif">Stories Archive</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Management of editorial content</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-white text-black px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-reserve-accent transition-colors flex items-center gap-2"
        >
          <Plus size={14} />
          Create New Story
        </button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/30 p-4 border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input 
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 pl-12 pr-4 py-2.5 text-xs focus:outline-none focus:border-reserve-accent"
          />
        </div>
        <button className="px-4 py-2.5 border border-white/10 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs">
          <Filter size={14} />
          Filter
        </button>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-6 py-4 font-medium">Story</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Last Modified</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8 h-16 bg-white/5"></td>
                </tr>
              ))
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <tr key={article.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {article.image?.url ? (
                        <img src={article.image.url} className="w-12 h-12 object-cover bg-zinc-800" alt="" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center">
                          <FileText size={16} className="text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium mb-0.5 group-hover:text-reserve-accent transition-colors">{article.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono tracking-tighter">/{article.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[9px] uppercase tracking-widest border ${
                      article.status === 'published' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' :
                      article.status === 'scheduled' ? 'border-cyan-500/20 text-cyan-500 bg-cyan-500/5' :
                      'border-zinc-500/20 text-zinc-500 bg-zinc-500/5'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">{article.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-zinc-500">
                      {article.updatedAt?.toDate ? article.updatedAt.toDate().toLocaleDateString() : article.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => setEditingArticle(article)}
                         className="p-2 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-sm text-zinc-500">No stories found. Create your first archive entry.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
