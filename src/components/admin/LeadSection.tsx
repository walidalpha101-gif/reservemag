import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Instagram,
  Globe,
  Mail,
  Loader2,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { leadService } from '../../services/leadService';
import { FeaturedRequest, FeaturedRequestStatus } from '../../types';

export default function LeadSection() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FeaturedRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeaturedRequestStatus | 'All'>('All');
  const [selectedRequest, setSelectedRequest] = useState<FeaturedRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await leadService.getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load editorial requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: FeaturedRequestStatus) => {
    try {
      await leadService.updateRequestStatus(id, status);
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!window.confirm('Archive this request permanently?')) return;
    try {
      await leadService.deleteRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      setSelectedRequest(null);
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.whatsapp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: FeaturedRequestStatus) => {
    switch (status) {
      case 'New': return 'text-reserve-accent bg-reserve-accent/10';
      case 'Contacted': return 'text-blue-400 bg-blue-400/10';
      case 'Closed': return 'text-zinc-500 bg-zinc-500/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif mb-2">Editorial Consideration Archive</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Managing Luxury Partnerships & Feature Applications</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-reserve-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter by brand or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-white/5 py-3 pl-12 pr-6 rounded-sm text-xs focus:outline-none focus:border-reserve-accent/50 transition-all min-w-[280px]"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-950 border border-white/5 py-3 px-6 rounded-sm text-xs focus:outline-none focus:border-reserve-accent/50 appearance-none min-w-[140px]"
          >
            <option value="All">ALL STATUS</option>
            <option value="New">NEW</option>
            <option value="Contacted">CONTACTED</option>
            <option value="Closed">CLOSED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-zinc-600">
              <Loader2 className="animate-spin" />
              <span className="text-[10px] uppercase tracking-widest">Retrieving Submissions</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">No requests found</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <button
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`w-full text-left p-6 border transition-all duration-300 relative group ${
                  selectedRequest?.id === request.id 
                    ? 'bg-reserve-accent/5 border-reserve-accent/30' 
                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">
                    {request.createdAt?.toDate ? new Date(request.createdAt.toDate()).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1 line-clamp-1 group-hover:text-reserve-accent transition-colors">
                  {request.brand || request.name}
                </h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{request.industry}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedRequest ? (
              <motion.div
                key={selectedRequest.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/[0.01] border border-white/5 p-10 md:p-12 space-y-12"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/5">
                  <div className="space-y-4">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-sm ${getStatusColor(selectedRequest.status)}`}>
                      Editorial Status: {selectedRequest.status}
                    </span>
                    <h3 className="text-3xl font-serif">{selectedRequest.brand}</h3>
                    <p className="text-zinc-500 text-sm italic">Application by {selectedRequest.name}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <select 
                        value={selectedRequest.status}
                        onChange={(e) => updateStatus(selectedRequest.id!, e.target.value as FeaturedRequestStatus)}
                        className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-sm text-[10px] uppercase tracking-widest appearance-none pr-10 focus:outline-none focus:border-reserve-accent/50"
                      >
                        <option value="New">MARK AS NEW</option>
                        <option value="Contacted">MARK AS CONTACTED</option>
                        <option value="Closed">MARK AS CLOSED</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    </div>
                    <button 
                      onClick={() => deleteRequest(selectedRequest.id!)}
                      className="p-3 border border-white/10 text-zinc-600 hover:text-red-500 hover:border-red-500/30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                        <Briefcase size={12} className="text-reserve-accent" /> Professional Scope
                      </p>
                      <p className="text-sm border-l border-reserve-accent/30 pl-4 py-1">{selectedRequest.industry || 'Not provided'}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                        <Clock size={12} className="text-reserve-accent" /> Investment Profile
                      </p>
                      <p className="text-sm border-l border-reserve-accent/30 pl-4 py-1 font-serif text-lg">{selectedRequest.budget || 'Not provided'}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                        <Mail size={12} className="text-reserve-accent" /> Email Outreach
                      </p>
                      <p className="text-sm border-l border-reserve-accent/30 pl-4 py-1 font-mono">{selectedRequest.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600">Engagement Channels</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-reserve-accent group p-2 bg-reserve-accent/5 border border-reserve-accent/10 rounded-sm">
                        <div className="w-8 h-8 flex items-center justify-center rounded-sm">
                          <Globe size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest opacity-60">WhatsApp (Required)</span>
                          <span className="font-bold tracking-wider">{selectedRequest.whatsapp}</span>
                        </div>
                      </div>

                      {selectedRequest.instagramUrl && (
                        <a 
                          href={selectedRequest.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 text-xs text-zinc-400 hover:text-reserve-accent transition-colors group"
                        >
                          <div className="w-8 h-8 bg-white/[0.03] flex items-center justify-center rounded-sm group-hover:bg-reserve-accent/10 transition-colors">
                            <Instagram size={14} />
                          </div>
                          Instagram Profile
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {selectedRequest.facebookUrl && (
                        <a 
                          href={selectedRequest.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 text-xs text-zinc-400 hover:text-reserve-accent transition-colors group"
                        >
                          <div className="w-8 h-8 bg-white/[0.03] flex items-center justify-center rounded-sm group-hover:bg-reserve-accent/10 transition-colors">
                            <Globe size={14} />
                          </div>
                          Facebook Profile
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {selectedRequest.linkedinUrl && (
                        <a 
                          href={selectedRequest.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 text-xs text-zinc-400 hover:text-reserve-accent transition-colors group"
                        >
                          <div className="w-8 h-8 bg-white/[0.03] flex items-center justify-center rounded-sm group-hover:bg-reserve-accent/10 transition-colors">
                            <Briefcase size={14} />
                          </div>
                          LinkedIn Profile
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-sm">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                     Editorial Intent & Message
                  </p>
                  <p className="text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.message}
                  </p>
                </div>

                <div className="pt-8 flex items-center justify-between text-zinc-600">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
                    <Calendar size={12} />
                    Received: {selectedRequest.createdAt?.toDate ? selectedRequest.createdAt.toDate().toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] italic">
                    CONFIDENTIAL EDITORIAL DATA
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border border-dashed border-white/5 bg-zinc-950/20 flex flex-col items-center justify-center gap-6 text-zinc-700">
                <Briefcase size={60} strokeWidth={0.5} />
                <p className="text-[10px] uppercase tracking-[0.3em]">Select a request for consideration</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
