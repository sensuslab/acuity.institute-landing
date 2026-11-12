import { useEffect, useRef, useState } from 'react';

const prefix = 'acuity.library.saved.v1.';

function readBookmarks() {
  const ids = new Set<string>();
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix)) ids.add(key.slice(prefix.length));
    }
    return { ids, available: true };
  } catch {
    return { ids, available: false };
  }
}

export function useReadingList() {
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const current = useRef(bookmarks);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && !event.key.startsWith(prefix)) return;
      const latest = readBookmarks();
      if (latest.available && current.current.available) {
        current.current = latest;
        setBookmarks(latest);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleBookmark = (id: string) => {
    const latest = current.current.available ? readBookmarks() : current.current;
    const ids = new Set(latest.available ? latest.ids : current.current.ids);
    const key = prefix + id;
    const saved = ids.delete(id);
    if (!saved) ids.add(id);
    let available = latest.available;
    if (available) {
      try {
        if (saved) localStorage.removeItem(key);
        else localStorage.setItem(key, '1');
      } catch {
        available = false;
      }
    }
    current.current = { ids, available };
    setBookmarks(current.current);
  };

  return { savedIds: bookmarks.ids, canSave: bookmarks.available, toggleBookmark };
}
