import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { ArrowRight, PartyPopper } from 'lucide-react';

interface WaitlistProps {
  onNavigate: (page: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Waitlist: React.FC<WaitlistProps> = ({ onNavigate, showToast }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    role: '',
    source: '',
    looking: [] as string[]
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      await api.joinWaitlist({
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        city: formData.city,
        role: formData.role,
        source: formData.source,
        looking: formData.looking.join(', '),
        createdAt: Date.now()
      });
      setSubmitted(true);
      showToast('Added to waitlist! 🎉', 'success');
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const toggleLooking = (val: string) => {
    setFormData(prev => ({
      ...prev,
      looking: prev.looking.includes(val)
        ? prev.looking.filter(l => l !== val)
        : [...prev.looking, val]
    }));
  };

  if (submitted) {
    return (
      <div className="pt-32 min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-5xl mb-8">🎉</div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight mb-4 text-lowercase">you're on the list!</h2>
          <p className="text-gray-custom mb-8 font-light leading-relaxed">
            We'll reach out when we find your match. In the meantime, create your full profile to speed up the process.
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('profile')}
              className="px-6 py-3 bg-white text-black text-[0.9rem] font-bold hover:bg-gray-200 transition-colors text-lowercase flex items-center justify-center gap-2"
            >
              create full profile <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('landing')}
              className="px-6 py-3 border border-border-custom text-white text-[0.9rem] font-bold hover:border-white transition-colors text-lowercase"
            >
              back to home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black px-6">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-16 border-b border-border-custom pb-10">
          <div className="text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-5">waitlist</div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-4 text-lowercase">Join the Waitlist</h1>
          <p className="text-gray-custom text-[0.9rem] font-light leading-relaxed">
            Be among the first to get matched when we go live in your city. We'll notify you as soon as spots open up.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">
              Full Name <span className="text-white">*</span>
            </label>
            <input
              type="text"
              placeholder="Rahul Sharma"
              className="w-full bg-black border border-border-custom px-4 py-3.5 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">
              Email Address <span className="text-white">*</span>
            </label>
            <input
              type="email"
              placeholder="rahul@example.com"
              className="w-full bg-black border border-border-custom px-4 py-3.5 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">City</label>
              <input
                type="text"
                placeholder="Bangalore"
                className="w-full bg-black border border-border-custom px-4 py-3.5 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Your Role</label>
              <select
                className="w-full bg-black border border-border-custom px-4 py-3.5 text-[0.9rem] font-light outline-none focus:border-white transition-colors appearance-none"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="">Select...</option>
                <option>Founder</option>
                <option>Developer</option>
                <option>Designer</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">What are you looking for?</label>
            <div className="flex flex-wrap gap-2">
              {['Technical Co-founder', 'Business Co-founder', 'Designer Co-founder', 'Any Co-founder'].map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleLooking(opt)}
                  className={`px-4 py-2.5 text-[0.82rem] border transition-all text-lowercase ${
                    formData.looking.includes(opt)
                      ? 'bg-white border-white text-black font-medium'
                      : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">How did you hear about us?</label>
            <select
              className="w-full bg-black border border-border-custom px-4 py-3.5 text-[0.9rem] font-light outline-none focus:border-white transition-colors appearance-none"
              value={formData.source}
              onChange={e => setFormData({ ...formData, source: e.target.value })}
            >
              <option value="">Select...</option>
              <option>LinkedIn</option>
              <option>Twitter/X</option>
              <option>WhatsApp Group</option>
              <option>Friend Referral</option>
              <option>Google Search</option>
              <option>Other</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full py-4 bg-white text-black text-[0.9rem] font-bold hover:bg-gray-200 transition-colors text-lowercase mt-8"
          >
            join waitlist →
          </motion.button>
          
          <p className="text-center text-[0.78rem] text-gray-custom font-light">
            No spam. We'll only reach out when you're matched. 🔒
          </p>
        </div>
      </div>
    </div>
  );
};
