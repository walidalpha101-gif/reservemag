import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layout as HomepageIcon,
  Circle,
  Mail,
  View,
  Briefcase,
  Video,
  Database,
  Layers,
  Users,
  Sparkles
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { logout } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

// New Section Components
import OverviewSection from './admin/OverviewSection';
import StoriesSection from './admin/StoriesSection';
import HomepageSection from './admin/HomepageSection';
import SettingsSection from './admin/SettingsSection';
import NewsletterSection from './admin/NewsletterSection';
import LeadSection from './admin/LeadSection';
import VideoSection from './admin/VideoSection';
import BulkImportSection from './admin/BulkImportSection';
import CategorySection from './admin/CategorySection';
import AuthorsSection from './admin/AuthorsSection';
import AIIngestionSection from './admin/AIIngestionSection';

type Tab = 'overview' | 'stories' | 'ai-ingestion' | 'bulk-import' | 'categories' | 'authors' | 'videos' | 'newsletter' | 'homepage' | 'settings' | 'leads';

export default function AdminPanel() {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'stories', label: 'Stories', icon: FileText },
    { id: 'ai-ingestion', label: 'AI Ingestion', icon: Sparkles },
    { id: 'bulk-import', label: 'Bulk Import', icon: Database },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'authors', label: 'Authors', icon: Users },
    { id: 'videos', label: 'Video Interviews', icon: Video },
    { id: 'leads', label: 'Lead Requests', icon: Briefcase },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'homepage', label: 'Homepage Control', icon: HomepageIcon },
    { id: 'settings', label: 'Registry Settings', icon: Settings },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewSection />;
      case 'stories': return <StoriesSection />;
      case 'ai-ingestion': return <AIIngestionSection />;
      case 'bulk-import': return <BulkImportSection />;
      case 'categories': return <CategorySection />;
      case 'authors': return <AuthorsSection />;
      case 'videos': return <VideoSection />;
      case 'newsletter': return <NewsletterSection />;
      case 'leads': return <LeadSection />;
      case 'homepage': return <HomepageSection />;
      case 'settings': return <SettingsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-reserve-accent selection:text-black">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-white/5 flex flex-col fixed inset-y-0 left-0 bg-zinc-950 z-20">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 border border-reserve-accent bg-reserve-accent/10 flex items-center justify-center">
              <Shield className="text-reserve-accent" size={16} />
            </div>
            <h1 className="text-sm font-serif tracking-[0.3em] font-bold">RESERVE ADMIN</h1>
          </div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em]">Editorial Management</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group ${
                activeTab === item.id 
                  ? 'text-white' 
                  : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-1/2 bg-reserve-accent"
                />
              )}
              <item.icon size={18} className={activeTab === item.id ? 'text-reserve-accent' : 'text-inherit'} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto text-reserve-accent" />}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6 bg-black/40">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center font-serif text-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                <Circle size={6} className="fill-emerald-500 text-emerald-500" />
                Active Session
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              <ExternalLink size={14} />
              Visit Site
            </Link>
            <button 
              onClick={handleLogout}
              className="p-3 border border-white/10 text-zinc-500 hover:text-reserve-accent hover:border-reserve-accent transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-80 min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 bg-black/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500 font-medium whitespace-nowrap">
             Archive <ChevronRight size={12} className="text-zinc-700" /> 
             <span className="text-white">{navItems.find(n => n.id === activeTab)?.label}</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium font-mono">
              SYSTEM_TIME: {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
