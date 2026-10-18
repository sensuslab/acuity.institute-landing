import { useEffect, useRef, useState } from 'react';

export function useReaderDialog(onClose: () => void) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  useEffect(() => {
    const element = dialog.current; element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const changed = () => setFullscreen(document.fullscreenElement === element);
    document.addEventListener('fullscreenchange',changed);
    return () => {
      document.removeEventListener('fullscreenchange',changed);
      if (document.fullscreenElement === element) void document.exitFullscreen().catch(()=>{});
      element?.close();document.body.style.overflow = overflow;
    };
  },[]);
  const toggleFullscreen = async () => {
    setFullscreenError('');
    try {
      if (document.fullscreenElement === dialog.current) await document.exitFullscreen();
      else if (dialog.current?.requestFullscreen) await dialog.current.requestFullscreen();
      else setFullscreenError('Browser fullscreen is unavailable. The reader already fills this window.');
    } catch {setFullscreenError('Fullscreen was unavailable. You can keep reading in this window.');}
  };
  const cancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (document.fullscreenElement === dialog.current) void document.exitFullscreen().catch(()=>{});
    else onClose();
  };
  return {dialog,fullscreen,fullscreenError,toggleFullscreen,cancel};
}
