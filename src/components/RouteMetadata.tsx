import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageMetadata, metadataForPath } from '../lib/pageMetadata';

export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = metadataForPath(pathname);
    if (page) applyPageMetadata(document, page);
  }, [pathname]);
  return null;
}
