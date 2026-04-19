import { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import WisdomCard from './components/WisdomCard';
import BookmarkDrawer, { toggleBookmark, isBookmarked } from './components/BookmarkDrawer';
import { shareWisdom } from './components/ShareEngine';
import './index.css';

const FALLBACK = {
  id: 0,
  content: 'Sesungguhnya bersama kesulitan ada kemudahan.',
  arabic_text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
  meaning: 'Setiap kesukaran yang datang dalam hidup kita, Allah telah menyediakan kemudahan di sebaliknya. Ini bukan janji yang kosong — ini adalah kepastian dari Allah.',
  lesson: 'Jangan berhenti di tengah ujian. Kemudahan itu datang bersama kesukaran, bukan selepasnya. Teruskan melangkah dengan penuh keyakinan.',
  source: 'Al-Quran (94:6)',
  category: 'Sabar',
  language: 'ms',
  tags: null,
};

const CATEGORIES = ['Semua', 'Tawakal', 'Sabar', 'Rezeki', 'Syukur'];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [wisdom, setWisdom] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');

  const fetchWisdom = useCallback(async (category) => {
    setVisible(false);
    setLoading(true);
    try {
      const url = category && category !== 'Semua'
        ? `/api/v1/wisdom/random?category=${category}`
        : '/api/v1/wisdom/random';
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setTimeout(() => {
        setWisdom(data);
        setBookmarked(isBookmarked(data.id));
        setVisible(true);
      }, 300);
    } catch {
      setTimeout(() => {
        setWisdom(FALLBACK);
        setBookmarked(false);
        setVisible(true);
      }, 300);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) fetchWisdom(activeCategory);
  }, [showSplash, fetchWisdom, activeCategory]);

  function handleBookmark() {
    if (!wisdom) return;
    const saved = toggleBookmark(wisdom);
    setBookmarked(saved);
  }

  function handleCategory(cat) {
    setActiveCategory(cat);
    fetchWisdom(cat);
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <div
        className="min-h-svh flex flex-col"
        style={{ backgroundColor: '#0a0c10' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-10 pb-4">
          <div>
            <span style={{ color: '#f59e0b' }} className="font-medium tracking-widest text-lg">
              Qalbu
            </span>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Siraman Rohani Harian
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="transition-colors p-2"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            aria-label="Bookmarks"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all"
              style={
                activeCategory === cat
                  ? { backgroundColor: '#f59e0b', color: '#0a0c10' }
                  : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Card — scrollable */}
        <div className="flex-1 overflow-y-auto px-0 pb-4">
          {loading && !wisdom ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-8 h-8 rounded-full animate-spin"
                style={{ border: '2px solid rgba(245,158,11,0.3)', borderTopColor: '#f59e0b' }}
              />
            </div>
          ) : (
            <WisdomCard wisdom={wisdom} visible={visible} />
          )}
        </div>

        {/* Actions — sticky bottom */}
        <div
          className="sticky bottom-0 px-6 py-4 flex flex-col gap-3"
          style={{ backgroundColor: '#0a0c10', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex gap-3 justify-center">
            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className="glass rounded-full p-3 transition-colors"
              style={{ color: bookmarked ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}
              aria-label="Bookmark"
            >
              <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>

            {/* Share */}
            <button
              onClick={() => wisdom && shareWisdom(wisdom)}
              className="glass rounded-full p-3 transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-label="Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>

          {/* TERUSKAN */}
          <button
            onClick={() => fetchWisdom(activeCategory)}
            disabled={loading}
            className="w-full glass rounded-2xl py-4 font-medium tracking-widest uppercase text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ color: '#f59e0b' }}
          >
            {loading ? '...' : 'Teruskan'}
          </button>
        </div>
      </div>

      <BookmarkDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
