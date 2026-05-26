import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Link as LinkIcon, 
  Loader2, 
  AlertCircle, 
  Check, 
  X, 
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Save,
  ExternalLink,
  ChevronRight,
  Edit3,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { articleService } from '../../services/articleService';
import { IngestedArticle, IngestionStatus, ContentBlock, Article } from '../../types';
import RichTextEditor from './RichTextEditor';

interface CategoryDoc {
  id: string;
  name: string;
}

const SUGGESTED_CATEGORIES = [
  'Profiles',
  'Culture', 
  'Business',
  'Lifestyle',
  'Art & Design',
  'Travel',
  'Fashion',
  'Technology'
];

export default function AIIngestionSection() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<IngestionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ingestedArticle, setIngestedArticle] = useState<IngestedArticle | null>(null);
  
  // Editable preview state
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageCredit, setEditImageCredit] = useState('');
  const [editContent, setEditContent] = useState<ContentBlock[]>([]);
  
  // Categories from Firestore
  const [categories, setCategories] = useState<CategoryDoc[]>([]);

  // Load categories
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryDoc[];
      setCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  // Merge Firestore categories with suggested ones
  const allCategories = [
    ...new Set([
      ...categories.map(c => c.name),
      ...SUGGESTED_CATEGORIES
    ])
  ].sort();

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus('fetching');
    setError(null);
    setIngestedArticle(null);

    try {
      console.log('[v0] Starting ingestion for:', url.trim());
      
      const response = await fetch('/api/ingest-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      console.log('[v0] Response status:', response.status);

      // Safely parse JSON response
      let data;
      try {
        const text = await response.text();
        console.log('[v0] Raw response length:', text.length);
        
        if (!text || text.trim().length === 0) {
          throw new Error('Server returned empty response');
        }
        
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('[v0] JSON parse error:', parseErr);
        throw new Error('Server returned invalid response. Please try again.');
      }

      // Check for success flag or error
      if (!data.success) {
        throw new Error(data.error || 'Ingestion failed');
      }

      if (!data.article) {
        throw new Error('No article data in response');
      }

      const article = data.article as IngestedArticle;
      
      console.log('[v0] Article received:', article.title?.substring(0, 50));
      
      setIngestedArticle(article);
      
      // Populate editable fields
      setEditTitle(article.title || '');
      setEditSubtitle(article.subtitle || '');
      setEditExcerpt(article.excerpt || '');
      setEditCategory(article.category || 'Culture');
      setEditImageUrl(article.image?.url || '');
      setEditImageCredit(article.image?.credit || '');
      setEditContent(article.content || []);
      
      setStatus('preview');
    } catch (err: any) {
      console.error('[v0] Ingestion error:', err);
      setError(err.message || 'Something went wrong during ingestion');
      setStatus('error');
    }
  };

  const handleSaveAsDraft = async () => {
    if (!ingestedArticle) return;
    
    setStatus('saving');
    setError(null);

    try {
      console.log('[v0] Saving article as draft:', editTitle?.substring(0, 50));
      
      // Validate required fields
      if (!editTitle?.trim()) {
        throw new Error('Title is required');
      }
      
      if (!editContent || editContent.length === 0) {
        throw new Error('Article content is required');
      }

      const articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: articleService.generateSlug(editTitle),
        title: editTitle.trim(),
        subtitle: editSubtitle?.trim() || '',
        excerpt: editExcerpt?.trim() || '',
        content: editContent,
        category: editCategory || 'Culture',
        status: 'draft',
        featured: false,
        author: 'THE RESERVE Editorial',
        image: {
          url: editImageUrl || '',
          credit: editImageCredit || '',
          source: ingestedArticle.sourceUrl
        },
        seo: {
          metaTitle: editTitle.trim(),
          metaDescription: editExcerpt?.trim() || ''
        }
      };

      await articleService.createArticle(articleData);
      
      console.log('[v0] Article saved successfully');
      
      // Reset form
      setUrl('');
      setIngestedArticle(null);
      setStatus('idle');
      setEditTitle('');
      setEditSubtitle('');
      setEditExcerpt('');
      setEditCategory('');
      setEditImageUrl('');
      setEditImageCredit('');
      setEditContent([]);
      
    } catch (err: any) {
      console.error('[v0] Save error:', err);
      setError(err.message || 'Failed to save article');
      setStatus('preview'); // Return to preview on save error, not 'error' state
    }
  };

  const handleReset = () => {
    setUrl('');
    setIngestedArticle(null);
    setStatus('idle');
    setError(null);
    setEditTitle('');
    setEditSubtitle('');
    setEditExcerpt('');
    setEditCategory('');
    setEditImageUrl('');
    setEditImageCredit('');
    setEditContent([]);
  };

  const isProcessing = status === 'fetching' || status === 'saving';

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-reserve-accent/10 p-2 rounded-sm">
              <Sparkles className="text-reserve-accent" size={18} />
            </div>
            <h2 className="text-2xl font-serif text-white uppercase tracking-wider">AI Editorial Ingestion</h2>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Transform external articles into THE RESERVE editorial voice</p>
        </div>
      </div>

      {/* URL Input Form */}
      <AnimatePresence mode="wait">
        {status === 'idle' || status === 'fetching' || status === 'error' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-950 border border-white/5 p-8"
          >
            <form onSubmit={handleIngest} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                  <LinkIcon size={12} />
                  Source Article URL
                </label>
                <div className="flex gap-4">
                  <input 
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article..."
                    disabled={isProcessing}
                    className="flex-1 bg-black border border-white/10 px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-reserve-accent transition-colors disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isProcessing || !url.trim()}
                    className="flex items-center gap-3 bg-reserve-accent hover:bg-white text-black px-8 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'fetching' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Ingest & Transform</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {status === 'fetching' && (
                <div className="flex items-center gap-4 py-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-reserve-accent"
                    />
                    <span className="text-[10px] uppercase tracking-widest">Extracting content & generating editorial rewrite...</span>
                  </div>
                </div>
              )}
            </form>

            {/* How it works */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-4">How It Works</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: '01', label: 'Paste URL', desc: 'Enter any article URL from the web' },
                  { step: '02', label: 'AI Extraction', desc: 'Content and images are automatically extracted' },
                  { step: '03', label: 'Editorial Transform', desc: 'AI rewrites in THE RESERVE voice' },
                  { step: '04', label: 'Review & Publish', desc: 'Edit, refine, and save as draft' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="text-reserve-accent font-mono text-xs">{item.step}</span>
                    <div>
                      <p className="text-white text-[11px] uppercase tracking-widest font-bold">{item.label}</p>
                      <p className="text-zinc-600 text-[10px] mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Error Display - Elegant Admin Error Card */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 p-6"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div className="flex-1 space-y-3">
                <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Ingestion Failed</p>
                <p className="text-zinc-300 text-sm">{error}</p>
                
                {/* Contextual help based on error type */}
                <div className="pt-2 border-t border-red-500/10">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Troubleshooting Tips:</p>
                  <ul className="text-zinc-500 text-xs space-y-1">
                    {error.toLowerCase().includes('fetch') || error.toLowerCase().includes('network') ? (
                      <>
                        <li>• Check if the URL is accessible in your browser</li>
                        <li>• Some sites block automated requests</li>
                        <li>• Try a different article from the same source</li>
                      </>
                    ) : error.toLowerCase().includes('content') || error.toLowerCase().includes('extract') ? (
                      <>
                        <li>• The article may be behind a paywall</li>
                        <li>• Try an article with more text content</li>
                        <li>• Some sites use JavaScript rendering that cannot be scraped</li>
                      </>
                    ) : error.toLowerCase().includes('ai') || error.toLowerCase().includes('gemini') ? (
                      <>
                        <li>• AI service may be temporarily unavailable</li>
                        <li>• Try again in a few moments</li>
                        <li>• Check if GEMINI_API_KEY is configured</li>
                      </>
                    ) : error.toLowerCase().includes('json') || error.toLowerCase().includes('response') || error.toLowerCase().includes('malformed') ? (
                      <>
                        <li>• AI returned an unexpected format</li>
                        <li>• This is usually temporary - please try again</li>
                        <li>• If it persists, try a different article</li>
                      </>
                    ) : (
                      <>
                        <li>• Try again with a different URL</li>
                        <li>• Ensure the URL points to an article page</li>
                        <li>• Contact support if the issue persists</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => { setError(null); setStatus('idle'); }} 
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview & Edit Mode */}
      <AnimatePresence mode="wait">
        {(status === 'preview' || status === 'saving') && ingestedArticle && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Source Info Bar */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Check className="text-emerald-500" size={18} />
                <div>
                  <p className="text-emerald-500 text-[10px] uppercase tracking-widest font-bold">Content Successfully Transformed</p>
                  <a 
                    href={ingestedArticle.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 text-[10px] hover:text-white flex items-center gap-1 mt-1"
                  >
                    Source: {ingestedArticle.sourceDomain} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span className="text-[10px] uppercase tracking-widest">Start Over</span>
                </button>
                <button 
                  onClick={handleSaveAsDraft}
                  disabled={status === 'saving'}
                  className="flex items-center gap-2 px-6 py-2 bg-reserve-accent hover:bg-white text-black transition-colors disabled:opacity-50"
                >
                  {status === 'saving' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    {status === 'saving' ? 'Saving...' : 'Save as Draft'}
                  </span>
                </button>
              </div>
            </div>

            {/* Editable Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Meta Fields */}
              <div className="lg:col-span-1 space-y-6">
                {/* Title */}
                <div className="bg-zinc-950 border border-white/5 p-6 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                    <FileText size={12} />
                    Headline
                  </label>
                  <textarea
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    rows={2}
                    className="w-full bg-black border border-white/10 p-4 text-white font-serif text-lg focus:outline-none focus:border-reserve-accent resize-none"
                  />
                </div>

                {/* Subtitle */}
                <div className="bg-zinc-950 border border-white/5 p-6 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Subtitle</label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full bg-black border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-reserve-accent"
                    placeholder="Optional subheading..."
                  />
                </div>

                {/* Excerpt */}
                <div className="bg-zinc-950 border border-white/5 p-6 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Excerpt</label>
                  <textarea
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    rows={3}
                    className="w-full bg-black border border-white/10 p-4 text-zinc-300 text-sm focus:outline-none focus:border-reserve-accent resize-none"
                    placeholder="Brief summary for article cards..."
                  />
                  <p className="text-zinc-600 text-[10px]">{editExcerpt.length}/200 characters</p>
                </div>

                {/* Category */}
                <div className="bg-zinc-950 border border-white/5 p-6 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-black border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-reserve-accent"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Image */}
                <div className="bg-zinc-950 border border-white/5 p-6 space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                    <ImageIcon size={12} />
                    Featured Image
                  </label>
                  
                  {editImageUrl && (
                    <div className="relative aspect-video bg-black border border-white/10 overflow-hidden">
                      <img 
                        src={editImageUrl} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-zinc-400 text-xs focus:outline-none focus:border-reserve-accent"
                    placeholder="Image URL..."
                  />
                  <input
                    type="text"
                    value={editImageCredit}
                    onChange={(e) => setEditImageCredit(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-zinc-400 text-xs focus:outline-none focus:border-reserve-accent"
                    placeholder="Image credit..."
                  />
                </div>
              </div>

              {/* Right Column - Content Editor */}
              <div className="lg:col-span-2 bg-zinc-950 border border-white/5 p-6">
                <RichTextEditor 
                  blocks={editContent}
                  onChange={setEditContent}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State */}
      <AnimatePresence>
        {status === 'idle' && !ingestedArticle && url === '' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
              Ready to transform content. Paste a URL above to begin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
