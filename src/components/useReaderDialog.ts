import { useEffect, useRef, useState } from 'react';

export function useReaderDialog(onClose: () => void) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  useEffect(() => {
    const element = dialog.current; element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const changed = () => setFullscreen(!!document.fullscreenElement && !!element?.contains(document.fullscreenElement));
    document.addEventListener('fullscreenchange',changed);
    return () => {
      document.removeEventListener('fullscreenchange',changed);
      if (!!document.fullscreenElement && !!element?.contains(document.fullscreenElement)) void document.exitFullscreen().catch(()=>{});
      element?.close();document.body.style.overflow = overflow;
    };
  },[]);
  const toggleFullscreen = async () => {
    setFullscreenError('');
    try {
      const target=dialog.current?.firstElementChild as HTMLElement | undefined;
      // Native <dialog> elements cannot enter fullscreen. Its application wrapper can.
      if (document.fullscreenElement && dialog.current?.contains(document.fullscreenElement)) await document.exitFullscreen();
      else if (target?.requestFullscreen) await target.requestFullscreen();
      else setFullscreenError('Browser fullscreen is unavailable. The reader already fills this window.');
    } catch {setFullscreenError('Fullscreen was unavailable. You can keep reading in this window.');}
  };
  const cancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (document.fullscreenElement && dialog.current?.contains(document.fullscreenElement)) void document.exitFullscreen().catch(()=>{});
    else onClose();
  };
  return {dialog,fullscreen,fullscreenError,toggleFullscreen,cancel};
}
