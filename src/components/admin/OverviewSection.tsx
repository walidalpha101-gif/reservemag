import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  Eye, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowUpRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { articleService } from '../../services/articleService';
import { cacheService } from '../../services/cacheService';
import { cdnService } from '../../services/cdnService';
import { Article } from '../../types';

export default function OverviewSection() {
  const [stats, setStats] = useState({
    totalStories: 0,
    publishedStories: 0,
    drafts: 0,
    totalViews: '124.8K' // Mock for now
  });
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [purgingCDN, setPurgingCDN] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const articles = await articleService.getAllArticles(true);
    setStats({
      ...stats,
      totalStories: articles.length,
      publishedStories: articles.filter(a => a.status === 'published').length,
      drafts: articles.filter(a => a.status === 'draft').length
    });
  };

  const statCards = [
    { label: 'Total Stories', value: stats.totalStories, icon: FileText, color: 'text-white' },
    { label: 'Published', value: stats.publishedStories, icon: Layers, color: 'text-emerald-500' },
    { label: 'System Drafts', value: stats.drafts, icon: Calendar, color: 'text-zinc-500' },
    { label: 'Archive Views', value: stats.totalViews, icon: TrendingUp, color: 'text-reserve-accent' },
  ];

  const handleRestoreDemo = async () => {
    if (confirm('Restore all demo Bangladeshi editorial content? This will add 8+ stories to your database.')) {
      await articleService.seedDemoData();
      alert('Demo content restored successfully!');
      loadStats();
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await cacheService.clearBrowserCache();
      setCacheCleared(true);
      setTimeout(() => {
        cacheService.hardReload();
      }, 1500);
    } catch (err) {
      console.error('Failed to clear cache:', err);
      setClearingCache(false);
    }
  };

  const handlePurgeCDN = async () => {
    if (!confirm('This will refresh cached content across the site. Safe mode (Smart Purge) is enabled. Proceed?')) {
      return;
    }

    setPurgingCDN(true);
    setPurgeStatus('idle');
    
    try {
      await cdnService.smartPurge();
      setPurgeStatus('success');
      setTimeout(() => {
        setPurgeStatus('idle');
        setPurgingCDN(false);
      }, 3000);
    } catch (err) {
       setPurgeStatus('error');
       alert('Smart CDN refresh failed. Please check network logs.');
       setPurgingCDN(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/40 border border-white/5 p-8 relative group overflow-hidden"
          >
            <div className={`absolute top-4 right-4 ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity`}>
              <stat.icon size={48} strokeWidth={1} />
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-4">{stat.label}</p>
            <p className={`text-4xl font-serif ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-zinc-900/30 border border-white/5 p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.3em] font-bold">System Health</h3>
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Operational
            </span>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-zinc-400">Firebase Edge Network</span>
              <span className="text-xs font-mono">12ms</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-zinc-400">Firestore Read Quota</span>
              <span className="text-xs font-mono">0.08% / Day</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-zinc-400">Media CDN Latency</span>
              <span className="text-xs font-mono">Synced</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 p-10 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-12 h-12 bg-reserve-accent/10 flex items-center justify-center border border-reserve-accent/20">
            <ArrowUpRight className="text-reserve-accent" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm uppercase tracking-[0.3em] font-bold">Quick Actions</h3>
            <p className="text-xs text-zinc-500 max-w-[280px]">Access the most common editorial tasks instantly from your terminal.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
               onClick={handleRestoreDemo}
               className="px-6 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-reserve-accent transition-colors"
            >
              Restore Demo Content
            </button>
            <button 
              disabled={clearingCache}
              onClick={handleClearCache}
              className="flex items-center gap-3 px-6 py-3 border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {clearingCache ? (
                <>
                  {cacheCleared ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Cache Cleared
                    </>
                  ) : (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Clearing Cache...
                    </>
                  )}
                </>
              ) : (
                'Clear Cache'
              )}
            </button>
            <button 
              disabled={purgingCDN}
              onClick={handlePurgeCDN}
              className="flex items-center gap-3 px-6 py-3 border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {purgingCDN ? (
                <>
                  {purgeStatus === 'success' ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      CDN Purged
                    </>
                  ) : (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Purging CDN...
                    </>
                  )}
                </>
              ) : (
                'Purge CDN Cache (Smart)'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
