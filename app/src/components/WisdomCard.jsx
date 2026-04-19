const CATEGORY_COLOR = {
  Tawakal: '#60a5fa', // blue
  Sabar:   '#a78bfa', // purple
  Rezeki:  '#34d399', // green
  Syukur:  '#f59e0b', // amber
};

export default function WisdomCard({ wisdom, visible }) {
  if (!wisdom) return null;

  const accentColor = CATEGORY_COLOR[wisdom.category] || '#f59e0b';

  return (
    <div
      className={`w-full max-w-sm mx-4 transition-opacity duration-500 ${
        visible ? 'fade-in opacity-100' : 'opacity-0'
      }`}
    >
      <div className="glass rounded-3xl overflow-hidden">

        {/* Category header bar */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${accentColor}22` }}
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {wisdom.category}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {wisdom.source}
          </span>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">

          {/* Arabic text */}
          {wisdom.arabic_text && (
            <div className="text-center">
              <p
                className="text-xl leading-loose"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: 'Georgia, serif',
                  direction: 'rtl',
                }}
              >
                {wisdom.arabic_text}
              </p>
            </div>
          )}

          {/* Divider */}
          {wisdom.arabic_text && (
            <div
              className="h-px w-16 mx-auto rounded-full"
              style={{ backgroundColor: `${accentColor}44` }}
            />
          )}

          {/* BM content */}
          <div>
            <p
              className="font-playfair italic text-lg leading-relaxed text-center"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              "{wisdom.content}"
            </p>
          </div>

          {/* Maksud */}
          {wisdom.meaning && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: accentColor }}
              >
                Maksud
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {wisdom.meaning}
              </p>
            </div>
          )}

          {/* Pengajaran */}
          {wisdom.lesson && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: accentColor }}
              >
                Pengajaran
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {wisdom.lesson}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
