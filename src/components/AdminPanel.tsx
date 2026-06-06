import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FileText, Settings, LogOut, 
  ChevronRight, Shield, Layout as HomepageIcon,
  Circle, Mail, Briefcase, Video, Layers, Users, Database 
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { logout } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

// Admin Sections
import OverviewSection from './admin/OverviewSection';
import StoriesSection from './admin/StoriesSection';
import HomepageSection from './admin/HomepageSection';
import SettingsSection from './admin/SettingsSection';
import NewsletterSection from './admin/NewsletterSection';
import LeadSection from './admin/LeadSection';
import VideoSection from './admin/VideoSection';
import CategorySection from './admin/CategorySection';
import AuthorsSection from './admin/AuthorsSection';
import BulkImportSection from './admin/BulkImportSection';
import SpreadsheetImportSection from './admin/SpreadsheetImportSection';

export default function AdminPanel() {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'stories', label: 'Stories', icon: FileText },
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
      case 'bulk-import': return (
        <div className="space-y-12">
          <SpreadsheetImportSection />
          <BulkImportSection />
        </div>
      );
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
    <div className="min-h-screen bg-black text-white flex font-sans">
      <aside className="w-80 border-r border-white/5 flex flex-col fixed inset-y-0 left-0 bg-zinc-950 z-20">
        <div className="p-10 border-b border-white/5">
          <h1 className="text-sm font-serif tracking-[0.3em] font-bold flex items-center gap-3">
            <Shield className="text-reserve-accent" size={16} /> RESERVE ADMIN
          </h1>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${
                activeTab === item.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-reserve-accent' : 'text-inherit'} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/40">
          <Link to="/" target="_blank" className="block w-full py-3 border border-white/10 text-[10px] text-center uppercase tracking-widest hover:bg-white/5">
            Visit Site
          </Link>
          <button onClick={handleLogout} className="w-full mt-4 py-3 text-[10px] text-zinc-500 uppercase hover:text-reserve-accent">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-80 min-h-screen">
        <div className="p-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
