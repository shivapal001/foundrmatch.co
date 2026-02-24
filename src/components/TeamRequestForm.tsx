import React, { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { TeamRequest } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface TeamRequestFormProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onNavigate: (page: string) => void;
}

export const TeamRequestForm: React.FC<TeamRequestFormProps> = ({ showToast, onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startupName: '',
    contactName: '',
    email: '',
    phone: '',
    roleNeeded: '',
    description: '',
    budget: '',
    equity: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting team request...', formData);
    setLoading(true);

    try {
      await api.createTeamRequest(formData);
      console.log('Team request submitted successfully');
      setSubmitted(true);
      showToast('Team request submitted successfully!', 'success');
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Failed to submit request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-black px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[500px] w-full text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-8 opacity-20" />
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-6 text-lowercase">Request Received</h1>
          <p className="text-gray-custom text-[1rem] font-light leading-relaxed mb-10">
            Our team will review your requirements and get back to you with potential candidates within 48 hours.
          </p>
          <button
            onClick={() => onNavigate('landing')}
            className="px-8 py-4 bg-white text-black font-bold text-[0.9rem] hover:bg-gray-200 transition-colors text-lowercase"
          >
            back to home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black px-6">
      <div className="max-w-[700px] mx-auto">
        <div className="mb-16 border-b border-border-custom pb-12">
          <div className="text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-5">hire talent</div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight mb-6 text-lowercase">Get Team Member</h1>
          <p className="text-gray-custom text-[1.1rem] font-light leading-relaxed max-w-[600px]">
            Looking for a developer, designer, or marketing lead? Tell us what you need and we'll find the perfect match for your startup.
          </p>
        </div>

        <form id="team-request-form" onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="startupName" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Startup Name</label>
              <input
                id="startupName"
                required
                type="text"
                placeholder="e.g. Acme Inc"
                className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors"
                value={formData.startupName}
                onChange={e => setFormData({ ...formData, startupName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contactName" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Contact Name</label>
              <input
                id="contactName"
                required
                type="text"
                placeholder="Your Name"
                className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors"
                value={formData.contactName}
                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Work Email</label>
              <input
                id="email"
                required
                type="email"
                placeholder="you@startup.com"
                className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="roleNeeded" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Role Needed</label>
            <select
              id="roleNeeded"
              required
              className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors appearance-none"
              value={formData.roleNeeded}
              onChange={e => setFormData({ ...formData, roleNeeded: e.target.value })}
            >
              <option value="" disabled>Select a role</option>
              <option>Full-stack Developer</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>UI/UX Designer</option>
              <option>Product Manager</option>
              <option>Marketing Lead</option>
              <option>Sales/Growth</option>
              <option>Mobile Developer</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Job Description & Requirements</label>
            <textarea
              id="description"
              required
              placeholder="Tell us about the project, tech stack, and what you're looking for in a team member..."
              className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors min-h-[150px] resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="budget" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Budget (Monthly/Project)</label>
              <input
                id="budget"
                type="text"
                placeholder="e.g. $2000 - $4000"
                className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="equity" className="text-[0.7rem] font-bold text-gray-custom tracking-widest uppercase">Equity Range (Optional)</label>
              <input
                id="equity"
                type="text"
                placeholder="e.g. 1% - 5%"
                className="w-full bg-black border-b border-border-custom py-4 text-[1.1rem] font-light outline-none focus:border-white transition-colors"
                value={formData.equity}
                onChange={e => setFormData({ ...formData, equity: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-10">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-5 bg-white text-black font-bold text-[1rem] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group text-lowercase"
            >
              {loading ? 'submitting...' : (
                <>
                  submit request <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
