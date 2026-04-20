import SearchForm from './train-search/SearchForm';
import { useTrainContext } from "../context/Context";

/* ── Right-panel: How it works ───────────────────────────────── */
const InfoPanel = () => (
  <div className="flex flex-col items-center justify-center h-full px-10 text-center select-none">
    {/* SVG train illustration */}
    <svg viewBox="0 0 480 280" className="w-full max-w-sm mb-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="200" rx="20" fill="url(#skyGrad)" />
      <polygon points="0,180 80,90 160,180" fill="#e0e7ff" opacity="0.6"/>
      <polygon points="80,180 180,70 280,180" fill="#c7d2fe" opacity="0.7"/>
      <polygon points="200,180 320,80 420,180" fill="#e0e7ff" opacity="0.5"/>
      <polygon points="340,180 440,100 480,180" fill="#c7d2fe" opacity="0.6"/>
      <rect y="175" width="480" height="30" fill="#f1f5f9" />
      <rect y="198" width="480" height="4" rx="2" fill="#cbd5e1"/>
      <rect y="202" width="480" height="4" rx="2" fill="#cbd5e1"/>
      {[20,60,100,140,180,220,260,300,340,380,420,460].map((x,i) => (
        <rect key={i} x={x} y="195" width="16" height="14" rx="2" fill="#94a3b8" opacity="0.7"/>
      ))}
      <rect x="60" y="118" width="280" height="72" rx="14" fill="url(#trainGrad)" />
      <rect x="68" y="118" width="264" height="8" rx="8" fill="#2249f1" opacity="0.3"/>
      {[85, 140, 195, 250, 305].map((x, i) => (
        <rect key={i} x={x} y="134" width="36" height="26" rx="6" fill="url(#windowGrad)" />
      ))}
      <rect x="340" y="106" width="80" height="84" rx="12" fill="url(#cabGrad)" />
      <rect x="350" y="116" width="30" height="22" rx="6" fill="url(#windowGrad)" />
      <rect x="386" y="116" width="24" height="22" rx="6" fill="url(#windowGrad)" />
      <circle cx="416" cy="162" r="8" fill="#fef9c3" />
      <circle cx="416" cy="162" r="5" fill="#fbbf24" />
      {[90, 150, 210, 270, 330, 370, 410].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="192" r="13" fill="#475569" />
          <circle cx={cx} cy="192" r="8" fill="#64748b" />
          <circle cx={cx} cy="192" r="3.5" fill="#94a3b8" />
        </g>
      ))}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef2ff"/>
          <stop offset="100%" stopColor="#e0f2fe"/>
        </linearGradient>
        <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1e40af"/>
        </linearGradient>
        <linearGradient id="cabGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8"/>
          <stop offset="100%" stopColor="#1e3a8a"/>
        </linearGradient>
        <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe"/>
          <stop offset="100%" stopColor="#93c5fd"/>
        </linearGradient>
      </defs>
    </svg>

    <h2 className="text-xl font-bold text-surface-900 mb-1">Easy Booking</h2>
    <p className="text-surface-400 text-xs mb-6 max-w-xs">Three simple steps to secure your train reservation</p>

    <div className="flex flex-col gap-4 text-left w-full max-w-xs">
      {[
        { step: '01', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', title: 'Search Trains', desc: 'Enter origin, destination and travel date to find available trains.' },
        { step: '02', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', title: 'Select & Book', desc: 'Pick your preferred class and initiate the booking process.' },
        { step: '03', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', title: 'Scan & Pay', desc: 'Complete your payment instantly by scanning the generated QR code.' },
      ].map(item => (
        <div key={item.step} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-surface-700">{item.title}</p>
            <p className="text-xs text-surface-400 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8 flex items-center gap-5">
      {[
        { value: '50K+', label: 'Tickets Booked' },
        { value: '1000+', label: 'Routes' },
        { value: '4.9★', label: 'Rating' },
      ].map(stat => (
        <div key={stat.label} className="text-center">
          <p className="text-base font-bold text-primary-600">{stat.value}</p>
          <p className="text-[11px] text-surface-400">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const Hero = () => {
  return (
    <div className="flex h-full w-full">
      {/* Left: vertically stacked search form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-8 overflow-y-auto border-r border-surface-200/50">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="mb-5 font-bold font-display text-surface-900 leading-tight">Book Your Next <br/><span className="text-primary-600">Train Journey</span></h1>
          <SearchForm inline />
        </div>
      </div>

      {/* Right: illustration + how it works (desktop only) */}
      <div className="hidden lg:flex w-1/2 h-full flex-col overflow-hidden bg-gradient-to-br from-primary-50/40 via-white to-accent-50/30">
        <InfoPanel />
      </div>
    </div>
  );
};

export default Hero;
