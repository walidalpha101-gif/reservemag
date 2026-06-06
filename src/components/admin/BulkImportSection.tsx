import React, { useState } from 'react';
import { Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function BulkImportSection() {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiCategory, setAiCategory] = useState('Culture');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const handleAiGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setGeneratingAi(true);
    setError(null);
    setAiSuccessMessage(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing in Vercel settings.");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are a professional magazine editor. Generate a story about: "${aiPrompt}". 
      Return ONLY a JSON object: 
      {
        "title": "${aiTitle || 'Untitled'}",
        "excerpt": "A short engaging summary.",
        "content": [{"id": "1", "type": "paragraph", "text": "...", "style": {"bold": false, "italic": false, "underline": false, "fontSize": "medium", "alignment": "left"}}],
        "category": "${aiCategory}"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      // EXACT FIX: response.text has NO parentheses in the modern SDK!
      const articleData = JSON.parse(response.text);

      const safeSlug = (articleData.title || 'untitled')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      await addDoc(collection(db, 'articles'), {
        ...articleData,
        slug: safeSlug,
        status: 'draft',
        featured: false,
        author: 'AI Editorial',
        image: { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', credit: 'AI' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setAiSuccessMessage(`Successfully saved: ${articleData.title}`);
      setAiPrompt('');
      setAiTitle('');
    } catch (err: any) {
      console.error("AI Engine Error:", err);
      setError('Generation failed. Ensure API key is valid.');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-8 bg-zinc-900/30 p-8 border border-white/5">
      <h2 className="text-xl font-serif">AI Content Engine (Gemini 3.5)</h2>
      <form onSubmit={handleAiGeneration} className="space-y-4">
        <input 
          className="w-full bg-black border border-white/10 p-4 text-sm focus:border-reserve-accent outline-none"
          placeholder="Article Title (Optional)"
          value={aiTitle}
          onChange={(e) => setAiTitle(e.target.value)}
        />
        <textarea 
          className="w-full bg-black border border-white/10 p-4 text-sm focus:border-reserve-accent outline-none"
          placeholder="Enter article topic..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={4}
        />
        <button disabled={generatingAi} className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-reserve-accent transition-all disabled:opacity-50">
          {generatingAi ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
          {generatingAi ? 'Generating...' : 'Generate & Save'}
        </button>
      </form>
      {error && <div className="flex items-center gap-2 text-rose-500 text-[10px]"><X size={12} /> {error}</div>}
      {aiSuccessMessage && <div className="flex items-center gap-2 text-emerald-500 text-[10px]"><CheckCircle2 size={12} /> {aiSuccessMessage}</div>}
    </div>
  );
}
