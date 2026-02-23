import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { Stats } from '../types';
import { ArrowRight, Target, Users, Globe, ShieldCheck, Zap, Trophy } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats>({ profiles: 0, matches: 0, connections: 0 });

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  return (
    <div className="bg-black">
      {/* Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="px-6 lg:px-16 pt-32 pb-20 flex flex-col justify-center bg-black border-r border-border-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-7"
          >
            <div className="w-6 h-[1px] bg-gray-custom" />
            now in beta — india
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2.8rem,5.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-2px] mb-8 text-lowercase"
          >
            find your<br />
            <span className="text-gray-custom">co-founder.</span><br />
            build together.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[0.95rem] text-gray-custom max-w-[400px] leading-relaxed mb-12 font-light"
          >
            FoundrMatch connects early-stage founders with the right co-founders based on skills, vision, and commitment. No noise — just intentional matching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[0.85rem] font-semibold hover:bg-gray-200 transition-colors text-lowercase"
            >
              create your profile <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('waitlist')}
              className="flex items-center gap-2 px-6 py-3 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
            >
              join waitlist
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-12 mt-16 pt-12 border-t border-border-custom"
          >
            <div>
              <div className="font-display text-4xl font-extrabold tracking-tighter leading-none">
                {stats.profiles}<span className="text-gray-custom">+</span>
              </div>
              <div className="text-[0.75rem] text-gray-custom mt-2 text-lowercase">profiles created</div>
            </div>
            <div>
              <div className="font-display text-4xl font-extrabold tracking-tighter leading-none">
                {stats.matches}<span className="text-gray-custom">+</span>
              </div>
              <div className="text-[0.75rem] text-gray-custom mt-2 text-lowercase">matches made</div>
            </div>
            <div>
              <div className="font-display text-4xl font-extrabold tracking-tighter leading-none">
                {stats.connections}<span className="text-gray-custom">+</span>
              </div>
              <div className="text-[0.75rem] text-gray-custom mt-2 text-lowercase">connected</div>
            </div>
          </motion.div>
        </div>

        <div className="relative overflow-hidden bg-[#060606] hidden lg:block">
          <div className="absolute inset-0 z-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px]" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-16 bg-gradient-to-t from-black/70 to-transparent z-10">
            <div className="flex items-center gap-3 border border-white/15 px-4 py-2 mb-3 backdrop-blur-md bg-black/40 w-fit">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[0.8rem] text-gray-200">matching founders across india</span>
            </div>
            <div className="flex items-center gap-3 border border-white/15 px-4 py-2 mb-3 backdrop-blur-md bg-black/40 w-fit">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[0.8rem] text-gray-200">human-reviewed profiles · zero spam</span>
            </div>
            <div className="mt-2 font-display text-[0.65rem] text-gray-custom/50 tracking-[2px] uppercase">
              the right co-founder changes everything
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-[1200px] mx-auto px-6 py-32">
        <div className="flex items-center gap-3 text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-6">
          <div className="w-6 h-[1px] bg-gray-custom" />
          why foundrmatch
        </div>
        <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-2px] leading-[0.95] mb-20 text-lowercase">
          intentional.<br />structured. serious.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-border-custom">
          {[
            { id: '01', icon: <Target className="w-6 h-6" />, title: 'skills compatibility', desc: 'We match founders based on complementary skills — technical + business, design + product. No guessing.' },
            { id: '02', icon: <Users className="w-6 h-6" />, title: 'commitment alignment', desc: 'Full-time or part-time — we only match people with the same commitment level. No wasted conversations.' },
            { id: '03', icon: <Globe className="w-6 h-6" />, title: 'india-first network', desc: "Built for Indian founders first. Bharat's startup ecosystem is massive — we're here for it." },
            { id: '04', icon: <ShieldCheck className="w-6 h-6" />, title: 'curated matching', desc: 'Human-reviewed profiles with intentional introductions. Quality over quantity, every time.' },
            { id: '05', icon: <Zap className="w-6 h-6" />, title: 'structured profiles', desc: "Rich, structured profiles that surface what matters — stage, industry, vision, and what you're looking for." },
            { id: '06', icon: <Trophy className="w-6 h-6" />, title: 'zero noise', desc: 'No cold DMs, no spam. Admin-facilitated introductions only. Your time is valuable.' },
          ].map((f, i) => (
            <div key={i} className="p-10 border-r border-b border-border-custom hover:bg-white/5 transition-colors group">
              <div className="font-display text-[0.7rem] font-bold text-white/15 tracking-[2px] mb-6">{f.id}</div>
              <div className="mb-5 text-white">{f.icon}</div>
              <h3 className="font-display text-[1.05rem] font-bold mb-3 text-lowercase tracking-tight">{f.title}</h3>
              <p className="text-[0.85rem] text-gray-custom leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-y border-border-custom py-32 px-6 text-center bg-section-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        <div className="relative z-10">
          <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold tracking-[-2px] leading-[0.95] mb-6 text-lowercase">
            ready to find your<br />co-founder?
          </h2>
          <p className="text-gray-custom mb-10 text-[0.95rem] font-light">Join 50+ founders already building their dream team on FoundrMatch.</p>
          <button
            onClick={() => onNavigate('profile')}
            className="px-8 py-4 bg-white text-black text-[0.9rem] font-bold hover:bg-gray-200 transition-colors text-lowercase"
          >
            create your profile — it's free →
          </button>
        </div>
      </div>

      <footer className="border-t border-border-custom px-6 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between text-gray-custom text-[0.78rem] font-light text-lowercase gap-4">
        <div><span className="text-white font-medium">foundrmatch</span> for indian founders · v1 mvp · india 🇮🇳</div>
        <div className="flex gap-6">
          <button onClick={() => onNavigate('waitlist')} className="hover:text-white transition-colors">join waitlist</button>
          <button onClick={() => onNavigate('profile')} className="hover:text-white transition-colors">create profile</button>
        </div>
      </footer>
    </div>
  );
};
