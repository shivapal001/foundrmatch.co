import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { Review } from '../types';
import { Star, Quote, Send, CheckCircle2 } from 'lucide-react';

interface ReviewSectionProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ showToast }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    content: ''
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await api.getReviews(true);
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.createReview(formData);
      setSubmitted(true);
      showToast('Review submitted! It will appear after approval.', 'success');
      setFormData({ name: '', role: '', rating: 5, content: '' });
    } catch (err) {
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-black border-t border-border-custom">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="text-[0.7rem] font-bold tracking-[3px] uppercase text-gray-custom mb-4">community</div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-lowercase">
              what founders are saying
            </h2>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 border border-border-custom text-white text-[0.85rem] font-bold hover:border-white transition-colors text-lowercase"
          >
            {showForm ? 'close form' : 'write a review'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-20"
            >
              <div className="max-w-2xl mx-auto bg-white/5 border border-border-custom p-8 md:p-12">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Thank you for your feedback!</h3>
                    <p className="text-gray-custom font-light mb-6">Your review has been submitted for moderation.</p>
                    <button 
                      onClick={() => { setSubmitted(false); setShowForm(false); }}
                      className="text-white underline text-[0.85rem]"
                    >
                      close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest">Name</label>
                        <input 
                          required
                          type="text"
                          className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest">Role / Startup</label>
                        <input 
                          type="text"
                          className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({...formData, rating: star})}
                            className="transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`w-6 h-6 ${formData.rating >= star ? 'fill-white text-white' : 'text-gray-custom'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest">Your Review</label>
                      <textarea 
                          required
                          className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors min-h-[120px] resize-none"
                          value={formData.content}
                          onChange={e => setFormData({...formData, content: e.target.value})}
                        />
                    </div>

                    <button 
                      disabled={submitting}
                      className="w-full py-4 bg-white text-black font-bold text-[0.9rem] hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-lowercase disabled:opacity-50"
                    >
                      {submitting ? 'submitting...' : <>submit review <Send className="w-4 h-4" /></>}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-custom">
            <p className="text-gray-custom font-light italic">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-border-custom p-8 flex flex-col h-full group hover:border-white/30 transition-colors"
              >
                <Quote className="w-8 h-8 text-white/10 mb-6 group-hover:text-white/20 transition-colors" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? 'fill-white text-white' : 'text-white/10'}`} 
                    />
                  ))}
                </div>

                <p className="text-[1rem] font-light leading-relaxed text-gray-custom mb-8 flex-grow italic">
                  "{review.content}"
                </p>

                <div className="pt-6 border-t border-white/10">
                  <div className="font-bold text-[0.9rem]">{review.name}</div>
                  <div className="text-[0.75rem] text-gray-custom uppercase tracking-widest mt-1">
                    {review.role || 'Founder'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
