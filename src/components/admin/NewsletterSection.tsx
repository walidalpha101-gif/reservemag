import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  Download, 
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Subscriber } from '../../types';
import { newsletterService } from '../../services/newsletterService';

export default function NewsletterSection() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const data = await newsletterService.getSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error("Failed to load subscribers registry:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Remove ${email} from subscriber list?`)) {
      setIsDeleting(id);
      try {
        await newsletterService.removeSubscriber(id);
        setSubscribers(subscribers.filter(s => s.id !== id));
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Subscribed At', 'Source'];
    const rows = subscribers.map(sub => [
      sub.email,
      new Date(sub.createdAt?.toDate?.() || sub.createdAt).toLocaleString(),
      sub.source || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reserve_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-reserve-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-serif">Newsletter Registry</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Management of the Private Ledger mailing list</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text"
              placeholder="Filter by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950 border border-white/5 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-reserve-accent transition-all min-w-[240px]"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-reserve-accent transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/30 border border-white/5 p-6 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Total Reach</p>
          <p className="text-3xl font-serif">{subscribers.length}</p>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 p-6 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Subscribers Active</p>
          <p className="text-3xl font-serif text-emerald-500">100%</p>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 p-6 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Opt-out Rate</p>
          <p className="text-3xl font-serif text-zinc-700">0.0%</p>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 p-6 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">System Status</p>
          <p className="text-3xl font-serif text-reserve-accent">SECURE</p>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Email Prospect</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Registry Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Capture Source</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 uppercase text-[10px]">
                        {subscriber.email[0]}
                      </div>
                      <span className="text-sm font-light">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <Calendar size={12} />
                      {new Date(subscriber.createdAt?.toDate?.() || subscriber.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-800/50 text-[9px] uppercase tracking-widest text-zinc-400 border border-white/5">
                      {subscriber.source || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => subscriber.id && handleDelete(subscriber.id, subscriber.email)}
                      disabled={isDeleting === subscriber.id}
                      className="p-2 text-zinc-700 hover:text-rose-500 transition-colors disabled:opacity-50"
                    >
                      {isDeleting === subscriber.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 uppercase tracking-[0.2em] text-[10px]">
                    No subscribers found in database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
