import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layers, 
  Loader2, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryDoc {
  id: string;
  name: string;
  createdAt?: any;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryDoc[];
      setCategories(cats);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAdding(true);
    setError(null);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        createdAt: serverTimestamp()
      });
      setNewCategoryName('');
    } catch (err: any) {
      console.error("Error adding category:", err);
      setError(err.message || "Failed to add category.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"? Existing stories will retain this name as text.`)) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category.");
    }
  };

  const handleStartEdit = (cat: CategoryDoc) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    try {
      await updateDoc(doc(db, 'categories', id), {
        name: editName.trim()
      });
      setEditingId(null);
    } catch (err: any) {
      console.error("Error updating category:", err);
      setError("Failed to update category.");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-reserve-accent/10 p-2 rounded-sm">
              <Layers className="text-reserve-accent" size={18} />
            </div>
            <h2 className="text-2xl font-serif text-white uppercase tracking-wider">Category Management</h2>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Curate and classify editorial content streams</p>
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-4">
          <input 
            type="text"
            placeholder="New Category Name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="bg-zinc-900 border border-white/10 px-6 py-3 text-xs text-white focus:outline-none focus:border-reserve-accent w-64"
          />
          <button 
            type="submit"
            disabled={adding || !newCategoryName.trim()}
            className="flex items-center gap-3 bg-white hover:bg-reserve-accent text-black px-6 py-3 transition-all duration-300 disabled:opacity-50"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span className="text-[10px] uppercase tracking-widest font-bold">Add Category</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div className="space-y-1">
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Operation Failed</p>
            <p className="text-zinc-400 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-zinc-600 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 border border-white/5 bg-zinc-900/10">
          <Loader2 className="animate-spin text-reserve-accent" size={32} />
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Synchronizing database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-950 border border-white/5 p-6 group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                          className="bg-black border border-reserve-accent/50 p-2 text-xs text-white focus:outline-none w-full"
                        />
                        <button 
                          onClick={() => handleUpdate(category.id)}
                          className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h3 className="text-sm font-serif text-white uppercase tracking-widest group-hover:text-reserve-accent transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
                          {category.createdAt?.toDate ? category.createdAt.toDate().toLocaleDateString() : 'System Default'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {editingId !== category.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => handleStartEdit(category)}
                         className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {categories.length === 0 && !loading && (
            <div className="col-span-full border border-dashed border-white/5 py-12 flex flex-col items-center justify-center gap-4 text-zinc-600">
              <AlertTriangle size={24} className="text-zinc-800" />
              <p className="text-[10px] uppercase tracking-widest">No custom categories defined</p>
            </div>
          )}
        </div>
      )}

      <div className="pt-12 border-t border-white/5">
        <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-sm flex gap-4">
          <AlertTriangle className="text-amber-500/50 shrink-0" size={20} />
          <div className="space-y-2">
             <h4 className="text-[10px] uppercase tracking-widest font-black text-amber-500/80">Safety & Integrity Rules</h4>
             <p className="text-[11px] text-zinc-400 leading-relaxed max-w-2xl">
               Deleting a category does not automatically update or delete stories assigned to it. 
               The story will retain its existing category text until manually re-assigned. 
               It is recommended to re-classify stories before removing a primary category.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
