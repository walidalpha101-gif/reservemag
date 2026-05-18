import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Users, 
  Loader2, 
  AlertCircle,
  Image as ImageIcon,
  Camera,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Author } from '../../types';
import { authorService } from '../../services/authorService';
import { mediaService } from '../../services/mediaService';

export default function AuthorsSection() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Author, 'id' | 'createdAt'>>({
    name: '',
    designation: '',
    role: '',
    imageUrl: '',
    active: true
  });

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    setLoading(true);
    const data = await authorService.getAllAuthors();
    setAuthors(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await mediaService.uploadAuthorImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await authorService.updateAuthor(editingId, formData);
      } else {
        await authorService.createAuthor(formData);
      }
      resetForm();
      await loadAuthors();
    } catch (err) {
      setError('Failed to save author');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingId(author.id || null);
    setFormData({
      name: author.name,
      designation: author.designation,
      role: author.role,
      imageUrl: author.imageUrl || '',
      active: author.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete author "${name}"? Stories will lose their associated profile card.`)) return;

    try {
      await authorService.deleteAuthor(id);
      await loadAuthors();
    } catch (err) {
      setError('Failed to delete author');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      role: '',
      imageUrl: '',
      active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-reserve-accent/10 p-2 rounded-sm">
              <Users className="text-reserve-accent" size={18} />
            </div>
            <h2 className="text-2xl font-serif text-white uppercase tracking-wider">Editorial Roster</h2>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Manage the contributors and resident authors</p>
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 bg-white hover:bg-reserve-accent text-black px-6 py-3 transition-all duration-300"
          >
            <Plus size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">New Author</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 flex items-start gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div className="space-y-1">
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Error</p>
            <p className="text-zinc-400 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-zinc-600 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/5 p-8 space-y-8"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-white">
              {editingId ? 'Edit Profile' : 'Configure New Author'}
            </h3>
            <button onClick={resetForm} className="text-zinc-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Profile Image</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-900 border border-white/10 relative group">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="text-[10px] text-zinc-600">
                    {uploading ? (
                      <div className="flex items-center gap-2 text-reserve-accent">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <p>Recommended: 400x400px JPEG/PNG</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Display Name</label>
                <input 
                   type="text"
                   value={formData.name}
                   onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:border-reserve-accent outline-none"
                   required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Designation</label>
                  <input 
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:border-reserve-accent outline-none"
                    placeholder="e.g. Senior Editor"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Role/Beat</label>
                  <input 
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:border-reserve-accent outline-none"
                    placeholder="e.g. Fashion & Art"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-sm border border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white">Active Status</p>
                  <p className="text-[9px] text-zinc-500">Enable for use in story editor</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`transition-colors ${formData.active ? 'text-emerald-500' : 'text-zinc-600'}`}
                >
                  {formData.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  disabled={loading || !formData.name}
                  className="flex items-center gap-3 bg-white hover:bg-reserve-accent text-black px-6 py-3 transition-all duration-300 disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    {editingId ? 'Update Profile' : 'Confirm Author'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {loading && !showForm ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-reserve-accent" size={32} />
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Retrieving ledger...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {authors.map((author) => (
              <motion.div 
                key={author.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-zinc-950 border p-6 group transition-colors relative ${author.active ? 'border-white/5 hover:border-white/10' : 'border-red-900/20 opacity-50 grayscale'}`}
              >
                {!author.active && (
                  <div className="absolute top-4 right-4 bg-red-950 text-red-400 text-[8px] uppercase tracking-widest px-2 py-0.5 border border-red-500/20">
                    Inactive
                  </div>
                )}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10">
                    {author.imageUrl ? (
                      <img src={author.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                        <Users size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white text-xs uppercase tracking-[0.2em] font-serif">{author.name}</h4>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{author.designation}</p>
                    <p className="text-[9px] text-reserve-accent uppercase tracking-widest mt-0.5">{author.role}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(author)}
                      className="p-2 text-zinc-500 hover:text-white"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(author.id!, author.name)}
                      className="p-2 text-zinc-500 hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
