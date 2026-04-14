import React from 'react';

interface OfferCardProps {
  providerName: string;
  providerLogoUrl?: string;
  badgeText?: string;
  mainMetric: { label: string; value: string };
  secondaryMetric: { label: string; value: string };
  features: string[];
  applyUrl: string;
  termsText: string;
  onExpandDetails?: () => void;
}

/**
 * Core Marketplace Component
 * RE-ARCHITECTED: Premium Fintech Comparison Card
 * Style: Dark Theme (#050B09), CreditPay Green (#2FA36B), Glass Effects
 */
export const OfferCard: React.FC<OfferCardProps> = ({
  providerName,
  providerLogoUrl,
  badgeText,
  mainMetric,
  secondaryMetric,
  features,
  applyUrl,
  termsText,
  onExpandDetails
}) => {
  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0F1614] shadow-2xl transition-all duration-300 hover:border-[#2FA36B]/50 hover:shadow-[0_0_30px_-10px_rgba(47,163,107,0.3)]">
      
      {/* Top Badge (Optional) */}
      {badgeText && (
        <div className="absolute top-0 right-0 z-10">
          <div className="rounded-bl-2xl bg-[#2FA36B] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#050B09] shadow-lg">
            {badgeText}
          </div>
        </div>
      )}

      <div className="flex flex-col p-6 md:flex-row md:items-center md:gap-8">
        
        {/* 1. Provider Identity */}
        <div className="mb-6 flex flex-shrink-0 items-center gap-4 md:mb-0 md:w-1/4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-inner">
            {providerLogoUrl ? (
              <img 
                src={providerLogoUrl} 
                alt={`${providerName} logo`} 
                className="h-full w-full object-contain" 
              />
            ) : (
              <span className="text-2xl font-bold text-black">{providerName.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white">{providerName}</h3>
            <div className="flex items-center gap-2">
               {/* Trust Pill */}
              <span className="inline-flex items-center rounded-full bg-[#2FA36B]/10 px-2 py-0.5 text-[10px] font-medium text-[#2FA36B] border border-[#2FA36B]/20">
                Verified Partner
              </span>
            </div>
          </div>
        </div>

        {/* 2. Comparison Metrics & Features */}
        <div className="grid flex-grow grid-cols-2 gap-6 border-t border-white/5 py-6 md:grid-cols-3 md:border-l md:border-r md:border-t-0 md:py-0 md:px-8">
          
          {/* Key Metrics */}
          <div className="col-span-2 md:col-span-2 flex items-center justify-between md:justify-start md:gap-12">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">{mainMetric.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white">{mainMetric.value}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">{secondaryMetric.label}</p>
              <p className="mt-1 text-xl font-medium text-[#2FA36B]">{secondaryMetric.value}</p>
            </div>
          </div>

          {/* Features List (Hidden on small mobile, visible on desktop) */}
          <div className="col-span-2 md:col-span-1 hidden md:flex items-center">
             <ul className="space-y-2">
               {features.slice(0, 3).map((feature, i) => (
                 <li key={i} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                   <div className="flex h-1.5 w-1.5 rounded-full bg-[#2FA36B] shadow-[0_0_8px_rgba(47,163,107,0.8)]" />
                   <span className="truncate max-w-[140px]">{feature}</span>
                 </li>
               ))}
               {features.length > 3 && (
                 <li className="text-[10px] text-[#64748B] pl-3.5">+ {features.length - 3} more benefits</li>
               )}
             </ul>
          </div>
        </div>

        {/* 3. Call to Action */}
        <div className="mt-2 md:mt-0 flex flex-col gap-3 md:w-48">
          <a 
            href={applyUrl}
            className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-[#2FA36B] py-3.5 px-4 text-sm font-bold text-[#050B09] transition-all hover:bg-[#268C5B] hover:shadow-[0_0_20px_rgba(47,163,107,0.4)]"
            aria-label={`Apply for ${providerName}`}
          >
            <span className="relative z-10 flex items-center gap-2">
              Check Offer
              <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </a>
          <button 
            onClick={onExpandDetails}
            className="w-full text-xs font-semibold uppercase tracking-wide text-[#64748B] transition-colors hover:text-white"
          >
            View Details
          </button>
        </div>
      </div>

      {/* 4. Compliance Footer */}
      <div className="border-t border-white/5 bg-[#050B09]/50 px-6 py-3 backdrop-blur-sm">
        <p className="text-[10px] leading-relaxed text-[#64748B]">
          <span className="font-bold text-[#94A3B8]">Representative Example:</span> {termsText}
        </p>
      </div>
    </div>
  );
};
                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                   <span className="truncate">{feature}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* 3. Call to Action */}
        <div className="flex flex-col gap-3 md:w-48">
          <a 
            href={applyUrl}
            className="flex w-full items-center justify-center rounded-lg bg-emerald-500 py-3 px-4 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/40 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label={`Apply for ${providerName}`}
          >
            Check Offer
          </a>
          <button 
            onClick={onExpandDetails}
            className="group/btn flex w-full items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-emerald-400"
          >
            View Details
            <svg className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. Compliance Footer */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-6 py-3">
        <p className="text-[10px] leading-relaxed text-slate-500">
          <span className="font-bold text-slate-400">Representative Example:</span> {termsText}
        </p>
      </div>
    </div>
  );
};