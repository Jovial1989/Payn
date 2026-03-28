// ─── Status Bar ───

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-white">
      <span className="text-[11px] font-semibold tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="0.5" opacity="0.4" />
          <rect x="4" y="5" width="3" height="6" rx="0.5" opacity="0.6" />
          <rect x="8" y="3" width="3" height="8" rx="0.5" opacity="0.8" />
          <rect x="12" y="0" width="3" height="11" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
          <path d="M7 9.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" />
          <path d="M4.17 6.83a4 4 0 015.66 0" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M1.76 4.41a7 7 0 0110.48 0" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
          <rect x="0.5" y="0.5" width="19" height="10" rx="2" stroke="currentColor" fill="none" strokeWidth="0.8" opacity="0.4" />
          <rect x="20.5" y="3" width="1.5" height="5" rx="0.5" opacity="0.4" />
          <rect x="1.5" y="1.5" width="17" height="8" rx="1.2" />
        </svg>
      </div>
    </div>
  );
}

// ─── Bottom Navigation ───

function BottomNav({ active = 0 }: { active?: number }) {
  const items = [
    { label: "Home", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )},
    { label: "Explore", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )},
    { label: "Saved", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    )},
    { label: "Profile", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
  ];

  return (
    <div className="flex items-end justify-around px-2 pb-2 pt-1.5 backdrop-blur-md bg-[#0d1110]/90 border-t border-white/[0.06]">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col items-center gap-0.5 ${i === active ? "text-white" : "text-white/35"}`}
        >
          {item.icon}
          <span className="text-[9px] font-semibold">{item.label}</span>
        </div>
      ))}
      <div className="absolute bottom-1 left-1/2 h-1 w-[120px] -translate-x-1/2 rounded-full bg-current opacity-20" />
    </div>
  );
}

// ─── Static Screen: Shortlist ───

function ShortlistScreen() {
  const saved = [
    { provider: "Wise", badge: "Best for travel", badgeBg: "bg-emerald-900/30 text-emerald-400", fee: "EUR 2.10", speed: "Same day" },
    { provider: "Revolut", badge: "Lowest fees", badgeBg: "bg-blue-900/30 text-blue-400", fee: "EUR 0.00", speed: "Instant" },
    { provider: "N26", badge: "Best overall", badgeBg: "bg-amber-900/30 text-amber-400", fee: "EUR 1.50", speed: "1-2 days" },
  ];

  return (
    <div className="flex h-full flex-col bg-[#0d1110]">
      <StatusBar />
      {/* Dynamic island */}
      <div className="mx-auto mt-0.5 h-[26px] w-[100px] rounded-full bg-black" />

      <div className="flex-1 overflow-hidden px-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-white">Your shortlist</h3>
            <p className="mt-0.5 text-[11px] text-white/45">3 products saved</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="14" y2="18" />
            </svg>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5">
          {saved.map((item) => (
            <div
              key={item.provider}
              className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-3.5 py-3 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-[11px] font-bold text-white/70">
                  {item.provider.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{item.provider}</p>
                  <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold tabular-nums text-white/80">{item.fee}</p>
                <p className="text-[10px] text-white/35">{item.speed}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compare CTA */}
        <div className="mt-3 rounded-2xl bg-white/[0.05] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0d1110] bg-white/15 text-[8px] font-bold text-white">
                    {i + 1}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/50">Compare all 3</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-black">
              Compare
            </div>
          </div>
        </div>

        {/* Decision prompt */}
        <div className="mt-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-emerald-400">Best option found</p>
              <p className="text-[10px] text-white/40">Wise Transfer - ready to apply</p>
            </div>
            <div className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white">
              Apply
            </div>
          </div>
        </div>
      </div>

      <BottomNav active={2} />
    </div>
  );
}

// ─── Phone Device Frame ───

export function HeroPhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] max-w-[300px]">
      {/* Ambient glow behind device */}
      <div className="absolute -inset-12 rounded-full bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-blue-500/[0.06] blur-3xl" />

      {/* Device frame */}
      <div
        className="relative animate-float"
        style={{
          aspectRatio: "9 / 19.5",
          borderRadius: 44,
          background: "linear-gradient(145deg, #2a2a2a 0%, #111111 30%, #0a0a0a 100%)",
          padding: 6,
          boxShadow: [
            "0 25px 60px -12px rgba(0,0,0,0.35)",
            "0 12px 24px -8px rgba(0,0,0,0.25)",
            "inset 0 1px 0 rgba(255,255,255,0.1)",
            "inset 0 -1px 0 rgba(255,255,255,0.03)",
            "0 0 0 0.5px rgba(255,255,255,0.08)",
          ].join(", "),
          transform: "perspective(1200px) rotateY(-3deg) rotateX(2deg)",
        }}
      >
        {/* Side button accents */}
        <div className="absolute -right-[1px] top-[100px] h-[34px] w-[3px] rounded-r-full bg-gradient-to-b from-zinc-600 to-zinc-800" />
        <div className="absolute -right-[1px] top-[148px] h-[52px] w-[3px] rounded-r-full bg-gradient-to-b from-zinc-600 to-zinc-800" />
        <div className="absolute -left-[1px] top-[120px] h-[28px] w-[3px] rounded-l-full bg-gradient-to-b from-zinc-600 to-zinc-800" />

        {/* Screen */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: 38 }}
        >
          <ShortlistScreen />
        </div>

        {/* Glass reflection overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: 44,
            background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 30%, transparent 55%)",
          }}
        />

        {/* Top edge highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            borderRadius: "44px 44px 0 0",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          }}
        />
      </div>
    </div>
  );
}

// ─── App Store Buttons ───

export function AppStoreButton({ href = "/waitlist" }: { href?: string }) {
  return (
    <a
      href={href}
      className="group inline-flex h-[52px] items-center gap-3 rounded-[14px] bg-white px-5 transition-all hover:bg-white/90 hover:shadow-lg active:scale-[0.98]"
    >
      <svg width="22" height="26" viewBox="0 0 22 26" fill="black">
        <path d="M18.128 13.784c-.029-3.223 2.639-4.791 2.761-4.864-1.511-2.203-3.853-2.504-4.676-2.528-1.967-.207-3.875 1.177-4.877 1.177-1.016 0-2.543-1.157-4.199-1.123-2.121.034-4.112 1.263-5.199 3.188-2.255 3.886-.576 9.6 1.584 12.757 1.086 1.553 2.355 3.287 4.012 3.226 1.625-.067 2.232-1.036 4.193-1.036 1.943 0 2.513 1.036 4.207.997 1.744-.028 2.842-1.56 3.89-3.127 1.255-1.78 1.759-3.533 1.779-3.623-.041-.014-3.387-1.291-3.424-5.149-.003-.002-.05.076-.051.119zM14.928 3.306C15.819 2.207 16.424.756 16.26-.001c-1.244.052-2.79.852-3.684 1.907-.793.935-1.505 2.468-1.319 3.907 1.403.108 2.849-.7 3.671-2.507z" />
      </svg>
      <div className="border-l border-black/10 pl-3">
        <p className="text-[9px] font-medium leading-none text-black/60">Download on the</p>
        <p className="mt-0.5 text-[15px] font-semibold leading-none tracking-tight text-black">App Store</p>
      </div>
    </a>
  );
}

export function GooglePlayButton({ href = "/waitlist" }: { href?: string }) {
  return (
    <a
      href={href}
      className="group inline-flex h-[52px] items-center gap-3 rounded-[14px] border border-white/[0.12] bg-white/[0.06] px-5 transition-all hover:bg-white/[0.10] hover:shadow-lg active:scale-[0.98]"
    >
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
        <path d="M1.22 0.345C0.96 0.625 0.81 1.065 0.81 1.635v18.73c0 0.57 0.15 1.01 0.41 1.29l0.07 0.065 10.5-10.5v-0.24L1.29 0.28l-0.07 0.065z" fill="#4285F4" />
        <path d="M15.3 14.72l-3.51-3.5v-0.24l3.51-3.5 0.08 0.045 4.16 2.36c1.19 0.675 1.19 1.78 0 2.46l-4.16 2.36-0.08 0.02z" fill="#FBBC04" />
        <path d="M15.38 14.7L11.79 11.11 1.22 21.655c0.39 0.415 1.04 0.465 1.77 0.05l12.39-7.005z" fill="#EA4335" />
        <path d="M15.38 7.52L2.99 0.515C2.26 0.1 1.61 0.145 1.22 0.56L11.79 11.11l3.59-3.59z" fill="#34A853" />
      </svg>
      <div className="border-l border-white/10 pl-3">
        <p className="text-[9px] font-medium leading-none text-white/50">Get it on</p>
        <p className="mt-0.5 text-[15px] font-semibold leading-none tracking-tight text-white">Google Play</p>
      </div>
    </a>
  );
}

// ─── Waitlist Badge ───

export function WaitlistBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      <span className="text-[12px] font-semibold text-emerald-400">Early access open</span>
    </div>
  );
}
