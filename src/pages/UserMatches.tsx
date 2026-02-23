import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { Match } from '../types';
import { User } from 'firebase/auth';
import { Mail, MessageSquare, ExternalLink, User as UserIcon, ShieldCheck, Phone, MessageCircle } from 'lucide-react';

interface UserMatchesProps {
  user: User;
  onNavigate: (page: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const UserMatches: React.FC<UserMatchesProps> = ({ user, onNavigate, showToast }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await api.getUserMatches(user.uid);
        setMatches(data);
      } catch (err) {
        showToast('Failed to load matches', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [user.uid, showToast]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-display text-xl animate-pulse">finding your matches...</div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-12 border-b border-border-custom pb-10">
          <div className="text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-5">co-founder network</div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-4 text-lowercase">Your Matches</h1>
          <p className="text-gray-custom text-[0.9rem] font-light leading-relaxed">
            These are the co-founders our team has hand-picked for you based on your profile and vision.
          </p>
        </div>

        {matches.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-border-custom"
          >
            <div className="text-4xl mb-6">🔍</div>
            <h3 className="text-xl font-bold mb-2">No matches yet</h3>
            <p className="text-gray-custom font-light mb-8">
              Our team is currently reviewing your profile to find the perfect co-founder. <br/>
              We'll notify you as soon as we find someone!
            </p>
            <button
              onClick={() => onNavigate('profile')}
              className="px-6 py-3 border border-border-custom text-white text-[0.85rem] hover:border-white transition-colors text-lowercase"
            >
              update profile
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {matches.map((match, index) => {
              const isP1 = match.p1_id === user.uid;
              const partnerName = isP1 ? match.p2_name : match.p1_name;
              const partnerRole = isP1 ? match.p2_role : match.p1_role;
              const partnerEmail = isP1 ? match.p2_email : match.p1_email;
              const partnerPhone = isP1 ? match.p2_phone : match.p1_phone;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.5)' }}
                  className="bg-black border border-border-custom p-8 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-white/5 border border-border-custom flex items-center justify-center shrink-0">
                        <UserIcon className="w-6 h-6 text-gray-custom" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{partnerName}</h3>
                          {match.status === 'connected' && (
                            <span className="bg-emerald-500/10 text-emerald-500 text-[0.65rem] px-2 py-0.5 uppercase tracking-wider font-bold border border-emerald-500/20">
                              connected
                            </span>
                          )}
                        </div>
                        <p className="text-gray-custom text-[0.85rem] font-medium uppercase tracking-widest mb-3">
                          {partnerRole}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-[0.82rem] text-gray-custom">
                            <Mail className="w-3.5 h-3.5" />
                            {partnerEmail}
                          </div>
                          {partnerPhone && (
                            <div className="flex items-center gap-2 text-[0.82rem] text-gray-custom">
                              <Phone className="w-3.5 h-3.5" />
                              {partnerPhone}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[0.82rem] text-gray-custom">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Match
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <a 
                        href={`mailto:${partnerEmail}`}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-white text-black font-bold text-[0.8rem] hover:bg-gray-200 transition-colors text-center text-lowercase flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" /> email
                      </a>
                      {partnerPhone && (
                        <>
                          <a 
                            href={`tel:${partnerPhone}`}
                            className="flex-1 md:flex-none px-4 py-2.5 border border-border-custom text-white font-bold text-[0.8rem] hover:border-white transition-colors text-center text-lowercase flex items-center justify-center gap-2"
                          >
                            <Phone className="w-4 h-4" /> call
                          </a>
                          <a 
                            href={`https://wa.me/${partnerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none px-4 py-2.5 border border-border-custom text-white font-bold text-[0.8rem] hover:border-white transition-colors text-center text-lowercase flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" /> whatsapp
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {match.notes && (
                    <div className="mt-8 pt-6 border-t border-border-custom">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 text-gray-custom mt-1 shrink-0" />
                        <div>
                          <p className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest mb-2">Matchmaker's Note</p>
                          <p className="text-[0.9rem] text-gray-custom font-light leading-relaxed italic">
                            "{match.notes}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
