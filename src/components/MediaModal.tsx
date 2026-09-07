import { useState, useEffect, useCallback } from 'react';
import { X, Play, ExternalLink, ArrowLeft } from 'lucide-react';
import { VIDEO_CATALOGUE, type VideoEntry } from '../data/videoCatalogue';

function getThumbnailCandidates(videoId: string, override?: string) {
  if (override) return [override];
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
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

  const activeEntry = activeVideo
    ? VIDEO_CATALOGUE.find((v) => v.id === activeVideo)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto animate-modal-in">
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60 block mb-1">
                  Media
                </span>
                <h2 className="text-xl font-light text-starlight tracking-tight">
                  Webinars
                </h2>
              </div>
              <span className="mt-3.5 font-mono text-[10px] text-starlight/25 bg-white/[0.04] px-2 py-0.5 rounded-full">
                {VIDEO_CATALOGUE.length}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-starlight/40 hover:text-starlight hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            {activeVideo && activeEntry ? (
              <PlayerView
                videoId={activeVideo}
                title={activeEntry.title}
                onBack={() => setActiveVideo(null)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VIDEO_CATALOGUE.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={() => setActiveVideo(video.id)}
                  />
                ))}
              </div>
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
  const candidates = getThumbnailCandidates(video.id, video.thumbnail);
  const [srcIndex, setSrcIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-gold/20 transition-all duration-300">
      <div
        className="relative aspect-video cursor-pointer overflow-hidden"
        onClick={onPlay}
      >
        <img
          src={candidates[srcIndex]}
          alt={video.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgLoaded(false);
            setSrcIndex((i) => (i + 1 < candidates.length ? i + 1 : i));
          }}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-void-light animate-pulse" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center shadow-lg shadow-gold/20">
            <Play className="w-5 h-5 text-void fill-void ml-0.5" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-starlight tracking-tight line-clamp-2 leading-snug">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-[11px] text-starlight/35 mt-1.5 line-clamp-2 leading-relaxed">
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
  title,
  onBack,
}: {
  videoId: string;
  title: string;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/50 hover:text-gold transition-colors duration-200 mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to list
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
      <p className="mt-3 text-sm font-medium text-starlight/70 tracking-tight">
        {title}
      </p>
    </div>
  );
}
