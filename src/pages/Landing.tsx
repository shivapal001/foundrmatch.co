import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { Stats, Review } from '../types';
import { ArrowRight, Target, Users, Globe, ShieldCheck, Zap, Trophy, Star, Quote, X } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
  user?: any; // Add user prop to check if logged in
}

export const Landing: React.FC<LandingProps> = ({ onNavigate, user }) => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [newReview, setNewReview] = React.useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchReviews = async () => {
      const data = await api.getApprovedReviews();
      setReviews(data);
    };
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await api.submitReview({
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userRole: 'Founder', // Default or fetch from profile
        rating: newReview.rating,
        comment: newReview.comment
      });
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      alert('Review submitted for approval! Thank you.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[0.85rem] font-semibold hover:bg-gray-200 transition-colors text-lowercase"
            >
              create your profile <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('waitlist')}
              className="flex items-center gap-2 px-6 py-3 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
            >
              join waitlist
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-8 sm:gap-12 mt-16 pt-12 border-t border-border-custom"
          >
            <div className="flex-1 min-w-[100px]">
              <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tighter leading-none">
                {stats.profiles}<span className="text-gray-custom">+</span>
              </div>
              <div className="text-[0.7rem] sm:text-[0.75rem] text-gray-custom mt-2 text-lowercase">profiles created</div>
            </div>
            <div className="flex-1 min-w-[100px]">
              <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tighter leading-none">
                {stats.matches}<span className="text-gray-custom">+</span>
              </div>
              <div className="text-[0.7rem] sm:text-[0.75rem] text-gray-custom mt-2 text-lowercase">matches made</div>
            </div>
            <div className="flex-1 min-w-[100px]">
              <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tighter leading-none">
                {stats.connections}<span className="text-gray-custom">+</span>
              </div>
              <div className="text-[0.7rem] sm:text-[0.75rem] text-gray-custom mt-2 text-lowercase">connected</div>
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
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 border-r border-b border-border-custom hover:bg-white/5 transition-colors group cursor-default"
            >
              <div className="font-display text-[0.7rem] font-bold text-white/15 tracking-[2px] mb-6">{f.id}</div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="mb-5 text-white w-fit"
              >
                {f.icon}
              </motion.div>
              <h3 className="font-display text-[1.05rem] font-bold mb-3 text-lowercase tracking-tight">{f.title}</h3>
              <p className="text-[0.85rem] text-gray-custom leading-relaxed font-light">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-24 px-6 lg:px-10 border-b border-border-custom">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-[600px]">
              <div className="text-[0.7rem] text-gray-custom tracking-[3px] uppercase mb-5 font-semibold">testimonials</div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-lowercase leading-[1.1]">
                what founders are saying<br />about foundrmatch
              </h2>
            </div>
            {user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
              >
                write a review
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border border-border-custom bg-white/5 relative group"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-white/10 transition-colors" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-white fill-white' : 'text-white/20'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[0.95rem] text-gray-custom font-light leading-relaxed mb-8 italic">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-display font-bold text-sm">
                      {review.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[0.9rem] text-lowercase">{review.userName}</div>
                      <div className="text-[0.75rem] text-gray-custom uppercase tracking-widest font-medium">{review.userRole}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-border-custom">
                <p className="text-gray-custom font-light">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-border-custom p-10 max-w-[500px] w-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight mb-2 text-lowercase">write a review</h2>
                  <p className="text-gray-custom text-[0.88rem] font-light">Share your experience with the community</p>
                </div>
                <button onClick={() => setShowReviewForm(false)} className="text-gray-custom hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[0.7rem] font-semibold text-gray-custom tracking-widest uppercase">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= newReview.rating ? 'text-white fill-white' : 'text-white/20'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[0.7rem] font-semibold text-gray-custom tracking-widest uppercase">Your Comment</label>
                  <textarea
                    required
                    placeholder="How was your experience finding a co-founder?"
                    className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors min-h-[120px] resize-none"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  type="submit"
                  className="w-full py-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-lowercase disabled:opacity-50"
                >
                  {submitting ? 'submitting...' : 'submit review →'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('profile')}
            className="px-8 py-4 bg-white text-black text-[0.9rem] font-bold hover:bg-gray-200 transition-colors text-lowercase"
          >
            create your profile — it's free →
          </motion.button>
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
