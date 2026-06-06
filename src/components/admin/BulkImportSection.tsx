import React, { useState } from 'react';
import { Loader2, Sparkles, Database } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { articleService } from '../../services/articleService';

export default function BulkImportSection() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing in Vercel settings.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const fullPrompt = `Generate a magazine article about "${prompt}". Return ONLY JSON: {"title": "...", "excerpt": "...", "content": [{"id": "1", "type": "paragraph", "text": "...", "style": {"bold": false, "italic": false, "underline": false, "fontSize": "medium", "alignment": "left"}}], "category": "Culture"}`;
      
      const result = await model.generateContent(fullPrompt);
      const data = JSON.parse(result.response.text().replace(/```json|```/g, ''));

      await addDoc(collection(db, 'articles'), {
        ...data,
        slug: articleService.generateSlug(data.title),
        status: 'draft',
        featured: false,
        author: 'AI Engine',
        image: { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', credit: 'AI' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setStatus('Success: Story ingested to drafts.');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-900/30 border border-white/5">
      <h2 className="text-xl font-serif">AI Narrative Ingestion</h2>
      <form onSubmit={handleGenerate} className="space-y-4">
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-black border border-white/10 p-4 text-sm"
          placeholder="Enter article topic..."
          rows={4}
        />
        <button disabled={loading} className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
          Generate & Ingest
        </button>
      </form>
      {status && <p className="text-[10px] text-zinc-500 uppercase">{status}</p>}
    </div>
  );
}
