import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

// Firebase imports for server side
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const isProd = process.env.NODE_ENV === 'production' || 
               process.env.VITE_USER_NODE_ENV === 'production' ||
               // Detect if we are running from the bundled file in dist
               (typeof __filename !== 'undefined' && __filename.includes(path.join('dist', 'server.cjs')));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  console.log("[Server] GEMINI_API_KEY Configured:", !!process.env.GEMINI_API_KEY || !!process.env.VITE_GEMINI_API_KEY);

  console.log(`[Server] Starting... | NODE_ENV: ${process.env.NODE_ENV} | isProd: ${isProd} | PORT: ${PORT}`);

  // Health check endpoint
  app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, isProd }));

  // AI Ingest endpoint
  app.post('/api/ai/ingest', async (req, res) => {
    const { title, category, prompt } = req.body;

    console.log("[AI Ingestion] Incoming Request Payload:", { title, category, prompt });
    console.log("[AI Ingestion] Collection Path: articles");

    if (!prompt) {
      console.error("[AI Ingestion] Error: Missing required 'prompt' field");
      return res.status(400).send("Prompt is required for draft generation.");
    }

    if (!process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
      console.error("[AI Ingestion] Error: GEMINI_API_KEY is not defined in backend process.env.");
      return res.status(500).send("Gemini API key is not configured on the server.");
    }

    try {
      // Modern SDK Initialization
      const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });

      const finalTopicPrompt = `You are an expert editorial writer for The Reserve Magazine, a luxury editorial publication focused on Asian fashion, culture, and high-end lifestyle.
Generate a highly polished, deep, and beautifully stylized magazine feature article based on the following user input prompt: "${prompt}".
${title ? `The targeted title or headline should be close to or exactly: "${title}".` : ""}
The category must be: "${category || "Culture"}".

You must return ONLY a raw JSON object matching the detailed article schema below. Do NOT output any pre-amble, markdown formatting fences outside the raw JSON, or extra text. Output ONLY valid, parsable JSON.

Schema requirements:
{
  "title": "A highly elegant display headline for the article",
  "excerpt": "A luxurious and compelling single-sentence or two-sentence hook summarizing the narrative.",
  "category": "${category || "Culture"}",
  "date": "Current elegant month, day, year (example: May 26, 2026)",
  "readTime": "Calculated reading time (example: '7 min')",
  "articleBlocks": [
    {
      "type": "header",
      "text": "Section Heading"
    },
    {
      "type": "paragraph",
      "text": "Paragraph text (paragraphs should be rich, detailed, elegant, and atmospheric, around 3-4 rich paragraphs per section)"
    },
    {
      "type": "quote",
      "text": "An atmospheric statement or pull-quote to break up the text"
    }
  ]
}`;

      console.log("[AI Ingestion] Calling Gemini API...");
      
      // Using modern model and structured output format
      const genResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: finalTopicPrompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      if (!genResponse) {
        console.error("[AI Ingestion] Error: Gemini returned an empty response object");
        throw new Error("Empty response object from Gemini.");
      }

      // Modern SDK extracts text directly
      const responseText = genResponse.text();
      
      if (!responseText) {
        console.error("[AI Ingestion] Error: Gemini response text is empty or undefined");
        throw new Error("Generative draft output is empty.");
      }

      console.log("[AI Ingestion] Gemini Response Received. Cleaning response text...");
      let cleanText = responseText.trim();
      if (cleanText.includes("```json")) {
        cleanText = cleanText.split("```json")[1].split("```")[0];
      } else if (cleanText.includes("```")) {
        cleanText = cleanText.split("```")[1].split("```")[0];
      }
      cleanText = cleanText.trim();

      console.log("[AI Ingestion] Attempting to parse cleaned text as JSON...");
      let parsed: any;
      try {
        parsed = JSON.parse(cleanText);
      } catch (parseErr: any) {
        console.error("[AI Ingestion] JSON parsing failed for raw output:", responseText);
        console.error("[AI Ingestion] Parse error details:", parseErr);
        throw new Error(`Invalid JSON format generated by AI: ${parseErr.message}`);
      }

      // Validation and fallback handling
      const titleClean = parsed.title || title || 'Untitled AI Narrative';
      const excerptClean = parsed.excerpt || 'A compelling and sophisticated narrative curating tomorrow\'s visions.';
      const categoryClean = parsed.category || category || 'Culture';
      const dateClean = parsed.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const readTimeClean = parsed.readTime || '5 min';
      const rawBlocks = Array.isArray(parsed.articleBlocks) ? parsed.articleBlocks : [];

      console.log("[AI Ingestion] Extracting blocks and mapping to ContentBlock schema...");
      const content = rawBlocks.map((block: any) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        type: block.type === 'header' || block.type === 'section' ? 'header' : block.type === 'quote' ? 'quote' : 'paragraph',
        text: block.text || '',
        style: {
          bold: false,
          italic: block.type === 'quote',
          underline: false,
          fontSize: 'medium',
          alignment: 'left'
        }
      }));

      if (content.length === 0) {
        content.push({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          type: 'paragraph',
          text: prompt || 'Narrative content generation in progress.',
          style: {
            bold: false,
            italic: false,
            underline: false,
            fontSize: 'medium',
            alignment: 'left'
          }
        });
      }

      const slugClean = titleClean
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      const newArticle = {
        title: titleClean,
        slug: slugClean,
        subtitle: '',
        excerpt: excerptClean,
        category: categoryClean,
        status: 'draft',
        featured: false,
        author: 'AI Ingestion Engine',
        image: {
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
          credit: 'AI Assistant',
          source: 'Unsplash'
        },
        mobileImage: {
          url: '',
          credit: '',
          source: ''
        },
        mobileCropX: 50,
        readTime: readTimeClean,
        date: dateClean,
        publishDate: new Date().toISOString(),
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("[AI Ingestion] Saving generated draft to Firestore. Doc slug:", slugClean);
      if (!db) {
        throw new Error("Firestore database service is not initialized on the server.");
      }

      const articlesRef = collection(db, 'articles');
      const docRef = await addDoc(articlesRef, newArticle);
      console.log("[AI Ingestion] Success! Saved with Firestore ID:", docRef.id);

      // Return direct, unnested response mapped to schema
      res.status(200).json({
        id: docRef.id,
        ...newArticle
      });

    } catch (err: any) {
      console.error("[AI Ingestion] CRITICAL EXCEPTION:", err);
      res.status(500).send(`Failed to ingest AI narrative: ${err.message || err}`);
    }
  });

  // Set permissive security settings
  app.use(cors());
  app.set('trust proxy', true);

  // Load config
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  let db: any;
  try {
    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
      console.log("[Server] Firebase Initialized");
      
      // Re-initialize core editorial collections if empty
      const { articleService } = await import('./src/services/articleService');
      await articleService.ensureContentExists();
    } else {
      console.warn("[Server] Firebase config not found at:", configPath);
    }
  } catch (err) {
    console.error("[Server] Firebase Init Error:", err);
  }

  let viteInstance: any;
  // Only load Vite in development
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      viteInstance = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(viteInstance.middlewares);
      console.log("[Server] Vite middleware loaded (DEV)");
    } catch (err) {
      console.error("[Server] Failed to load Vite:", err);
    }
  }

  // System routes that should never be SSR'd
  const systemRoutes = ['admin', 'get-featured', 'assets', 'api', 'manifest.json', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'index.html'];

  // 1. Static Assets (Must come before SSR to avoid intercepting them, but only for assets)
  if (isProd) {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve assets directory specifically
    app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y' }));
    // Serve other generic static files except index.html
    app.use(express.static(distPath, { index: false }));
  }

  // 2. SSR handler for ALL potential public routes
  app.get('*', async (req, res, next) => {
    const urlPath = req.path;
    
    // Explicitly ignore common asset extensions that might have fallen through
    if (urlPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|otf)$/)) {
      return next();
    }

    const urlParts = urlPath.split('/').filter(Boolean);
    const slug = urlParts[0];

    // System routes check
    if (systemRoutes.includes(slug || '')) {
      return next();
    }

    try {
      console.log(`[SSR] Request: ${urlPath} | User-Agent: ${req.headers['user-agent']}`);
      
      let title = 'THE RESERVE';
      let description = 'Editorial publication investigating Asian luxury and culture.';
      let image = '/og-default.jpg'; 
      let isArticle = !!slug;

      // Article Data Fetching
      if (isArticle && db) {
        try {
          console.log(`[SSR] Checking DB for slug: ${slug}`);
          const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
          const snap = await getDocs(q);
          
          if (!snap.empty) {
            const article = snap.docs[0].data();
            title = article.seo?.metaTitle || article.title || title;
            description = article.seo?.metaDescription || article.excerpt || article.subtitle || description;
            const articleImage = article.seo?.socialImage || article.image?.url;
            if (articleImage) image = articleImage;
            console.log(`[SSR] Article data matched: ${title}`);
          } else {
            console.warn(`[SSR] No article found for slug: ${slug}`);
            isArticle = false;
          }
        } catch (e) {
          console.error("[SSR] Firestore request failed:", e);
        }
      }

      // Load template
      const templatePath = isProd 
        ? path.resolve(process.cwd(), 'dist/index.html') 
        : path.resolve(process.cwd(), 'index.html');
      
      if (!fs.existsSync(templatePath)) {
        console.error(`[SSR] Template missing: ${templatePath}`);
        return next();
      }

      let template = fs.readFileSync(templatePath, 'utf-8');

      // Transform in dev to include Vite client scripts
      if (!isProd && viteInstance) {
        template = await viteInstance.transformIndexHtml(req.originalUrl, template);
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['host'] || 'thereservemag.com';
      const baseUrl = `${protocol}://${host}`;
      const absoluteImage = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
      const canonicalUrl = !slug ? baseUrl : `${baseUrl}/${slug}`;
      
      // Clean description for meta (remove tags, newlines, limit length)
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/\n/g, ' ')
        .trim()
        .substring(0, 160);

      const metaTags = `
  <title>${title} | THE RESERVE</title>
  <meta name="description" content="${cleanDescription.replace(/"/g, '&quot;')}" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${cleanDescription.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${absoluteImage}" />
  <meta property="og:image:secure_url" content="${absoluteImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="${isArticle ? 'article' : 'website'}" />
  <meta property="og:site_name" content="THE RESERVE" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${cleanDescription.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${absoluteImage}" />
  <link rel="canonical" href="${canonicalUrl}" />
`;

      // Remove existing redundant tags from the base template
      template = template.replace(/<title>[\s\S]*?<\/title>/gi, '');
      template = template.replace(/<meta\b[^>]*(name|property)="(og:|twitter:|description)[^>]*>/gi, '');
      template = template.replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '');
      
      // Add OG prefix and debug markers
      template = template.replace(/<html[^>]*>/i, (match) => {
        let h = match;
        if (!h.includes('prefix=')) h = h.replace(/>$/, ' prefix="og: https://ogp.me/ns#">');
        if (!h.includes('data-ssr=')) h = h.replace(/>$/, ' data-ssr="true">');
        return h;
      });

      // Inject the meta tags into head
      template = template.replace(/<head[^>]*>/i, (match) => `${match}\n${metaTags}`);

      console.log(`[SSR] Success responding for ${urlPath}`);
      return res.status(200).set({ 
        'Content-Type': 'text/html',
        'Cache-Control': 'public, no-cache, must-revalidate',
        'X-SSR-Status': 'Active',
        'X-SSR-Type': isArticle ? 'Article' : 'Homepage',
        'X-SSR-Ready': 'Verified'
      }).send(template);

    } catch (err: any) {
      console.error(`[SSR] ERROR during processing ${urlPath}:`, err);
      return next(); // Fall through to standard SPA behavior if SSR fails
    }
  });

  // Final fallback (for system routes or skipped assets)
  app.use((req, res) => {
    const templatePath = isProd 
      ? path.resolve(process.cwd(), 'dist/index.html') 
      : path.resolve(process.cwd(), 'index.html');
    
    if (fs.existsSync(templatePath)) {
      res.status(200).set('X-SSR-Status', 'Bypassed').sendFile(templatePath);
    } else {
      res.status(404).send('Not Found');
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Production-ready on port ${PORT} | ENV: ${isProd ? 'PROD' : 'DEV'}`);
  });
}

startServer().catch(err => {
  console.error("[CRITICAL] Startup failed:", err);
  process.exit(1);
});
