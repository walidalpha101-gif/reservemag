import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedStrip from './components/FeaturedStrip';
import EditorialGrid from './components/EditorialGrid';
import CategorySection from './components/CategorySection';
import VideoSection from './components/VideoSection';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import ArticlePage from './pages/ArticlePage';
import GetFeaturedPage from './pages/GetFeaturedPage';
import { Article, Category, HomepageConfig } from './types';
import { FirebaseProvider, useFirebase } from './context/FirebaseContext';
import { articleService } from './services/articleService';
import { signInWithGoogle, logout } from './lib/firebase';
import { LogIn, LogOut, Settings, Users } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [config, setConfig] = useState<HomepageConfig | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setDbLoading(true);
      try {
        const [data, homepageConfig] = await Promise.all([
          articleService.getAllArticles(false), // Published only for homepage default
          import('./services/settingsService').then(m => m.settingsService.getHomepageConfig())
        ]);
        
        setArticles(data || []);
        setConfig(homepageConfig);
      } catch (error) {
        console.error("Home fetch error:", error);
      } finally {
        setDbLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const featuredHero = useMemo(() => {
    if (config?.heroArticleId) {
      return articles.find(a => a.id === config.heroArticleId) || articles[0];
    }
    return articles.find(a => a.featured && a.status === 'published') || articles[0];
  }, [articles, config]);

  const featuredStrip = useMemo(() => {
    if (config?.featuredArticleIds?.length) {
      return articles.filter(a => config.featuredArticleIds.includes(a.id as string));
    }
    return articles.filter(a => !a.featured && a.id !== featuredHero?.id && a.status === 'published').slice(0, 6);
  }, [articles, config, featuredHero]);
  
  const publishedArticles = useMemo(() => articles.filter(a => a.status === 'published'), [articles]);

  const gridArticles = useMemo(() => 
    publishedArticles.filter(a => 
      a.id !== featuredHero?.id && 
      !featuredStrip.some(f => f.id === a.id)
    ).slice(0, 9), 
  [publishedArticles, featuredHero, featuredStrip]);
  
  const categorizedArticles = useMemo(() => {
    const categories: Category[] = ['Fashion', 'Business', 'Sports', 'Cinema', 'Culture', 'Luxury'];
    return categories.map(cat => ({
      name: cat,
      items: publishedArticles.filter(a => a.category === cat).slice(0, 5)
    }));
  }, [publishedArticles]);

  if (dbLoading && articles.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-reserve-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-600">Initializing Archive</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-reserve-bg p-6">
        <div className="text-center space-y-8 max-w-lg">
          <h1 className="text-4xl md:text-6xl font-serif">The Archive is Quiet.</h1>
          <p className="text-zinc-500 font-light leading-relaxed">
            Our editorial board is currently curating the next generation of narratives. Please return shortly as we repopulate the collection.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 border border-white/10 hover:bg-white/5 transition-all text-[10px] uppercase tracking-[0.2em]"
          >
            Refresh Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-reserve-bg text-reserve-text overflow-x-hidden selection:bg-reserve-accent selection:text-reserve-bg">
      <Navbar />
      
      <main>
        {featuredHero && <Hero article={featuredHero} />}
        <FeaturedStrip articles={featuredStrip} />
        <EditorialGrid articles={gridArticles} />
        <VideoSection />

        <div className="space-y-0">
          {categorizedArticles.map((cat) => (
            <CategorySection 
              key={cat.name} 
              category={cat.name} 
              articles={cat.items} 
            />
          ))}
        </div>

        <Newsletter />
      </main>

      <Footer />
      <AuthControls />
    </div>
  );
}

function AuthControls() {
  const { user, isAdmin: isUserAdmin } = useFirebase();

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-3">
      {!user ? (
        <button 
          onClick={signInWithGoogle}
          className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/5"
          title="Sign In"
        >
          <LogIn size={20} />
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button 
            onClick={logout}
            className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/5"
            title={`Sign Out (${user.displayName})`}
          >
            <LogOut size={20} />
          </button>
          
          <div className="flex flex-col gap-3">
            <Link 
              to="/admin" 
              className="bg-reserve-accent p-3 rounded-full text-reserve-bg hover:scale-110 transition-all shadow-lg flex items-center justify-center"
              title="Admin Panel"
            >
              <Settings size={20} />
            </Link>
          </div>
          
          {!isUserAdmin && user.email === 'walid.alpha101@gmail.com' && (
            <button 
              onClick={async () => {
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('./lib/firebase');
                await setDoc(doc(db, 'admins', user.uid), {
                  email: user.email,
                  role: 'admin',
                  createdAt: serverTimestamp()
                });
                alert('Admin profile provisioned. Please refresh.');
                window.location.reload();
              }}
              className="bg-emerald-500 p-3 rounded-full text-white animate-pulse"
              title="Initialize Admin Rights"
            >
              <Users size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useFirebase();

  if (loading) return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="/get-featured" element={<GetFeaturedPage />} />
          <Route path="/:slug" element={<ArticlePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FirebaseProvider>
  );
}
