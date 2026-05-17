import React, { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { mediaService } from '../../services/mediaService';

import { auth } from '../../lib/firebase';

interface ImageUploadFormProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  storagePath?: 'articles' | 'settings' | 'seo';
  aspectRatio?: string;
}

export default function ImageUploadForm({ 
  label, 
  value, 
  onChange, 
  storagePath = 'articles',
  aspectRatio = 'aspect-[16/9]'
}: ImageUploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(!value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser) {
      setError('You must be signed in to upload images.');
      return;
    }

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image.');
      return;
    }

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      console.log('Initiating file upload for:', file.name);
      const downloadUrl = await mediaService.uploadFile(file, storagePath, (p) => {
        const roundedProgress = Math.round(p);
        setProgress(roundedProgress);
        console.log(`Component progress check: ${roundedProgress}%`);
      });
      
      console.log('Upload successful, URL:', downloadUrl);
      onChange(downloadUrl);
      setPreviewUrl(downloadUrl);
      setProgress(100);
      setError(null);
    } catch (err: any) {
      console.error('Upload component error catch:', err);
      const errorMessage = err?.message || 'Upload failed. Please check your storage rules and connection.';
      setError(errorMessage);
      
      // Revert preview to original value if upload failed
      setPreviewUrl(value || null);
      setProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label}</label>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowUrlInput(false)}
            className={`text-[9px] uppercase tracking-wider transition-colors ${!showUrlInput ? 'text-reserve-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Upload
          </button>
          <span className="text-zinc-800 text-[10px]">/</span>
          <button 
            type="button"
            onClick={() => setShowUrlInput(true)}
            className={`text-[9px] uppercase tracking-wider transition-colors ${showUrlInput ? 'text-reserve-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            External URL
          </button>
        </div>
      </div>

      <div className={`relative ${aspectRatio} bg-zinc-950 border border-white/5 overflow-hidden group`}>
        {previewUrl ? (
          <>
            <img src={previewUrl || undefined} className="w-full h-full object-cover transition-opacity duration-300" alt="Preview" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black p-2 rounded-full hover:bg-reserve-accent transition-colors"
                title="Replace Image"
              >
                <Upload size={16} />
              </button>
              <button 
                type="button"
                onClick={handleRemove}
                className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors"
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-reserve-accent animate-spin" />
                <div className="w-32 bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-reserve-accent h-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-reserve-accent font-bold">Uploading {progress}%</span>
              </div>
            )}
          </>
        ) : (
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-reserve-accent group-hover:text-black transition-all">
              {uploading ? <Loader2 className="animate-spin text-reserve-accent" /> : <Upload size={24} className="text-zinc-500 group-hover:text-black" />}
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Pick from device</p>
              <p className="text-[8px] uppercase tracking-widest text-zinc-700 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-3 focus-within:border-reserve-accent transition-all animate-in slide-in-from-top-2">
          <LinkIcon size={14} className="text-zinc-600" />
          <input 
            type="text"
            placeholder="Paste direct image link (https://...)"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            className="flex-1 bg-transparent border-none p-0 text-xs font-mono focus:ring-0 text-white placeholder:text-zinc-700"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-500 bg-rose-500/5 border border-rose-500/10 p-3 rounded-sm animate-in fade-in">
          <AlertCircle size={14} />
          <span className="text-[10px] uppercase tracking-widest">{error}</span>
        </div>
      )}

      {value && !uploading && !error && value.startsWith('https://firebasestorage') && (
        <div className="flex items-center gap-2 text-emerald-500 text-[9px] uppercase tracking-widest">
          <CheckCircle2 size={12} />
          <span>Secured in registry archive</span>
        </div>
      )}

      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
