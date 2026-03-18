import { useState, useEffect, useCallback } from 'react';
import { X, Play, ExternalLink } from 'lucide-react';

export interface VideoEntry {
  id: string;
  title: string;
  description?: string;
}

export const VIDEO_CATALOGUE: VideoEntry[] = [
  {
    id: 'jq_M1qDhKnw',
    title: 'From Source to Self: A Spiritual Exploration of ! God, Consciousness , Frequency and more',
    description: "A reflective exploration of God, consciousness, free will, spiritual growth, and the soul's journey beyond material life.",
  },
];

function getThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

function getWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export default function MediaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setActiveVideo(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeVideo) {
          setActiveVideo(null);
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, activeVideo, handleClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto animate-modal-in">
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60 block mb-1">
                Media
              </span>
              <h2 className="text-xl font-light text-starlight tracking-tight">
                Webinars
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-starlight/40 hover:text-starlight hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {activeVideo ? (
              <PlayerView
                videoId={activeVideo}
                onBack={() => setActiveVideo(null)}
              />
            ) : (
              VIDEO_CATALOGUE.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={() => setActiveVideo(video.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoCard({
  video,
  onPlay,
}: {
  video: VideoEntry;
  onPlay: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-gold/20 transition-all duration-300">
      <div className="relative aspect-video cursor-pointer overflow-hidden" onClick={onPlay}>
        <img
          src={getThumbnailUrl(video.id)}
          alt={video.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-void-light animate-pulse" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-lg shadow-gold/20">
            <Play className="w-6 h-6 text-void fill-void ml-0.5" />
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-starlight tracking-tight truncate">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs text-starlight/35 mt-1 line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>
        <a
          href={getWatchUrl(video.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 mt-0.5 text-starlight/30 hover:text-gold transition-colors duration-200"
          title="Open on YouTube"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function PlayerView({
  videoId,
  onBack,
}: {
  videoId: string;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/50 hover:text-gold transition-colors duration-200 mb-4"
      >
        &larr; Back to list
      </button>
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.06]">
        <iframe
          src={getEmbedUrl(videoId)}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
