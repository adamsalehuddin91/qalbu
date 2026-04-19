const STORAGE_KEY = 'qalbu_bookmarks';

export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleBookmark(wisdom) {
  const bookmarks = getBookmarks();
  const exists = bookmarks.find((b) => b.id === wisdom.id);
  if (exists) {
    const updated = bookmarks.filter((b) => b.id !== wisdom.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return false;
  } else {
    bookmarks.unshift(wisdom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    return true;
  }
}

export function isBookmarked(id) {
  return getBookmarks().some((b) => b.id === id);
}

export default function BookmarkDrawer({ open, onClose }) {
  const bookmarks = getBookmarks();

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          open ? 'opacity-60' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute bottom-0 left-0 right-0 glass rounded-t-3xl p-6 transition-transform duration-300 max-h-[75vh] overflow-y-auto ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
        <h2 className="text-white/70 text-sm font-medium tracking-widest uppercase mb-4">
          Tersimpan
        </h2>

        {bookmarks.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            Tiada wisdom disimpan lagi.
          </p>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((w) => (
              <div key={w.id} className="glass rounded-xl p-4">
                <span className="text-xs text-amber-400/70 uppercase tracking-wider">
                  {w.category}
                </span>
                <p className="font-playfair italic text-white/80 text-base mt-1 leading-relaxed">
                  "{w.content}"
                </p>
                <p className="text-white/30 text-xs mt-2">— {w.source}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
