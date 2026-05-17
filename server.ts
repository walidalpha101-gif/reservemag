import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

// Firebase imports for server side
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

const isProd = process.env.NODE_ENV === 'production' || 
               process.env.VITE_USER_NODE_ENV === 'production' ||
               // Detect if we are running from the bundled file in dist
               (typeof __filename !== 'undefined' && __filename.includes(path.join('dist', 'server.cjs')));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  console.log(`[Server] Starting... | NODE_ENV: ${process.env.NODE_ENV} | isProd: ${isProd} | PORT: ${PORT}`);

  // Health check endpoint
  app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, isProd }));

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
  <!-- SSR_INJECTED_METADATA -->
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


