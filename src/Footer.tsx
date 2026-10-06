import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-[#C9C3B8] bg-[#F4F0E8] mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Brand Left */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-medium tracking-[-0.03em] text-[#171715]">
                S:19
              </span>
            </div>
            <span className="block text-[10px] tracking-[0.3em] font-medium uppercase text-[#6D6A63]">
              SKINLABS
            </span>
            <p className="text-sm text-[#6D6A63] max-w-md pt-2 leading-relaxed">
              Skincare with intention. Your skin is allowed to change. We believe your skincare should understand that.
            </p>
          </div>

          {/* Center Links */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-[#6D6A63] font-medium block mb-3">
              Explore
            </span>
            <ul className="space-y-2 text-sm text-[#171715]">
              <li>
                <button
                  onClick={() => navigate('/find-phase')}
                  className="hover:text-[#C86D51] transition-colors cursor-pointer"
                >
                  Find your skin phase
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/chat')}
                  className="inline-flex items-center gap-1 hover:text-[#C86D51] transition-colors cursor-pointer"
                >
                  S.19 AI consultation <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Disclaimers & Ethics */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-[#6D6A63] font-medium block mb-3">
              Formulation Notice
            </span>
            <p className="text-xs text-[#6D6A63] leading-relaxed">
              S.19 active percentages represent hero actives. Formulations are dermatologically evaluated. Information provided does not replace medical advice.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-[#C9C3B8]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6D6A63]">
          <div>&copy; {new Date().getFullYear()} S.19 SKINLABS. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Clinical Intention</span>
            <span>&bull;</span>
            <span>Adaptive Skin Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
