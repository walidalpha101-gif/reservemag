import React, { useState } from 'react';
import { Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { articleService } from '../../services/articleService';

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
      if (!apiKey) throw new Error("API Key not found. Please check Vercel settings.");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Using the current stable frontier model for agentic tasks
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const prompt = `You are a professional magazine editor. Generate a story about: "${aiPrompt}". 
      Return ONLY a JSON object: 
      {
        "title": "${aiTitle || 'Untitled'}",
        "excerpt": "A short engaging summary.",
        "content": [{"id": "1", "type": "paragraph", "text": "...", "style": {"bold": false, "italic": false, "underline": false, "fontSize": "medium", "alignment": "left"}}],
        "category": "${aiCategory}"
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const articleData = JSON.parse(cleanJson);

      await addDoc(collection(db, 'articles'), {
        ...articleData,
        slug: articleService.generateSlug(articleData.title),
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
      setError('Generation failed. Ensure your API key is valid for gemini-3.5-flash.');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-8 bg-zinc-900/30 p-8 border border-white/5">
      <h2 className="text-xl font-serif">AI Content Engine (Powered by Gemini 3.5 Flash)</h2>
      <form onSubmit={handleAiGeneration} className="space-y-4">
        <input 
          className="w-full bg-black border border-white/10 p-4 text-sm focus:border-reserve-accent outline-none"
          placeholder="Article Title (Optional)"
          value={aiTitle}
          onChange={(e) => setAiTitle(e.target.value)}
        />
        <textarea 
          className="w-full bg-black border border-white/10 p-4 text-sm focus:border-reserve-accent outline-none"
          placeholder="Enter article topic or prompt..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={4}
        />
        <button 
          disabled={generatingAi} 
          className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-reserve-accent transition-all disabled:opacity-50"
        >
          {generatingAi ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
          {generatingAi ? 'Generating...' : 'Generate & Save'}
        </button>
      </form>
      
      {error && (
        <div className="flex items-center gap-2 text-rose-500 text-[10px]">
           <X size={12} /> {error}
        </div>
      )}
      {aiSuccessMessage && (
        <div className="flex items-center gap-2 text-emerald-500 text-[10px]">
           <CheckCircle2 size={12} /> {aiSuccessMessage}
        </div>
      )}
    </div>
  );
}
