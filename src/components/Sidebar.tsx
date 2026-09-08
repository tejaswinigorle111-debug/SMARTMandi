import React, { useEffect, useRef } from 'react';
import { Home, User, Store, X } from 'lucide-react';

import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onOpenFarmerLogin: () => void;
  onOpenBuyerLogin: () => void;
  onScrollToInput?: () => void;
  onRequireAuth?: () => void;
  isAuthenticated?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  language, isOpen, onClose, onGoHome, onOpenFarmerLogin, onOpenBuyerLogin,
  onScrollToInput, onRequireAuth, isAuthenticated 
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Add event listener when drawer is open
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside 
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#CFDFD1]">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { onGoHome(); onClose(); }}>
            <span className="text-2xl font-black tracking-tight text-stone-950 font-display">
              SMART<span className="text-[#165B33]">Mandi</span>
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 -mr-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { onGoHome(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>{t.nav.home}</span>
          </button>
          
          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span>{t.sidebar.dashboard}</span>
          </button>

          <button 
            onClick={() => { if (onScrollToInput) onScrollToInput(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{t.sidebar.findBestMarket}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            <span>{t.sidebar.marketIntelligence}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>
            <span>{t.sidebar.buyerOpportunities}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span>{t.sidebar.myOrders}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>{t.sidebar.fpo}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            <span>{t.sidebar.transactions}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span>{t.sidebar.notifications}</span>
          </button>

          <button 
            onClick={() => { if (isAuthenticated) onGoHome(); else if (onRequireAuth) onRequireAuth(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>{t.sidebar.profileSettings}</span>
          </button>

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-black uppercase tracking-wider text-stone-400">Authentication</p>
          </div>
          
          <button 
            onClick={() => { onOpenFarmerLogin(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <User className="w-5 h-5" />
            <span>{t.auth.farmerLogin}</span>
          </button>
          <button 
            onClick={() => { onOpenBuyerLogin(); onClose(); }} 
            className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-[#E5F5E9] hover:text-[#165B33] font-bold rounded-xl transition-colors"
          >
            <Store className="w-5 h-5" />
            <span>{t.auth.buyerLogin}</span>
          </button>
        </nav>
      </aside>
    </>
  );
};
