import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Plus, 
  Search, 
  Trash2, 
  Star, 
  ExternalLink,
  Loader2,
  Calendar,
  X,
  Play,
  Filter
} from 'lucide-react';
import { videoService } from '../../services/videoService';
import { VideoInterview, VideoCategory } from '../../types';

const CATEGORIES: VideoCategory[] = [
  'Business Leaders',
  'Entrepreneurs',
  'Sports Icons',
  'Fashion & Lifestyle',
  'Tech & Innovation',
  'Culture & Arts',
  'Exclusive Interviews'
];

export default function VideoSection() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoInterview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<VideoCategory | 'All'>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Partial<VideoInterview>>({
    title: '',
    youtubeUrl: '',
    category: 'Exclusive Interviews',
    featured: false
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await videoService.getAllVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVideo.youtubeUrl || !currentVideo.category) return;

    setLoading(true);
    try {
      if (currentVideo.id) {
        await videoService.updateVideo(currentVideo.id, currentVideo);
      } else {
        await videoService.createVideo(currentVideo as Omit<VideoInterview, 'id' | 'createdAt'>);
      }
      setIsEditing(false);
      setCurrentVideo({ title: '', youtubeUrl: '', category: 'Exclusive Interviews', featured: false });
      await loadVideos();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!window.confirm('Remove this video interview?')) return;
    try {
      await videoService.deleteVideo(id);
      setVideos(videos.filter(v => v.id !== id));
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  const toggleFeatured = async (video: VideoInterview) => {
    try {
      await videoService.updateVideo(video.id!, { featured: !video.featured });
      setVideos(videos.map(v => v.id === video.id ? { ...v, featured: !v.featured } : v));
    } catch (err) {
      console.error('Toggle featured failed:', err);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif mb-2">Cinematic Media Registry</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Managing Video Interviews & Documentaries</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-reserve-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-white/5 py-3 pl-12 pr-6 rounded-sm text-xs focus:outline-none focus:border-reserve-accent/50 transition-all min-w-[280px]"
            />
          </div>

          <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
             <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-zinc-950 border border-white/5 py-3 pl-10 pr-6 rounded-sm text-xs focus:outline-none focus:border-reserve-accent/50 appearance-none min-w-[180px]"
            >
              <option value="All">ALL CATEGORIES</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => {
              setCurrentVideo({ title: '', youtubeUrl: '', category: 'Exclusive Interviews', featured: false });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-reserve-accent text-black px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform"
          >
            <Plus size={14} />
            New Interview
          </button>
        </div>
      </div>

      {loading && videos.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-zinc-600">
          <Loader2 className="animate-spin" />
          <span className="text-[10px] uppercase tracking-widest">Scanning Media Grid</span>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-20 text-center border border-white/5 bg-white/[0.01]">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">No media entries detected in this sector</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVideos.map(video => (
            <div 
              key={video.id}
              className="bg-white/[0.01] border border-white/5 p-6 group space-y-6"
            >
              <div className="aspect-video bg-zinc-900 relative grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden rounded-sm">
                <iframe 
                  src={getYoutubeEmbedUrl(video.youtubeUrl)}
                  className="w-full h-full pointer-events-none"
                  title={video.title}
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                  <Play size={40} className="text-white/20" />
                </div>
                {video.featured && (
                  <div className="absolute top-4 left-4 bg-reserve-accent text-black px-2 py-1 text-[8px] font-bold uppercase tracking-widest">
                    Featured
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] uppercase tracking-[0.3em] text-reserve-accent px-2 py-1 bg-reserve-accent/5 border border-reserve-accent/10 rounded-sm">
                    {video.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleFeatured(video)}
                      className={`p-2 transition-colors ${video.featured ? 'text-reserve-accent' : 'text-zinc-600 hover:text-white'}`}
                    >
                      <Star size={14} fill={video.featured ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentVideo(video);
                        setIsEditing(true);
                      }}
                      className="p-2 text-zinc-600 hover:text-white transition-colors"
                    >
                      <Video size={14} />
                    </button>
                    <button 
                      onClick={() => deleteVideo(video.id!)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-serif mb-2 line-clamp-1">{video.title || 'Untitled Interview'}</h4>
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600">
                  <Calendar size={12} />
                  {video.createdAt?.toDate ? new Date(video.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 p-10 md:p-16 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-8 right-8 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="mb-12">
                <span className="text-reserve-accent text-[10px] uppercase tracking-[0.4em] mb-2 block">Media Editor</span>
                <h3 className="text-4xl font-serif">{currentVideo.id ? 'Refine Media' : 'Provision Media'}</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4 group">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Video Title (Optional)</label>
                  <input 
                    type="text" 
                    value={currentVideo.title}
                    onChange={(e) => setCurrentVideo({...currentVideo, title: e.target.value})}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                    placeholder="e.g. EMERALD DREAMS: EPISODE 04"
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">YouTube Registry URL (Required)</label>
                  <input 
                    required
                    type="url" 
                    value={currentVideo.youtubeUrl}
                    onChange={(e) => setCurrentVideo({...currentVideo, youtubeUrl: e.target.value})}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 group-focus-within:text-reserve-accent transition-colors">Classification Category</label>
                  <select 
                    required
                    value={currentVideo.category}
                    onChange={(e) => setCurrentVideo({...currentVideo, category: e.target.value as VideoCategory})}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-reserve-accent transition-colors text-white appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-zinc-950">{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setCurrentVideo({...currentVideo, featured: !currentVideo.featured})}
                    className={`flex items-center gap-3 px-6 py-3 border transition-all text-[10px] uppercase tracking-widest ${
                      currentVideo.featured 
                        ? 'border-reserve-accent bg-reserve-accent text-black font-bold' 
                        : 'border-white/10 text-zinc-500 hover:bg-white/5'
                    }`}
                  >
                    <Star size={14} fill={currentVideo.featured ? 'black' : 'none'} />
                    {currentVideo.featured ? 'Featured on Home' : 'Promote to Home?'}
                  </button>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white text-black py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-reserve-accent transition-colors flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : currentVideo.id ? 'SYNC TO REGISTRY' : 'STAMP INTO ARCHIVE'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-transparent border border-white/10 text-white py-5 text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 transition-colors"
                  >
                    ABORT OPERATION
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
