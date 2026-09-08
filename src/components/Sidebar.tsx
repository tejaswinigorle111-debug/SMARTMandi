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
}

export const Sidebar: React.FC<SidebarProps> = ({ language, isOpen, onClose, onGoHome, onOpenFarmerLogin, onOpenBuyerLogin }) => {
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
