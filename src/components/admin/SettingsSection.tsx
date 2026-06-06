import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Link as LinkIcon, 
  Save, 
  Info, 
  MousePointerClick, 
  Layout, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { settingsService } from '../../services/settingsService';
import { mediaService } from '../../services/mediaService';
import { SITE_SETTINGS_DEFAULTS } from '../../lib/schemas';
import ImageUploadForm from './ImageUploadForm';

export default function SettingsSection() {
  const [settings, setSettings] = useState<SiteSettings>(SITE_SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const FOOTER_LABELS = [
    'Navigation',
    'Digital Archive',
    'Editorial Policy',
    'Private Ledger',
    'Editorial Board',
    'Advertising',
    'Legal'
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await settingsService.getSiteSettings();
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSiteSettings(settings);
      alert('Registry settings updated and synced globally.');
    } finally {
      setSaving(false);
    }
  };

  const updateFooterUrl = (label: string, url: string) => {
    setSettings({
      ...settings,
      footerUrls: { ...settings.footerUrls, [label]: url }
    });
  };

  const updateSocialUrl = (platform: 'facebook' | 'instagram', url: string) => {
    setSettings({
      ...settings,
      socialUrls: { ...settings.socialUrls, [platform]: url }
    });
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFavicon(true);
    try {
      const url = await mediaService.uploadSettingsImage(file);
      setSettings({ ...settings, faviconUrl: url });
    } catch (error) {
      console.error("Favicon Upload Failed:", error);
    } finally {
      setUploadingFavicon(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-reserve-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h2 className="text-xl font-serif">Registry Settings</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Global site parameters and UI configuration</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black px-10 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-reserve-accent transition-all flex items-center gap-2 active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          {saving ? 'UPDATING...' : 'COMMIT ALL CHANGES'}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
        <div className="space-y-8">
          <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-reserve-accent flex items-center gap-3">
              <Globe size={14} /> Core Identity
            </h3>
            
            <div className="space-y-6">
              <ImageUploadForm 
                label="Site Logo (SVG or PNG)"
                value={settings.logoUrl || ''}
                onChange={(url) => setSettings({ ...settings, logoUrl: url })}
                storagePath="settings"
                aspectRatio="aspect-square max-w-[200px]"
              />
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Publication Title</label>
                <input 
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full bg-black border border-white/10 p-4 text-sm focus:outline-none focus:border-reserve-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Browser Tab Title (SEO)</label>
                <input 
                  type="text"
                  value={settings.browserTitle || ''}
                  onChange={(e) => setSettings({ ...settings, browserTitle: e.target.value })}
                  className="w-full bg-black border border-white/10 p-4 text-sm focus:outline-none focus:border-reserve-accent"
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Site Favicon</label>
                <div className="flex items-center gap-8">
                  {settings.faviconUrl ? (
                    <img src={settings.faviconUrl} alt="Favicon" className="w-12 h-12 rounded-sm bg-white/5 object-contain border border-white/10 p-2" />
                  ) : (
                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <label className="px-6 py-2 border border-white/10 text-[9px] uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors">
                    {uploadingFavicon ? '...' : 'Upload Icon'}
                    <input type="file" className="hidden" accept=".ico,.png,.svg" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-reserve-accent flex items-center gap-3">
              <MousePointerClick size={14} /> Global CTA Control
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Button Text</label>
                  <input 
                    type="text"
                    value={settings.ctaButton.text}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      ctaButton: { ...settings.ctaButton, text: e.target.value } 
                    })}
                    className="w-full bg-black border border-white/10 p-4 text-sm focus:outline-none focus:border-reserve-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Redirect URL</label>
                  <input 
                    type="text"
                    value={settings.ctaButton.url}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      ctaButton: { ...settings.ctaButton, url: e.target.value } 
                    })}
                    className="w-full bg-black border border-white/10 p-4 text-sm font-mono focus:outline-none focus:border-reserve-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-reserve-accent flex items-center gap-3">
              <Layout size={14} /> Social Connectivity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Facebook URL</label>
                <input 
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={settings.socialUrls.facebook}
                  onChange={(e) => updateSocialUrl('facebook', e.target.value)}
                  className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:outline-none focus:border-reserve-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Instagram URL</label>
                <input 
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={settings.socialUrls.instagram}
                  onChange={(e) => updateSocialUrl('instagram', e.target.value)}
                  className="w-full bg-black border border-white/10 p-4 text-xs font-mono focus:outline-none focus:border-reserve-accent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-reserve-accent flex items-center gap-3">
                <Layout size={14} /> Footer Registry (URL Edit)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {FOOTER_LABELS.map((label) => (
                <div key={label} className="group bg-black/40 border border-white/5 p-4 flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{label}</span>
                  <div className="flex items-center gap-3">
                    <LinkIcon size={12} className="text-zinc-600" />
                    <input 
                      type="text"
                      placeholder="URL destination"
                      value={settings.footerUrls[label] || ''}
                      onChange={(e) => updateFooterUrl(label, e.target.value)}
                      className="flex-1 bg-transparent border-none p-0 text-[11px] font-mono focus:ring-0 focus:text-reserve-accent transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-reserve-accent/5 border border-reserve-accent/20 p-8 space-y-4">
             <div className="flex items-center gap-3 text-reserve-accent">
               <Info size={18} />
               <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold">System Integrity</h4>
             </div>
             <p className="text-xs text-zinc-400 leading-relaxed">
               Structure is enforced. Social icons are limited to Facebook and Instagram. Footer labels are immutable to preserve layout hierarchy.
             </p>
          </div>
        </div>
      </form>
    </div>
  );
}
