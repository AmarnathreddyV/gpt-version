import React, { useState } from 'react';
import { ArrowUpRight, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, navigate, hasActiveSession }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F4F0E8]/95 backdrop-blur-sm border-b border-[#C9C3B8] h-[84px] transition-all">
      <div className="max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        
        {/* LEFT: S.19 SKINLABS Brand */}
        <button
          onClick={() => {
            navigate('/');
            setMobileMenuOpen(false);
          }}
          className="text-left group focus:outline-none cursor-pointer"
          aria-label="S.19 SKINLABS Home"
        >
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#171715] group-hover:opacity-80 transition-opacity">
              S:19
            </span>
          </div>
          <span className="block text-[9px] sm:text-[10px] tracking-[0.3em] font-medium uppercase text-[#6D6A63] -mt-1 group-hover:text-[#171715] transition-colors">
            SKINLABS
          </span>
        </button>

        {/* CENTER: Find your phase */}
        <nav className="hidden md:flex items-center justify-center">
          <button
            onClick={() => navigate('/find-phase')}
            className={`text-sm tracking-wide transition-all cursor-pointer relative py-2 px-3 ${
              currentRoute === '/find-phase' || currentRoute === '/assessment'
                ? 'text-[#171715] font-medium'
                : 'text-[#6D6A63] hover:text-[#171715]'
            }`}
          >
            Find your phase
            {(currentRoute === '/find-phase' || currentRoute === '/assessment') && (
              <span className="absolute bottom-0 left-3 right-3 h-[1px] bg-[#171715]" />
            )}
          </button>
        </nav>

        {/* RIGHT: AI assistant ↗ */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate('/chat')}
            className={`group inline-flex items-center gap-1.5 text-xs sm:text-sm tracking-wider uppercase font-medium transition-colors cursor-pointer py-1.5 px-3 rounded-full border ${
              currentRoute === '/chat'
                ? 'bg-[#171715] text-[#F4F0E8] border-[#171715]'
                : 'bg-transparent text-[#171715] border-[#C9C3B8] hover:border-[#171715]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
              AI assistant
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 text-[#171715] hover:text-[#C86D51] transition-colors"
            title="AI Assistant"
          >
            <Sparkles className="w-5 h-5 text-[#C86D51]" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#171715] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F4F0E8] border-b border-[#C9C3B8] px-6 py-6 space-y-4 shadow-sm">
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#171715]"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate('/find-phase');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#171715]"
          >
            Find your phase
          </button>
          <button
            onClick={() => {
              navigate('/chat');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between w-full py-2.5 px-4 text-sm uppercase tracking-wider font-medium bg-[#171715] text-[#F4F0E8] rounded-full"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C86D51]" />
              AI assistant
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
