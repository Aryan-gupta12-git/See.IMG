import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 ${
        scrolled
          ? 'bg-[#f5f3f1]/92 backdrop-blur-md border-b border-black/[0.05]'
          : 'bg-[#f5f3f1]'
      }`}
    >
      <div className="w-full max-w-[1560px] mx-auto px-3.5 sm:px-6 md:px-12 h-14 sm:h-16 relative flex items-center justify-between">
        {/* Left: Logo */}
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-1.5 sm:gap-2 group text-left focus:outline-none shrink-0"
        >
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#0f0e0d] flex items-center justify-center transition-transform duration-200 group-hover:scale-95">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5f3f1]" />
          </div>
          <span className="type-logo text-[#0f0e0d]">
            see<span className="text-[#766f6a] font-normal">.img</span>
          </span>
        </button>

        {/* Center: Discovery (visually and geometrically centered) */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center" aria-label="Primary Navigation">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`relative type-nav text-[12px] sm:text-[13px] transition-colors duration-150 ${
              activeTab === 'discover'
                ? 'text-[#0f0e0d]'
                : 'text-[#766f6a] hover:text-[#0f0e0d]'
            }`}
          >
            Discovery
            {activeTab === 'discover' && (
              <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#0f0e0d] rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Upload Image Button (hidden when on the upload page) */}
        {activeTab !== 'upload' && (
          <div className="flex items-center shrink-0 animate-fade-in">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="type-button text-[#0f0e0d] bg-white border border-[#e5e3df] hover:border-black/25 hover:bg-[#faf9f7] active:bg-[#f5f3f1] rounded-full px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] transition-all duration-150 inline-flex items-center gap-1 sm:gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2] shrink-0" />
              <span className="hidden sm:inline">Upload Image</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
