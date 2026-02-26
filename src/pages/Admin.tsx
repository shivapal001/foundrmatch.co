import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { Profile, WaitlistEntry, Match, Stats, TeamRequest, Review, ContactMessage } from '../types';
import { Search, Filter, Plus, Trash2, Check, X, ExternalLink, MapPin, Mail, Phone, Linkedin, MessageSquare, Briefcase, Star } from 'lucide-react';

interface AdminProps {
  onNavigate: (page: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Admin: React.FC<AdminProps> = ({ onNavigate, showToast }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'profiles' | 'matches' | 'waitlist' | 'teamRequests' | 'reviews' | 'contacts'>('profiles');
  const [stats, setStats] = useState<Stats>({ profiles: 0, matches: 0, connections: 0, teamRequests: 0 });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [commitFilter, setCommitFilter] = useState('');
  
  const [matchMode, setMatchMode] = useState(false);
  const [selectedForMatch, setSelectedForMatch] = useState<Profile[]>([]);
  const [matchNotes, setMatchNotes] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    try {
      const [s, p, m, w, t, r, c] = await Promise.allSettled([
        api.getStats(true),
        api.getProfiles(),
        api.getMatches(),
        api.getWaitlist(),
        api.getTeamRequests(),
        api.getReviews(false),
        api.getContactMessages()
      ]);
      
      if (s.status === 'fulfilled') setStats(s.value);
      if (p.status === 'fulfilled') setProfiles(p.value);
      if (m.status === 'fulfilled') setMatches(m.value);
      if (w.status === 'fulfilled') setWaitlist(w.value);
      if (t.status === 'fulfilled') setTeamRequests(t.value);
      if (r.status === 'fulfilled') setReviews(r.value);
      if (c.status === 'fulfilled') setContacts(c.value);

      const rejected = [s, p, m, w, t, r, c].filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        console.error("Some data failed to load:", rejected);
        showToast('Some data could not be loaded due to permissions', 'error');
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast('Failed to load admin data', 'error');
    }
  };

  const handleLogin = async () => {
    const success = await api.adminLogin(password);
    if (success) {
      setIsLoggedIn(true);
    } else {
      showToast('Invalid password', 'error');
      setPassword('');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (confirm('Delete this profile?')) {
      await api.deleteProfile(id);
      fetchData();
      showToast('Profile deleted', 'error');
    }
  };

  const handleDeleteWaitlist = async (id: string) => {
    if (confirm('Remove from waitlist?')) {
      await api.deleteWaitlist(id);
      fetchData();
      showToast('Entry removed', 'error');
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (confirm('Delete this match?')) {
      await api.deleteMatch(id);
      fetchData();
      showToast('Match deleted', 'error');
    }
  };

  const handleDeleteTeamRequest = async (id: string) => {
    if (confirm('Delete this team request?')) {
      await api.deleteTeamRequest(id);
      fetchData();
      showToast('Request deleted', 'error');
    }
  };

  const handleApproveReview = async (id: string) => {
    await api.approveReview(id);
    fetchData();
    showToast('Review approved', 'success');
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Delete this review?')) {
      await api.deleteReview(id);
      fetchData();
      showToast('Review deleted', 'error');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Delete this contact message?')) {
      await api.deleteContactMessage(id);
      fetchData();
      showToast('Message deleted', 'error');
    }
  };

  const handleUpdateMatchStatus = async (id: string, status: string) => {
    await api.updateMatchStatus(id, status);
    fetchData();
    showToast(`Status updated to ${status}`, 'success');
  };

  const toggleSelectForMatch = (p: Profile) => {
    if (selectedForMatch.find(s => s.id === p.id)) {
      setSelectedForMatch(selectedForMatch.filter(s => s.id !== p.id));
    } else {
      if (selectedForMatch.length >= 2) {
        showToast('Select only 2 profiles', 'error');
        return;
      }
      setSelectedForMatch([...selectedForMatch, p]);
    }
  };

  const handleCreateMatch = async () => {
    if (selectedForMatch.length !== 2) return;
    await api.createMatch(selectedForMatch[0].id, selectedForMatch[1].id, matchNotes);
    setMatchMode(false);
    setSelectedForMatch([]);
    setMatchNotes('');
    setShowMatchModal(false);
    fetchData();
    showToast('Match created! 🎉', 'success');
  };

  const filteredProfiles = profiles.filter(p => {
    const matchSearch = !search || [p.name, p.bio, ...p.skills].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || p.role === roleFilter;
    const matchCommit = !commitFilter || p.commitment === commitFilter;
    return matchSearch && matchRole && matchCommit;
  });

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black z-[9998] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-border-custom p-12 max-w-[400px] w-full text-center"
        >
          <div className="text-3xl opacity-30 mb-6">⌗</div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight mb-2 text-lowercase">admin access</h2>
          <p className="text-gray-custom text-[0.88rem] mb-8 font-light">Enter password to access the admin panel</p>
          <div className="mb-4">
            <input
              type="password"
              placeholder="password"
              className="w-full bg-black border border-border-custom px-4 py-3 text-center outline-none focus:border-white transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-lowercase mb-2"
          >
            enter panel
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="w-full py-3 border border-border-custom text-white font-bold hover:border-white transition-colors text-lowercase"
          >
            cancel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-black px-6 lg:px-16 pb-20">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 pb-8 border-b border-border-custom gap-6">
          <div>
            <div className="text-[0.7rem] text-gray-custom tracking-[2px] uppercase mb-1.5 font-semibold">Admin Panel</div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-lowercase">FoundrMatch Dashboard</h1>
          </div>
          <button
            onClick={() => onNavigate('landing')}
            className="px-5 py-2.5 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
          >
            ← back to site
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border-custom border border-border-custom mb-10">
          {[
            { label: 'Total Profiles', val: stats.profiles, icon: '👤' },
            { label: 'Total Matches', val: stats.matches, icon: '🤝' },
            { label: 'Connected', val: stats.connections, icon: '✅' },
            { label: 'Team Requests', val: stats.teamRequests, icon: '💼' },
            { label: 'Waitlist', val: waitlist.length, icon: '📋' },
          ].map((s, i) => (
            <div key={i} className="bg-black p-8">
              <div className="text-2xl mb-3 opacity-50">{s.icon}</div>
              <div className="font-display text-3xl font-extrabold tracking-tighter">{s.val}</div>
              <div className="text-[0.75rem] text-gray-custom mt-1 uppercase tracking-widest font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border border-border-custom mb-10 w-full sm:w-fit overflow-x-auto no-scrollbar">
          {(['profiles', 'matches', 'waitlist', 'teamRequests', 'reviews', 'contacts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-[0.82rem] transition-colors text-lowercase border-r last:border-r-0 border-border-custom whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-black font-bold' : 'text-gray-custom hover:text-white'
              }`}
            >
              {tab === 'teamRequests' ? 'team requests' : tab === 'contacts' ? 'messages' : tab}
            </button>
          ))}
        </div>

        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <AnimatePresence>
              {matchMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 border border-white/20 p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <p className="text-[0.85rem] font-medium">
                    {selectedForMatch.length === 2
                      ? `Ready to match: ${selectedForMatch[0].name} & ${selectedForMatch[1].name}`
                      : `Select ${2 - selectedForMatch.length} more profile${selectedForMatch.length === 0 ? 's' : ''} to create a match`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      disabled={selectedForMatch.length !== 2}
                      onClick={() => setShowMatchModal(true)}
                      className={`px-4 py-2 text-[0.75rem] font-bold text-lowercase ${
                        selectedForMatch.length === 2 ? 'bg-white text-black' : 'bg-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      create match ✓
                    </button>
                    <button
                      onClick={() => { setMatchMode(false); setSelectedForMatch([]); }}
                      className="px-4 py-2 text-[0.75rem] font-bold text-white border border-border-custom hover:border-white text-lowercase"
                    >
                      cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-custom" />
                <input
                  type="text"
                  placeholder="Search by name, skills, bio..."
                  className="w-full bg-black border border-border-custom pl-10 pr-4 py-2.5 text-[0.85rem] outline-none focus:border-gray-custom transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="bg-black border border-border-custom px-4 py-2.5 text-[0.85rem] text-gray-custom outline-none appearance-none min-w-[150px]"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option>Founder</option>
                <option>Developer</option>
                <option>Designer</option>
                <option>Other</option>
              </select>
              <select
                className="bg-black border border-border-custom px-4 py-2.5 text-[0.85rem] text-gray-custom outline-none appearance-none min-w-[150px]"
                value={commitFilter}
                onChange={e => setCommitFilter(e.target.value)}
              >
                <option value="">All Commitment</option>
                <option>Full-time</option>
                <option>Part-time (Weekends)</option>
                <option>Part-time (Evenings)</option>
                <option>Exploring</option>
              </select>
              <button
                onClick={() => setMatchMode(true)}
                className="px-4 py-2.5 bg-white text-black text-[0.75rem] font-bold text-lowercase hover:bg-gray-200 transition-colors"
              >
                + create match
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border-custom border border-border-custom">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((p, index) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-black p-7 transition-colors relative group ${
                      selectedForMatch.find(s => s.id === p.id) ? 'ring-1 ring-inset ring-white bg-white/5' : 'hover:bg-white/5'
                    }`}
                  >
                    {matchMode && (
                      <button
                        onClick={() => toggleSelectForMatch(p)}
                        className={`absolute top-4 right-4 w-7 h-7 border flex items-center justify-center transition-all ${
                          selectedForMatch.find(s => s.id === p.id) ? 'bg-white border-white text-black' : 'border-border-custom text-gray-custom hover:border-white'
                        }`}
                      >
                        {selectedForMatch.find(s => s.id === p.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    )}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-11 h-11 bg-white text-black flex items-center justify-center font-display text-[0.9rem] font-extrabold flex-shrink-0">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-display font-bold text-[0.95rem] text-lowercase tracking-tight">{p.name}</div>
                        <div className="text-[0.78rem] text-gray-custom mt-0.5">📍 {p.location}</div>
                      </div>
                    </div>
                    <span className={`inline-block px-2.5 py-1 text-[0.68rem] font-bold tracking-widest uppercase mb-4 border ${
                      p.role === 'Founder' ? 'border-white/30 text-white' : 'border-gray-custom/40 text-gray-custom'
                    }`}>
                      {p.role}
                    </span>
                    <p className="text-[0.8rem] text-gray-custom line-clamp-2 mb-4 font-light leading-relaxed">{p.bio}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {p.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-[0.7rem] bg-white/5 border border-border-custom text-gray-custom px-2 py-1">{s}</span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-[0.75rem] text-gray-custom mb-6 font-light">
                      <span>⏰ {p.commitment}</span>
                      <span>📅 {p.exp}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingProfile(p)}
                        className="px-3 py-1.5 border border-border-custom text-gray-custom text-[0.75rem] font-semibold hover:border-white hover:text-white transition-all text-lowercase"
                      >
                        view
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p.id)}
                        className="px-3 py-1.5 border border-border-custom text-gray-custom/40 text-[0.75rem] font-semibold hover:border-red-500 hover:text-red-500 transition-all text-lowercase"
                      >
                        delete
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-black p-20 text-center col-span-full">
                  <div className="text-4xl opacity-20 mb-4">👤</div>
                  <h3 className="font-display font-bold text-white mb-2 text-lowercase">no profiles found</h3>
                  <p className="text-gray-custom text-sm font-light">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-[1px] bg-border-custom border border-border-custom">
            {matches.length > 0 ? (
              matches.map((m, index) => (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-[0.9rem] text-lowercase truncate">{m.p1_name}</div>
                      <div className="text-[0.78rem] text-gray-custom mt-0.5 truncate">{m.p1_role} · {m.p1_email} {m.p1_phone && `· ${m.p1_phone}`}</div>
                    </div>
                    <div className="hidden sm:block text-xl text-gray-custom opacity-30">🤝</div>
                    <div className="sm:hidden h-[1px] bg-border-custom w-full opacity-30" />
                    <div className="min-w-0">
                      <div className="font-display font-bold text-[0.9rem] text-lowercase truncate">{m.p2_name}</div>
                      <div className="text-[0.78rem] text-gray-custom mt-0.5 truncate">{m.p2_role} · {m.p2_email} {m.p2_phone && `· ${m.p2_phone}`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <span className={`px-3 py-1 text-[0.68rem] font-bold tracking-widest uppercase border ${
                      m.status === 'pending' ? 'border-border-custom text-gray-custom' : 'border-white/30 text-white'
                    }`}>
                      {m.status}
                    </span>
                    {m.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateMatchStatus(m.id, 'introduced')}
                        className="px-3 py-1.5 bg-white text-black text-[0.75rem] font-bold text-lowercase hover:bg-gray-200 transition-colors"
                      >
                        mark introduced
                      </button>
                    )}
                    {m.status === 'introduced' && (
                      <button
                        onClick={() => handleUpdateMatchStatus(m.id, 'connected')}
                        className="px-3 py-1.5 border border-border-custom text-white text-[0.75rem] font-bold text-lowercase hover:border-white transition-colors"
                      >
                        mark connected ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMatch(m.id)}
                      className="p-1.5 text-gray-custom/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {m.notes && (
                    <div className="w-full pt-4 border-t border-border-custom mt-2 text-[0.78rem] text-gray-custom font-light">
                      📝 {m.notes}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="bg-black p-20 text-center">
                <div className="text-4xl opacity-20 mb-4">🤝</div>
                <h3 className="font-display font-bold text-white mb-2 text-lowercase">no matches yet</h3>
                <p className="text-gray-custom text-sm font-light">Go to Profiles tab and click "Create Match" to match founders</p>
              </div>
            )}
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border-custom border border-border-custom">
            {waitlist.length > 0 ? (
              waitlist.map((w, index) => (
                <motion.div 
                  key={w.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black p-7 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-11 h-11 bg-white text-black flex items-center justify-center font-display text-[0.9rem] font-extrabold flex-shrink-0">
                      {w.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[0.95rem] text-lowercase tracking-tight">{w.name}</div>
                      <div className="text-[0.78rem] text-gray-custom mt-0.5">📧 {w.email}</div>
                    </div>
                  </div>
                  {w.role && (
                    <span className="inline-block px-2.5 py-1 text-[0.68rem] font-bold tracking-widest uppercase mb-4 border border-border-custom text-gray-custom">
                      {w.role}
                    </span>
                  )}
                  <div className="flex gap-4 text-[0.75rem] text-gray-custom mb-6 font-light">
                    {w.city && <span>📍 {w.city}</span>}
                    {w.source && <span>📣 {w.source}</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteWaitlist(w.id)}
                    className="px-3 py-1.5 border border-border-custom text-gray-custom/40 text-[0.75rem] font-semibold hover:border-red-500 hover:text-red-500 transition-all text-lowercase"
                  >
                    remove
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="bg-black p-20 text-center col-span-full">
                <div className="text-4xl opacity-20 mb-4">📋</div>
                <h3 className="font-display font-bold text-white mb-2 text-lowercase">no waitlist entries yet</h3>
                <p className="text-gray-custom text-sm font-light">Share your landing page to start collecting entries</p>
              </div>
            )}
          </div>
        )}

        {/* Team Requests Tab */}
        {activeTab === 'teamRequests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-border-custom border border-border-custom">
            {teamRequests.length > 0 ? (
              teamRequests.map((tr, index) => (
                <motion.div 
                  key={tr.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black p-8 hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display font-bold text-xl text-lowercase mb-1">{tr.startupName}</h3>
                      <p className="text-[0.8rem] text-gray-custom font-light">Requested by {tr.contactName}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 border border-white/20 text-white text-[0.65rem] font-bold uppercase tracking-widest">
                      {tr.roleNeeded}
                    </span>
                  </div>
                  
                  <div className="mb-8">
                    <p className="text-[0.9rem] text-gray-custom font-light leading-relaxed italic">
                      "{tr.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-3 border border-border-custom">
                      <p className="text-[0.6rem] font-bold text-gray-custom uppercase tracking-widest mb-1">Budget</p>
                      <p className="text-[0.85rem] font-medium">{tr.budget || 'Not specified'}</p>
                    </div>
                    <div className="p-3 border border-border-custom">
                      <p className="text-[0.6rem] font-bold text-gray-custom uppercase tracking-widest mb-1">Equity</p>
                      <p className="text-[0.85rem] font-medium">{tr.equity || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border-custom">
                    <div className="flex gap-4">
                      <a href={`mailto:${tr.email}`} className="text-gray-custom hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                      {tr.phone && (
                        <a href={`tel:${tr.phone}`} className="text-gray-custom hover:text-white transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTeamRequest(tr.id)}
                      className="px-3 py-1.5 border border-border-custom text-gray-custom/40 text-[0.75rem] font-semibold hover:border-red-500 hover:text-red-500 transition-all text-lowercase"
                    >
                      delete request
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-black p-20 text-center col-span-full">
                <div className="text-4xl opacity-20 mb-4">💼</div>
                <h3 className="font-display font-bold text-white mb-2 text-lowercase">no team requests yet</h3>
                <p className="text-gray-custom text-sm font-light">Startups will submit requests here when they need team members</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border-custom border border-border-custom">
            {reviews.length > 0 ? (
              reviews.map((r, index) => (
                <motion.div 
                  key={r.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black p-8 hover:bg-white/5 transition-colors flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-white text-white' : 'text-white/10'}`} />
                      ))}
                    </div>
                    {!r.isApproved && (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[0.6rem] font-bold uppercase tracking-widest border border-amber-500/20">
                        pending
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[0.9rem] text-gray-custom font-light leading-relaxed italic mb-6 flex-grow">
                    "{r.content}"
                  </p>

                  <div className="mb-6">
                    <div className="font-bold text-[0.9rem]">{r.name}</div>
                    <div className="text-[0.7rem] text-gray-custom uppercase tracking-widest mt-1">{r.role}</div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border-custom">
                    {!r.isApproved && (
                      <button
                        onClick={() => handleApproveReview(r.id)}
                        className="flex-1 py-2 bg-white text-black text-[0.75rem] font-bold hover:bg-gray-200 transition-colors text-lowercase"
                      >
                        approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="flex-1 py-2 border border-border-custom text-gray-custom/40 text-[0.75rem] font-semibold hover:border-red-500 hover:text-red-500 transition-all text-lowercase"
                    >
                      delete
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-black p-20 text-center col-span-full">
                <div className="text-4xl opacity-20 mb-4">💬</div>
                <h3 className="font-display font-bold text-white mb-2 text-lowercase">no reviews yet</h3>
                <p className="text-gray-custom text-sm font-light">Users can submit reviews from the landing page</p>
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border-custom border border-border-custom">
            {contacts.length > 0 ? (
              contacts.map((c, index) => (
                <motion.div 
                  key={c.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black p-8 hover:bg-white/5 transition-colors flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="font-bold text-[1.1rem] mb-1">{c.name}</div>
                      <div className="text-[0.8rem] text-gray-custom font-light flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {c.number}
                      </div>
                    </div>
                    <div className="text-[0.6rem] text-gray-custom/50 uppercase tracking-widest">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-border-custom p-4 mb-8 flex-grow">
                    <p className="text-[0.9rem] text-gray-custom font-light leading-relaxed italic">
                      "{c.query}"
                    </p>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border-custom">
                    <a 
                      href={`tel:${c.number}`}
                      className="flex-1 py-2 bg-white text-black text-[0.75rem] font-bold hover:bg-gray-200 transition-colors text-center text-lowercase"
                    >
                      call
                    </a>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="flex-1 py-2 border border-border-custom text-gray-custom/40 text-[0.75rem] font-semibold hover:border-red-500 hover:text-red-500 transition-all text-lowercase"
                    >
                      delete
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-black p-20 text-center col-span-full">
                <div className="text-4xl opacity-20 mb-4">✉️</div>
                <h3 className="font-display font-bold text-white mb-2 text-lowercase">no messages yet</h3>
                <p className="text-gray-custom text-sm font-light">Contact messages will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-border-custom p-10 max-w-[520px] w-full"
            >
              <h2 className="font-display text-2xl font-extrabold tracking-tight mb-2 text-lowercase">🤝 create match</h2>
              <p className="text-gray-custom text-[0.88rem] mb-8 font-light">Introduce these two founders via email or WhatsApp?</p>
              
              <div className="flex items-center gap-4 p-5 border border-border-custom mb-8 bg-white/5">
                <div className="flex-1 text-center">
                  <div className="font-display font-bold text-sm text-lowercase">{selectedForMatch[0]?.name}</div>
                  <div className="text-[0.7rem] text-gray-custom mt-1">{selectedForMatch[0]?.role} · {selectedForMatch[0]?.location}</div>
                </div>
                <div className="text-xl text-gray-custom opacity-30">🤝</div>
                <div className="flex-1 text-center">
                  <div className="font-display font-bold text-sm text-lowercase">{selectedForMatch[1]?.name}</div>
                  <div className="text-[0.7rem] text-gray-custom mt-1">{selectedForMatch[1]?.role} · {selectedForMatch[1]?.location}</div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[0.7rem] font-semibold text-gray-custom tracking-widest uppercase">Match Notes (for admin)</label>
                <textarea
                  placeholder="Why are these two a good match?"
                  className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors min-h-[100px] resize-none"
                  value={matchNotes}
                  onChange={e => setMatchNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="px-5 py-2.5 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
                >
                  cancel
                </button>
                <button
                  onClick={handleCreateMatch}
                  className="px-5 py-2.5 bg-white text-black text-[0.85rem] font-bold hover:bg-gray-200 transition-colors text-lowercase"
                >
                  confirm & introduce →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {viewingProfile && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-border-custom p-10 max-w-[640px] w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="mb-8">
                <h2 className="font-display text-2xl font-extrabold tracking-tight mb-1 text-lowercase">{viewingProfile.name}</h2>
                <div className="text-[0.82rem] text-gray-custom font-light">
                  📍 {viewingProfile.location} · {viewingProfile.role} · {viewingProfile.exp}
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-5 border border-border-custom bg-white/5 text-[0.85rem] text-gray-custom leading-relaxed font-light italic">
                  "{viewingProfile.bio}"
                </div>

                {viewingProfile.idea && (
                  <div>
                    <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-2">Startup Idea</div>
                    <div className="text-[0.85rem] font-light leading-relaxed">{viewingProfile.idea}</div>
                  </div>
                )}

                <div>
                  <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-3">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {viewingProfile.skills.map(s => (
                      <span key={s} className="text-[0.72rem] bg-white/5 border border-border-custom text-gray-custom px-2.5 py-1">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-2">Looking For</div>
                    <div className="text-[0.85rem] font-light">{viewingProfile.looking}</div>
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-2">Commitment</div>
                    <div className="text-[0.85rem] font-light">{viewingProfile.commitment}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-3">Industries</div>
                  <div className="flex flex-wrap gap-2">
                    {viewingProfile.industries.map(s => (
                      <span key={s} className="text-[0.72rem] bg-white/5 border border-border-custom text-gray-custom px-2.5 py-1">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-border-custom space-y-3">
                  <div className="flex items-center gap-3 text-[0.82rem] text-gray-custom font-light">
                    <Mail className="w-4 h-4" /> {viewingProfile.email}
                  </div>
                  {viewingProfile.phone && (
                    <div className="flex items-center gap-3 text-[0.82rem] text-gray-custom font-light">
                      <MessageSquare className="w-4 h-4" /> {viewingProfile.phone}
                    </div>
                  )}
                  {viewingProfile.linkedin && (
                    <a
                      href={viewingProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[0.82rem] text-white font-light hover:underline"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={() => setViewingProfile(null)}
                  className="px-6 py-2.5 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
                >
                  close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
