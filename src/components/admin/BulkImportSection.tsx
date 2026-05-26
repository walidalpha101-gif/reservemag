import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  ChevronRight,
  Database,
  Table as TableIcon,
  Search,
  AlertTriangle,
  History
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, writeBatch, doc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Article, Category, ArticleStatus, ContentBlock } from '../../types';

interface ImportSummary {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  errors: string[];
}

interface RowData {
  title: string;
  slug?: string;
  category: string;
  excerpt?: string;
  full_story: string;
  status?: string;
  featured?: string | boolean;
  image_credit?: string;
  author?: string;
  publish_date?: string;
}

export default function BulkImportSection() {
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<RowData[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Generation Mode Local States
  const [importMode, setImportMode] = useState<'manifest' | 'ai'>('manifest');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiCategory, setAiCategory] = useState('Culture');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiGeneratedArticle, setAiGeneratedArticle] = useState<any | null>(null);

  const handleAiGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    setError(null);
    setAiSuccessMessage(null);
    setAiGeneratedArticle(null);

    try {
      const response = await fetch('/api/ai/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: aiTitle.trim() || undefined,
          category: aiCategory,
          prompt: aiPrompt.trim()
        })
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Server returned invalid response. Please try again.');
      }

      const article = await response.json();
      setAiGeneratedArticle(article);
      setAiSuccessMessage(`Narrative successfully generated and saved to draft archives! Output contains ${article.content?.length || 0} formatted section blocks.`);
      setAiPrompt('');
      setAiTitle('');
    } catch (err: any) {
      console.error("[AI Generation] Failed to generate draft:", err);
      setError(err.message || 'Server returned invalid response. Please try again.');
    } finally {
      setGeneratingAi(false);
    }
  };

  React.useEffect(() => {
    const fetchCats = async () => {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      const cats = snap.docs.map(doc => doc.data().name as string);
      setCategories(cats);
    };
    fetchCats();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSummary(null);

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data as RowData[]);
        },
        error: (error) => {
          setError(`CSV Parsing Error: ${error.message}`);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws) as RowData[];
          setPreviewData(data);
        } catch (err: any) {
          setError(`Excel Parsing Error: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Unsupported file format. Please upload .csv or .xlsx');
    }
  };

  const validateCategory = (cat: string): Category => {
    if (categories.length === 0) return cat || 'Culture';
    const found = categories.find(c => c.toLowerCase() === cat.toLowerCase());
    return found || cat || categories[0];
  };

  const validateStatus = (status: string): ArticleStatus => {
    const validStatuses: ArticleStatus[] = ['draft', 'published', 'scheduled'];
    const found = validStatuses.find(s => s.toLowerCase() === status.toLowerCase());
    return found || 'draft';
  };

  const processImport = async () => {
    if (previewData.length === 0) return;
    setImporting(true);
    setError(null);

    const resultSummary: ImportSummary = {
      total: previewData.length,
      success: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    try {
      const articlesRef = collection(db, 'articles');
      
      // Batch processing would be better, but we need to check for duplicate slugs row by row
      // or at least fetch existing slugs first.
      
      for (const row of previewData) {
        try {
          if (!row.title || !row.full_story) {
            resultSummary.failed++;
            resultSummary.errors.push(`Row missing title or full_story: ${row.title || 'Untitled'}`);
            continue;
          }

          const slug = row.slug || generateSlug(row.title);
          
          // Check for duplicate slug
          const slugQuery = query(articlesRef, where('slug', '==', slug));
          const slugSnap = await getDocs(slugQuery);

          if (!slugSnap.empty) {
            resultSummary.skipped++;
            resultSummary.errors.push(`Duplicate slug skipped: ${slug}`);
            continue;
          }

          const category = validateCategory(row.category);
          const status = validateStatus(row.status || 'draft');
          const featured = typeof row.featured === 'string' 
            ? row.featured.toLowerCase() === 'true' 
            : !!row.featured;

          // Handle publish date
          const rawPublishDate = row.publish_date ? new Date(row.publish_date) : new Date();
          // Check if date is valid
          const finalPublishDate = isNaN(rawPublishDate.getTime()) ? new Date() : rawPublishDate;
          const dateFormatted = finalPublishDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          // Convert full_story to content blocks
          const content: ContentBlock[] = [
            {
              id: crypto.randomUUID(),
              type: 'paragraph',
              text: row.full_story,
              style: {
                bold: false,
                italic: false,
                underline: false,
                fontSize: 'medium',
                alignment: 'left'
              }
            }
          ];

          const newArticle: Partial<Article> = {
            title: row.title,
            slug,
            category,
            excerpt: row.excerpt || row.full_story.substring(0, 150) + '...',
            content,
            status,
            featured,
            author: row.author || 'The Reserve Editorial',
            image: {
              url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', // Placeholder
              credit: row.image_credit || 'Placeholder',
            },
            readTime: '5 min',
            publishDate: finalPublishDate.toISOString(),
            date: dateFormatted,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await addDoc(articlesRef, newArticle);
          resultSummary.success++;
        } catch (rowErr: any) {
          resultSummary.failed++;
          resultSummary.errors.push(`Error in row "${row.title}": ${rowErr.message}`);
        }
      }

      setSummary(resultSummary);
      setPreviewData([]);
    } catch (globalErr: any) {
      setError(`Critical Import Failure: ${globalErr.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-12 font-sans text-white">
      <div className="flex border-b border-white/5 pb-4">
        <button
          onClick={() => {
            setImportMode('manifest');
            setError(null);
          }}
          className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${
            importMode === 'manifest' 
              ? 'text-reserve-accent border-b border-reserve-accent font-bold' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Spreadsheet Import (.csv / .xlsx)
        </button>
        <button
          onClick={() => {
            setImportMode('ai');
            setError(null);
          }}
          className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${
            importMode === 'ai' 
              ? 'text-reserve-accent border-b border-reserve-accent font-bold' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Gemini AI Ingestion Engine
        </button>
      </div>

      {importMode === 'manifest' && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-reserve-accent/10 p-2 rounded-sm">
                <Database className="text-reserve-accent" size={18} />
              </div>
              <h2 className="text-2xl font-serif text-white uppercase tracking-wider">Bulk Story Import</h2>
            </div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Newsroom-scale content deployment system</p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-6 py-3 transition-all duration-300 group"
            >
              <Upload size={16} className="text-reserve-accent group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Select File (CSV/XLSX)</span>
            </button>
          </div>
        </div>
      )}

      {importMode === 'ai' && (
        <div className="space-y-1 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-reserve-accent/10 p-2 rounded-sm">
              <Database className="text-reserve-accent" size={18} />
            </div>
            <h2 className="text-2xl font-serif text-white uppercase tracking-wider font-bold">AI Ingestion Engine</h2>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Calibrated Gemini-Powered Story generator</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 flex items-start gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div className="space-y-1">
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Import Error</p>
            <p className="text-zinc-400 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-zinc-600 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {summary && (
        <div className={`border p-8 ${summary.failed > 0 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-2 ${summary.failed > 0 ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`}>
                {summary.failed > 0 ? <AlertTriangle className="text-orange-500" size={20} /> : <CheckCircle2 className="text-emerald-500" size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-serif text-white uppercase tracking-widest">Import Summary</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Process completed successfully</p>
              </div>
            </div>
            <button 
              onClick={() => setSummary(null)}
              className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white border-b border-zinc-800 hover:border-white transition-all pb-1"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/40 p-4 border border-white/5 space-y-1">
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Total Rows</p>
              <p className="text-xl font-serif text-white">{summary.total}</p>
            </div>
            <div className="bg-black/40 p-4 border border-white/5 space-y-1">
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Success</p>
              <p className="text-xl font-serif text-emerald-500">{summary.success}</p>
            </div>
            <div className="bg-black/40 p-4 border border-white/5 space-y-1">
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Skipped (Duplicates)</p>
              <p className="text-xl font-serif text-orange-500">{summary.skipped}</p>
            </div>
            <div className="bg-black/40 p-4 border border-white/5 space-y-1">
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Failed</p>
              <p className="text-xl font-serif text-red-500">{summary.failed}</p>
            </div>
          </div>

          {summary.errors.length > 0 && (
            <div className="mt-8 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold border-b border-white/5 pb-2">Logs / Warnings</p>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-4 custom-scrollbar">
                {summary.errors.map((msg, idx) => (
                  <p key={idx} className="text-[9px] text-zinc-600 font-mono flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] text-zinc-700">{idx + 1}</span>
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {previewData.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="bg-reserve-accent p-2">
                <TableIcon className="text-black" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-serif text-white uppercase tracking-widest">Import Preview</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Validating {previewData.length} potential stories for ingestion
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreviewData([])}
                className="px-6 py-3 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={importing}
                onClick={processImport}
                className="flex items-center gap-3 bg-reserve-accent text-black px-8 py-3 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {importing ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
                <span className="text-[10px] uppercase tracking-widest font-black">Confirm & Import Stories</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-white/5 bg-zinc-950/50">
            <table className="w-full text-left text-[10px] uppercase tracking-widest border-collapse">
              <thead>
                <tr className="bg-black/50 border-b border-white/10">
                  <th className="p-4 font-black">Title</th>
                  <th className="p-4 font-black">Category</th>
                  <th className="p-4 font-black">Author</th>
                  <th className="p-4 font-black">Status</th>
                  <th className="p-4 font-black">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 max-w-[300px] truncate">
                      <span className="text-zinc-600 group-hover:text-white transition-colors">
                        {row.title || <span className="text-red-500/50 italic">Missing Title</span>}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-zinc-900 border border-white/5 text-zinc-500">
                        {row.category || 'Culture'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{row.author || 'Editorial Team'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-sm ${
                        (row.status || 'draft') === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {row.status || 'draft'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-700 font-mono text-[9px] lowercase">
                      {row.slug || generateSlug(row.title || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {importMode === 'manifest' && !previewData.length && !summary && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group border-2 border-dashed border-white/5 py-40 rounded-sm flex flex-col items-center justify-center gap-6 hover:border-reserve-accent/30 hover:bg-reserve-accent/[0.01] transition-all cursor-pointer"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-800 transition-all duration-500">
              <FileSpreadsheet size={32} className="text-zinc-600 group-hover:text-reserve-accent transition-colors" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-reserve-accent p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Upload size={14} className="text-black" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-serif text-white uppercase tracking-[0.2em] group-hover:text-reserve-accent transition-colors">Upload Import Manifest</p>
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              Accepts .csv and .xlsx files with Title, Slug, Category, Excerpt, and Full Story columns. Unmatched rows will be skipped.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <span className="text-[8px] uppercase tracking-widest text-zinc-700 border border-white/5 py-1 px-3">CSV Support</span>
            <span className="text-[8px] uppercase tracking-widest text-zinc-700 border border-white/5 py-1 px-3">Excel Support</span>
            <span className="text-[8px] uppercase tracking-widest text-zinc-700 border border-white/5 py-1 px-3">Bulk Queue</span>
          </div>
        </div>
      )}

      {importMode === 'ai' && (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
          {aiSuccessMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-start gap-4">
              <CheckCircle2 className="text-emerald-500 shrink-0 animate-bounce" size={20} />
              <div className="space-y-1">
                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Generation Success</p>
                <p className="text-zinc-400 text-xs leading-relaxed">{aiSuccessMessage}</p>
                {aiGeneratedArticle && (
                  <div className="mt-4 p-4 bg-black/60 border border-white/5 font-mono text-[9px] text-zinc-500 uppercase tracking-widest space-y-1 block">
                    <p>Document ID: <span className="text-white">{aiGeneratedArticle.id}</span></p>
                    <p>Slug Identifier: <span className="text-white">{aiGeneratedArticle.slug}</span></p>
                    <p>Blocks Parsed: <span className="text-white">{aiGeneratedArticle.content?.length || 0}</span></p>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setAiSuccessMessage(null)} className="ml-auto text-zinc-600 hover:text-white">
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleAiGeneration} className="bg-zinc-950/50 border border-white/5 p-8 md:p-12 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-reserve-accent">AI Content Engine Specifications</h3>
              <p className="text-zinc-500 text-[10px] uppercase leading-relaxed max-w-xl">
                Enter your narrative parameters below. The Gemini model is calibrated to generate an editorial narrative broken into structured article blocks (headers, paragraphs, and pull-quotes) which will be automatically ingested as a draft.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest font-bold text-zinc-400">Target Headline / Title (Optional)</label>
                <input
                  type="text"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  placeholder="e.g., The Silent Majesty of Kyoto Craft"
                  className="w-full bg-black border border-white/10 focus:border-reserve-accent/50 text-white px-4 py-3 text-xs outline-none focus:ring-0 transition-colors uppercase tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest font-bold text-zinc-400">Target Category</label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full bg-black border border-white/10 focus:border-reserve-accent/50 text-white px-4 py-3 text-xs outline-none focus:ring-0 transition-colors uppercase tracking-widest"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    ['Fashion', 'Business', 'Sports', 'Cinema', 'Culture', 'Luxury'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] uppercase tracking-widest font-bold text-zinc-400">Concept Prompt & Directions (Required)</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., A deep-dive article investigating the resurgence of local indigo-dyeing workshops in rural Japan, and how tech-forward apparel startups are integrating these ancient practices into minimalist urban streetwear."
                rows={6}
                required
                className="w-full bg-black border border-white/10 focus:border-reserve-accent/50 text-white p-4 text-xs outline-none focus:ring-0 transition-colors tracking-wide leading-relaxed resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-8">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Model Pipeline</p>
                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">gemini-1.5-flash @ low temperature</p>
              </div>

              <button
                type="submit"
                disabled={generatingAi || !aiPrompt.trim()}
                className="flex items-center gap-3 bg-reserve-accent hover:bg-reserve-accent/90 disabled:opacity-50 text-black px-8 py-4 text-[10px] uppercase tracking-widest font-black transition-all hover:scale-105 disabled:scale-100"
              >
                {generatingAi ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Engaging Generation Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} />
                    <span>Generate & Ingest Narrative</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
