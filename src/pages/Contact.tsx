import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { Send, CheckCircle2, Phone, User, MessageSquare } from 'lucide-react';

interface ContactProps {
  onNavigate: (page: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Contact: React.FC<ContactProps> = ({ onNavigate, showToast }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    query: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.query || !formData.number) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.createContactMessage(formData);
      setSubmitted(true);
      showToast('Message sent! We will get back to you soon.', 'success');
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black px-6">
      <div className="max-w-[600px] mx-auto">
        <div className="mb-12 text-center">
          <div className="text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-5">get in touch</div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-4 text-lowercase">Leave us a message</h1>
          <p className="text-gray-custom text-[0.9rem] font-light leading-relaxed">
            Have a question or need help? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-border-custom p-8 md:p-12 relative overflow-hidden"
        >
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Message Received</h3>
              <p className="text-gray-custom font-light mb-10">Thank you for reaching out. We'll be in touch shortly.</p>
              <button 
                onClick={() => onNavigate('landing')}
                className="px-8 py-4 bg-white text-black font-bold text-[0.9rem] hover:bg-gray-200 transition-colors text-lowercase"
              >
                back to home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Name
                </label>
                <input 
                  required
                  type="text"
                  placeholder="Your full name"
                  className="w-full bg-black border border-border-custom px-4 py-4 text-[0.95rem] font-light outline-none focus:border-white transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input 
                  required
                  type="tel"
                  placeholder="Your contact number"
                  className="w-full bg-black border border-border-custom px-4 py-4 text-[0.95rem] font-light outline-none focus:border-white transition-colors"
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] font-bold text-gray-custom uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Your Query
                </label>
                <textarea 
                  required
                  placeholder="How can we help you?"
                  className="w-full bg-black border border-border-custom px-4 py-4 text-[0.95rem] font-light outline-none focus:border-white transition-colors min-h-[150px] resize-none"
                  value={formData.query}
                  onChange={e => setFormData({...formData, query: e.target.value})}
                />
              </div>

              <button 
                disabled={submitting}
                className="w-full py-5 bg-white text-black font-bold text-[1rem] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 text-lowercase disabled:opacity-50"
              >
                {submitting ? 'sending...' : <>send message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -ml-16 -mb-16" />
        </motion.div>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-custom text-[0.85rem] font-light">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> support@foundrmatch.in
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> +91 98710 49167
          </div>
        </div>
      </div>
    </div>
  );
};

import { Mail } from 'lucide-react';
