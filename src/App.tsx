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
import { Toast, ToastMessage } from './components/Toast';
import { initAnalytics, auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    initAnalytics();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
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
        return <Landing onNavigate={navigate} />;
      case 'waitlist':
        return <Waitlist onNavigate={navigate} showToast={showToast} />;
      case 'profile':
        return user ? <ProfileForm user={user} onNavigate={navigate} showToast={showToast} /> : <Auth showToast={showToast} />;
      case 'matches':
        return user ? <UserMatches user={user} onNavigate={navigate} showToast={showToast} /> : <Auth showToast={showToast} />;
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
        <div className="flex items-center gap-1 sm:gap-2">
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
      </nav>

      {/* Pages */}
      <main>
        {renderPage()}
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

