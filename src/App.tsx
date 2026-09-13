import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { ImageGrid } from './components/ImageGrid';
import { ImageViewer } from './components/ImageViewer';
import { UploadInterface } from './components/UploadInterface';

const MainContent: React.FC = () => {
  const { activeTab, images } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f3f1] text-[#0f0e0d] w-full overflow-x-hidden">
      <Navigation />

      <main className="flex-1 w-full pb-16 sm:pb-20">
        {/* DISCOVER VIEW: Immediate gallery entrance without hero text or categories */}
        {activeTab === 'discover' && (
          <div className="w-full max-w-[1560px] mx-auto px-3.5 sm:px-6 md:px-12 pt-4 sm:pt-6 md:pt-10 animate-fade-in">
            <ImageGrid images={images} />
          </div>
        )}

        {/* UPLOAD VIEW: Dedicated minimal submission */}
        {activeTab === 'upload' && <UploadInterface />}
      </main>

      {/* Gallery-Like ImageViewer Modal */}
      <ImageViewer />

      {/* Editorial Colophon / Footer */}
      <footer className="w-full border-t border-black/[0.06] py-6 sm:py-8 px-4 sm:px-6 md:px-12 bg-[#f5f3f1]">
        <div className="max-w-[1560px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="type-footer-heading text-[#0f0e0d]">see.img</span>
            <span className="type-footer-secondary">—</span>
            <span className="type-footer-secondary">Open Visual Archive</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5">
            <span className="type-footer-link text-[#766f6a]">Discover • Upload • View</span>
            <span className="type-footer-secondary">Permanent Collection</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
