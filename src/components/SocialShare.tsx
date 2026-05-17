import React, { useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail, 
  Share2, 
  Check, 
  Copy,
  Send
} from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  className?: string;
}

export default function SocialShare({ url, title, className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-[#1877F2]'
    },
    {
      name: 'X',
      icon: <Twitter size={18} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-[#0A66C2]'
    },
    {
      name: 'Pinterest',
      icon: <Send size={18} />, // Using Send as a placeholder for Pinterest/Generic
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}`,
      color: 'hover:text-[#BD081C]'
    },
    {
      name: 'Email',
      icon: <Mail size={18} />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'hover:text-reserve-accent'
    }
  ];

  return (
    <div className={`py-12 border-t border-white/5 ${className}`}>
      <div className="flex flex-col items-center gap-8">
        <div className="space-y-2 text-center">
          <h3 className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Share This Post</h3>
          <div className="h-px w-12 bg-reserve-accent/30 mx-auto" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 text-zinc-600 transition-all duration-300 hover:scale-110 ${link.color}`}
              aria-label={`Share on ${link.name}`}
            >
              {link.icon}
            </a>
          ))}

          {/* Instagram / Threads Copy Link Implementation */}
          <button
            onClick={handleCopyLink}
            className={`p-3 text-zinc-600 transition-all duration-300 hover:scale-110 hover:text-reserve-accent flex items-center gap-2 group relative`}
            title="Copy link for Instagram/Threads"
          >
            <div className="relative">
              {copied ? <Check size={18} className="text-emerald-500" /> : <Instagram size={18} />}
            </div>
            {copied && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-reserve-accent text-black text-[9px] uppercase tracking-widest font-black py-1 px-3 rounded-none whitespace-nowrap animate-in fade-in zoom-in slide-in-from-bottom-2">
                Link Copied
              </span>
            )}
          </button>
          
          <button
            onClick={handleCopyLink}
            className={`p-3 text-zinc-600 transition-all duration-300 hover:scale-110 hover:text-white group relative`}
            title="Copy link to clipboard"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
