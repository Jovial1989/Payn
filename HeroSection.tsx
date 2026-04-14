import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#050B09] pt-32 pb-24 md:pt-48 md:pb-32">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 -mr-48 -mt-48 h-[600px] w-[600px] rounded-full bg-[#2FA36B] opacity-5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-[400px] w-[400px] rounded-full bg-[#2563eb] opacity-5 blur-[100px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Content */}
          <div className="space-y-8">
            {/* Trust Chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#2FA36B] animate-pulse"></span>
              <span className="text-xs font-medium text-[#94A3B8] tracking-wide uppercase">Trusted by 50k+ Europeans</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Financial clarity <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#94A3B8]">in one place.</span>
            </h1>

            <p className="text-lg text-[#94A3B8] max-w-lg leading-relaxed">
              Compare loans, cards, and transfers from Europe's top regulated providers. No hidden fees. No bias. Just clear data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-[#2FA36B] hover:bg-[#268C5B] text-[#050B09] font-bold rounded-xl shadow-[0_0_20px_rgba(47,163,107,0.3)] hover:shadow-[0_0_30px_rgba(47,163,107,0.5)] transition-all transform hover:-translate-y-1">
                Compare Offers
              </button>
              <button className="px-8 py-4 bg-transparent border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all">
                How it works
              </button>
            </div>

            <div className="pt-8 flex items-center gap-6 border-t border-white/5">
              <div>
                <p className="text-2xl font-bold text-white">4.9/5</p>
                <p className="text-xs text-[#64748B] uppercase tracking-wider">User Rating</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">100+</p>
                <p className="text-xs text-[#64748B] uppercase tracking-wider">Partners</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual (CSS Mockup) */}
          <div className="relative hidden md:block">
            {/* Glass Card Mockup */}
            <div className="relative z-10 mx-auto w-80 h-[500px] rounded-[2.5rem] border border-white/10 bg-[#0F1614]/80 backdrop-blur-xl shadow-2xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-700 ease-out">
              {/* Screen Content */}
              <div className="w-full h-full rounded-3xl bg-[#050B09] overflow-hidden flex flex-col relative">
                 {/* Mock UI Header */}
                 <div className="h-24 bg-gradient-to-b from-[#2FA36B]/20 to-transparent p-4">
                    <div className="w-8 h-8 rounded-full bg-[#2FA36B]/20 mb-2"></div>
                    <div className="w-24 h-4 bg-white/10 rounded-full"></div>
                 </div>
                 
                 {/* Mock UI List */}
                 <div className="p-4 space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5 flex items-center px-3 gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                        <div className="space-y-1 flex-1">
                          <div className="w-20 h-2 bg-white/20 rounded-full"></div>
                          <div className="w-12 h-2 bg-white/10 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Mock Floating Button */}
                 <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 h-12 bg-[#2FA36B] rounded-xl flex items-center justify-center shadow-lg shadow-[#2FA36B]/20">
                    <div className="w-24 h-2 bg-[#050B09]/50 rounded-full"></div>
                 </div>
              </div>
            </div>

            {/* Decorative Element Behind */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full z-0 animate-[spin_10s_linear_infinite]" />
          </div>

        </div>
      </div>
    </section>
  );
};