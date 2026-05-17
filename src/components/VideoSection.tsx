import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Loader2, Filter } from 'lucide-react';
import { videoService } from '../services/videoService';
import { VideoInterview, VideoCategory } from '../types';

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
  const [activeCategory, setActiveCategory] = useState<VideoCategory | 'All'>('All');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const data = await videoService.getAllVideos();
        setVideos(data);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const getYoutubeThumbnail = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const filteredVideos = videos.filter(v => activeCategory === 'All' || v.category === activeCategory);

  if (loading) {
    return (
      <section className="py-32 bg-zinc-950 border-y border-reserve-border">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center text-zinc-600 gap-4">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-[10px] uppercase tracking-widest">Opening Cinematic Archive</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-32 bg-zinc-950 border-y border-reserve-border">
        <div className="container mx-auto px-6 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mb-4 block italic">Archive Status: Offline</span>
          <h3 className="text-4xl font-serif text-white/20">Video interviews coming soon</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-zinc-950 border-y border-reserve-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 border-b border-white/5 pb-10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.4em] text-reserve-accent mb-4 block">Cinematic</span>
            <h3 className="text-5xl md:text-7xl font-serif">Registry<span className="text-reserve-accent">_</span>Interviews</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-4 custom-scrollbar">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 text-[9px] uppercase tracking-widest border transition-all ${
                activeCategory === 'All' 
                  ? 'border-white text-white' 
                  : 'border-white/5 text-zinc-600 hover:border-white/20'
              }`}
            >
              All Registry
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[9px] uppercase tracking-widest border transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'border-white text-white' 
                    : 'border-white/5 text-zinc-600 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {filteredVideos.map((video) => (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="aspect-video overflow-hidden relative mb-10 grayscale hover:grayscale-0 transition-all duration-1000 border border-white/5">
                <AnimatePresence mode="wait">
                  {playingVideoId === video.id ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-10"
                    >
                      <iframe 
                        src={getYoutubeEmbedUrl(video.youtubeUrl)}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        title={video.title}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={getYoutubeThumbnail(video.youtubeUrl)} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" 
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all duration-700 flex items-center justify-center">
                        <button 
                          onClick={() => setPlayingVideoId(video.id!)}
                          className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-reserve-accent/10 transition-all duration-700 relative overflow-hidden"
                        >
                          <Play className="text-white ml-2 transition-transform group-hover:scale-110" fill="white" size={36} />
                          <div className="absolute inset-0 border border-reserve-accent/0 group-hover:border-reserve-accent/50 rounded-full animate-ping" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {video.featured && (
                  <div className="absolute top-8 left-8 z-20">
                    <span className="bg-reserve-accent text-black px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em]">
                      Featured Narrative
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-8 right-8 z-20">
                  <div className="bg-black/80 px-4 py-2 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] tracking-[0.4em] uppercase text-zinc-400">Exclusive Record</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-reserve-accent font-bold px-3 py-1 bg-reserve-accent/5 inline-block">
                    {video.category}
                  </span>
                </div>
                <h4 className="text-4xl md:text-5xl font-serif tracking-tight leading-none group-hover:text-reserve-accent transition-all duration-500">
                  {video.title}
                </h4>
                <div className="h-px w-20 bg-reserve-accent/30 group-hover:w-full transition-all duration-1000" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
