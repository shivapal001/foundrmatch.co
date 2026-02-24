/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Waitlist } from './pages/Waitlist';
import { ProfileForm } from './pages/ProfileForm';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';
import { UserMatches } from './pages/UserMatches';
import { TeamRequestForm } from './components/TeamRequestForm';
import { Toast, ToastMessage } from './components/Toast';
import { initAnalytics, auth, signInAnonymously } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Menu, X as CloseIcon, LogOut, User as UserIcon, Briefcase, Home, ClipboardList, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    initAnalytics();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          await signInAnonymously(auth);
          // The next onAuthStateChanged will handle setting the user and loading state
          return;
        } catch (err) {
          console.error("Anonymous sign-in failed:", err);
          setAuthLoading(false);
        }
      } else {
        setUser(currentUser);
        setAuthLoading(false);
      }
      
      if (currentUser && currentPage === 'auth') {
        setCurrentPage('landing');
      }
    });

    return () => unsubscribe();
  }, [currentPage]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully', 'info');
      navigate('landing');
    } catch (error) {
      showToast('Error signing out', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-display text-xl animate-pulse">foundrmatch</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={navigate} user={user} showToast={showToast} />;
      case 'waitlist':
        return <Waitlist onNavigate={navigate} showToast={showToast} />;
      case 'profile':
        return user ? <ProfileForm user={user} onNavigate={navigate} showToast={showToast} /> : <Auth showToast={showToast} />;
      case 'matches':
        return user ? <UserMatches user={user} onNavigate={navigate} showToast={showToast} /> : <Auth showToast={showToast} />;
      case 'hire':
        return <TeamRequestForm onNavigate={navigate} showToast={showToast} />;
      case 'admin':
        return <Admin onNavigate={navigate} showToast={showToast} />;
      case 'auth':
        return <Auth showToast={showToast} />;
      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 lg:px-10 py-5 flex items-center justify-between bg-black/95 backdrop-blur-xl border-b border-border-custom">
        <div 
          className="font-display text-[1.1rem] font-extrabold tracking-[-0.3px] text-lowercase cursor-pointer"
          onClick={() => navigate('landing')}
        >
          foundr<span className="text-gray-custom">match</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => navigate('landing')}
            className="px-3 sm:px-4 py-2 text-[0.85rem] text-gray-custom hover:text-white transition-colors text-lowercase"
          >
            home
          </button>
          <button 
            onClick={() => navigate('waitlist')}
            className="px-3 sm:px-4 py-2 text-[0.85rem] text-gray-custom hover:text-white transition-colors text-lowercase"
          >
            waitlist
          </button>
          <button 
            onClick={() => navigate('hire')}
            className="px-3 sm:px-4 py-2 text-[0.85rem] text-gray-custom hover:text-white transition-colors text-lowercase"
          >
            hire
          </button>
          <button 
            onClick={() => navigate(user ? 'profile' : 'auth')}
            className="px-3 sm:px-4 py-2 text-[0.85rem] text-gray-custom hover:text-white transition-colors text-lowercase"
          >
            profile
          </button>
          <button 
            onClick={() => navigate(user ? 'matches' : 'auth')}
            className="px-3 sm:px-4 py-2 text-[0.85rem] text-gray-custom hover:text-white transition-colors text-lowercase"
          >
            matches
          </button>
          <button 
            onClick={() => navigate('admin')}
            className="ml-2 px-4 py-2 border border-border-custom text-white text-[0.85rem] font-semibold hover:border-white transition-colors text-lowercase"
          >
            admin ↗
          </button>
          {user ? (
            <button 
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-white/5 border border-border-custom text-gray-custom text-[0.85rem] font-semibold hover:text-white hover:border-white transition-colors text-lowercase"
            >
              logout
            </button>
          ) : (
            <button 
              onClick={() => navigate('auth')}
              className="ml-2 px-4 py-2 bg-white text-black text-[0.85rem] font-bold hover:bg-gray-200 transition-colors text-lowercase"
            >
              sign in
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-custom hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[999] bg-black transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="pt-32 px-6 flex flex-col gap-8">
          <button onClick={() => navigate('landing')} className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase">
            <Home className="w-6 h-6 text-gray-custom" /> home
          </button>
          <button onClick={() => navigate('waitlist')} className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase">
            <ClipboardList className="w-6 h-6 text-gray-custom" /> waitlist
          </button>
          <button onClick={() => navigate('hire')} className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase">
            <Briefcase className="w-6 h-6 text-gray-custom" /> hire talent
          </button>
          <button onClick={() => navigate(user ? 'profile' : 'auth')} className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase">
            <UserIcon className="w-6 h-6 text-gray-custom" /> profile
          </button>
          <button onClick={() => navigate(user ? 'matches' : 'auth')} className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase">
            <Briefcase className="w-6 h-6 text-gray-custom" /> matches
          </button>
          <button onClick={() => navigate('admin')} className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase">
            <Shield className="w-6 h-6 text-gray-custom" /> admin panel
          </button>
          <div className="mt-8 pt-8 border-t border-border-custom">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 text-2xl font-display font-bold text-lowercase text-red-500"
              >
                <LogOut className="w-6 h-6" /> logout
              </button>
            ) : (
              <button 
                onClick={() => navigate('auth')}
                className="w-full py-4 bg-white text-black font-bold text-xl text-lowercase"
              >
                sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pages */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

