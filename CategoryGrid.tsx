import React from 'react';
import Link from 'next/link';

const categories = [
  {
    id: 'loans',
    label: 'Personal Loans',
    sub: 'Rates from 3.5%',
    icon: (
      <svg className="w-6 h-6 text-[#2FA36B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'cards',
    label: 'Credit Cards',
    sub: 'Up to 55 days interest-free',
    icon: (
      <svg className="w-6 h-6 text-[#2FA36B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  {
    id: 'transfers',
    label: 'Money Transfers',
    sub: 'Zero hidden fees',
    icon: (
      <svg className="w-6 h-6 text-[#2FA36B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    id: 'exchange',
    label: 'Currency Exchange',
    sub: 'Real market rates',
    icon: (
      <svg className="w-6 h-6 text-[#2FA36B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }
];

export const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {categories.map((cat) => (
        <Link key={cat.id} href={`/${cat.id}`} className="group relative overflow-hidden p-6 rounded-2xl bg-[#0F1614] border border-white/5 hover:border-[#2FA36B]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2FA36B]/10">
          <div className="mb-4 p-3 bg-white/5 w-fit rounded-xl group-hover:bg-[#2FA36B]/20 transition-colors">{cat.icon}</div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#2FA36B] transition-colors">{cat.label}</h3>
          <p className="text-sm text-[#64748B]">{cat.sub}</p>
        </Link>
      ))}
    </div>
  );
};