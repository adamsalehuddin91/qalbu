import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in'); // in → hold → out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        backgroundColor: '#0a0c10',
        opacity: phase === 'out' ? 0 : 1,
      }}
    >
      {/* Glow ring */}
      <div
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: phase === 'in' ? '80px' : '200px',
          height: phase === 'in' ? '80px' : '200px',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Logo */}
      <div
        className="relative flex flex-col items-center gap-3 transition-all duration-700"
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'translateY(16px)' : 'translateY(0)',
        }}
      >
        {/* Arabic calligraphy-inspired icon */}
        <div
          className="text-6xl font-playfair italic"
          style={{ color: '#f59e0b' }}
        >
          ق
        </div>

        <div className="flex flex-col items-center gap-1">
          <span
            className="text-2xl font-medium tracking-widest"
            style={{ color: '#f59e0b' }}
          >
            Qalbu
          </span>
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Siraman Rohani Harian
          </span>
        </div>
      </div>

      {/* Loading dots */}
      <div
        className="absolute bottom-20 flex gap-1.5 transition-opacity duration-500"
        style={{ opacity: phase === 'hold' ? 1 : 0 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{
              backgroundColor: '#f59e0b',
              animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
