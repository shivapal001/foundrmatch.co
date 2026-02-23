import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { Profile } from '../types';
import { X, Plus, Rocket } from 'lucide-react';
import { User } from 'firebase/auth';

interface ProfileFormProps {
  user: User;
  onNavigate: (page: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onNavigate, showToast }) => {
  const [submitted, setSubmitted] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    phone: '',
    linkedin: '',
    role: '',
    exp: '',
    skills: [] as string[],
    stage: '',
    commitment: '',
    industries: [] as string[],
    looking: '',
    bio: '',
    idea: ''
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const requiredFields = ['name', 'location', 'email', 'bio', 'role', 'commitment', 'looking'];
    const filledRequired = requiredFields.filter(f => {
      const val = (formData as any)[f];
      return Array.isArray(val) ? val.length > 0 : !!val;
    }).length;
    
    // Skills is also effectively required
    const hasSkills = formData.skills.length > 0;
    const totalRequired = requiredFields.length + 1;
    const currentFilled = filledRequired + (hasSkills ? 1 : 0);
    
    setProgress(Math.round((currentFilled / totalRequired) * 100));
  }, [formData]);

  const handleSubmit = async () => {
    if (progress < 100) {
      showToast('Please fill in all required fields and add skills', 'error');
      return;
    }

    try {
      await api.createProfile({
        ...formData,
        id: user.uid,
        email: user.email || formData.email,
        createdAt: Date.now()
      });
      setSubmitted(true);
      showToast('Profile submitted! 🚀', 'success');
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !formData.skills.includes(val)) {
      setFormData({ ...formData, skills: [...formData.skills, val] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const toggleIndustry = (val: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(val)
        ? prev.industries.filter(i => i !== val)
        : [...prev.industries, val]
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
          <div className="text-5xl mb-8">🚀</div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight mb-4 text-lowercase">profile submitted!</h2>
          <p className="text-gray-custom mb-8 font-light leading-relaxed">
            Your profile is under review. We'll reach out within 48 hours when we find a compatible co-founder. Keep an eye on your email and WhatsApp!
          </p>
          <button
            onClick={() => onNavigate('landing')}
            className="px-8 py-4 border border-border-custom text-white text-[0.9rem] font-bold hover:border-white transition-colors text-lowercase"
          >
            back to home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black px-6">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-12 border-b border-border-custom pb-10">
          <div className="text-[0.7rem] font-medium tracking-[3px] uppercase text-gray-custom mb-5">profile</div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-4 text-lowercase">Create Your Profile</h1>
          <p className="text-gray-custom text-[0.9rem] font-light leading-relaxed">
            A great profile gets you great matches. Be specific and honest — it helps us find the right co-founder for you.
          </p>
        </div>

        <div className="mb-12">
          <div className="flex justify-between text-[0.75rem] text-gray-custom mb-2 uppercase tracking-widest font-medium">
            <span>Profile Completion</span>
            <span>{progress}%</span>
          </div>
          <div className="h-[1px] bg-border-custom w-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-white transition-all duration-500"
            />
          </div>
        </div>

        <div className="space-y-12">
          {/* Basic Info */}
          <section>
            <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-8 pb-3 border-b border-border-custom">Basic Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Full Name <span className="text-white">*</span></label>
                <input
                  type="text"
                  placeholder="Priya Mehta"
                  className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Location <span className="text-white">*</span></label>
                <input
                  type="text"
                  placeholder="Bangalore, India"
                  className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Email <span className="text-white">*</span></label>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">WhatsApp / Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">LinkedIn / Portfolio URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors"
                value={formData.linkedin}
                onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>
          </section>

          {/* Role & Experience */}
          <section>
            <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-8 pb-3 border-b border-border-custom">Role & Experience</div>
            
            <div className="space-y-3 mb-8">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">I am a... <span className="text-white">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['Founder', 'Developer', 'Designer', 'Other'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFormData({ ...formData, role })}
                    className={`px-5 py-2.5 text-[0.82rem] border transition-all text-lowercase ${
                      formData.role === role
                        ? 'bg-white border-white text-black font-semibold'
                        : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                    }`}
                  >
                    {role === 'Founder' ? '🚀 ' : role === 'Developer' ? '💻 ' : role === 'Designer' ? '🎨 ' : '⚡ '}{role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Experience Level <span className="text-white">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['Student', '0-1 years', '1-3 years', '3-5 years', '5+ years'].map(exp => (
                  <button
                    key={exp}
                    onClick={() => setFormData({ ...formData, exp })}
                    className={`px-5 py-2.5 text-[0.82rem] border transition-all text-lowercase ${
                      formData.exp === exp
                        ? 'bg-white border-white text-black font-semibold'
                        : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Skills <span className="text-white">*</span> <span className="text-[0.72rem] font-normal lowercase tracking-normal">(type and press Enter)</span></label>
              <div className="min-h-[52px] border border-border-custom p-3 flex flex-wrap gap-2 bg-black focus-within:border-white transition-colors">
                {formData.skills.map(skill => (
                  <span key={skill} className="bg-white/10 border border-border-custom px-3 py-1 text-[0.78rem] font-medium flex items-center gap-2">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="opacity-40 hover:opacity-100"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input
                  type="text"
                  className="bg-transparent outline-none text-[0.9rem] font-light flex-1 min-w-[120px]"
                  placeholder="e.g. React, Marketing, ML..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Startup Info */}
          <section>
            <div className="text-[0.7rem] font-semibold text-gray-custom tracking-[2px] uppercase mb-8 pb-3 border-b border-border-custom">Startup Vision</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Startup Stage</label>
                <div className="flex flex-col gap-2">
                  {['Just an idea', 'Building MVP', 'MVP ready', 'Getting traction'].map(stage => (
                    <button
                      key={stage}
                      onClick={() => setFormData({ ...formData, stage })}
                      className={`px-4 py-2.5 text-[0.82rem] border transition-all text-lowercase text-left w-fit ${
                        formData.stage === stage
                          ? 'bg-white border-white text-black font-semibold'
                          : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                      }`}
                    >
                      {stage === 'Just an idea' ? '💡 ' : stage === 'Building MVP' ? '🔨 ' : stage === 'MVP ready' ? '🚀 ' : '📈 '}{stage}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Commitment Level <span className="text-white">*</span></label>
                <div className="flex flex-col gap-2">
                  {['Full-time', 'Part-time (Weekends)', 'Part-time (Evenings)', 'Exploring'].map(commit => (
                    <button
                      key={commit}
                      onClick={() => setFormData({ ...formData, commitment: commit })}
                      className={`px-4 py-2.5 text-[0.82rem] border transition-all text-lowercase text-left w-fit ${
                        formData.commitment === commit
                          ? 'bg-white border-white text-black font-semibold'
                          : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                      }`}
                    >
                      {commit === 'Full-time' ? '🔥 ' : commit === 'Part-time (Weekends)' ? '⏰ ' : commit === 'Part-time (Evenings)' ? '🌙 ' : '🔍 '}{commit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Industry Interests <span className="text-white">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'AI/ML', 'E-commerce', 'Climate', 'Consumer', 'B2B', 'Other'].map(ind => (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`px-4 py-2 text-[0.82rem] border transition-all text-lowercase ${
                      formData.industries.includes(ind)
                        ? 'bg-white border-white text-black font-semibold'
                        : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">I'm looking for a... <span className="text-white">*</span></label>
              <div className="flex flex-wrap gap-2">
                {['Technical Co-founder', 'Business Co-founder', 'Designer Co-founder', 'Any'].map(look => (
                  <button
                    key={look}
                    onClick={() => setFormData({ ...formData, looking: look })}
                    className={`px-5 py-2.5 text-[0.82rem] border transition-all text-lowercase ${
                      formData.looking === look
                        ? 'bg-white border-white text-black font-semibold'
                        : 'border-border-custom text-gray-custom hover:border-gray-custom hover:text-white'
                    }`}
                  >
                    {look === 'Technical Co-founder' ? '💻 ' : look === 'Business Co-founder' ? '📊 ' : look === 'Designer Co-founder' ? '🎨 ' : '🤝 '}{look === 'Any' ? 'Any Co-founder' : look}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Short Bio <span className="text-white">*</span></label>
              <textarea
                placeholder="Tell potential co-founders who you are, what you've built or want to build, and what makes you a great partner..."
                className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors min-h-[120px] resize-y"
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[0.78rem] font-medium text-gray-custom tracking-widest uppercase">Startup Idea (Optional)</label>
              <textarea
                placeholder="Briefly describe your startup idea or the problem you want to solve..."
                className="w-full bg-black border border-border-custom px-4 py-3 text-[0.9rem] font-light outline-none focus:border-white transition-colors min-h-[80px] resize-y"
                value={formData.idea}
                onChange={e => setFormData({ ...formData, idea: e.target.value })}
              />
            </div>
          </section>

          <button
            onClick={handleSubmit}
            className={`w-full py-5 text-[0.9rem] font-bold transition-all text-lowercase mt-8 flex items-center justify-center gap-2 ${
              progress === 100
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-border-custom text-gray-custom cursor-not-allowed'
            }`}
          >
            submit profile & get matched →
          </button>
          
          <p className="text-center text-[0.78rem] text-gray-custom font-light">
            We'll review your profile within 48 hours and reach out when we find a match. 🔒
          </p>
        </div>
      </div>
    </div>
  );
};
