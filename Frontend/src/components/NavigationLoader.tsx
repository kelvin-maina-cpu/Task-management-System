import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './Loader';

const MIN_VISIBLE_MS = 450;
const EXIT_DELAY_MS = 120;

export const NavigationLoader = () => {
  const location = useLocation();
  const previousPathRef = useRef(`${location.pathname}${location.search}${location.hash}`);
  const showStartedAtRef = useRef(0);
  const hideTimeoutRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;

    if (previousPathRef.current !== nextPath) {
      previousPathRef.current = nextPath;
      showStartedAtRef.current = Date.now();
      setIsVisible(true);

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        const elapsed = Date.now() - showStartedAtRef.current;
        const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

        hideTimeoutRef.current = window.setTimeout(() => {
          setIsVisible(false);
          hideTimeoutRef.current = null;
        }, remaining);
      }, EXIT_DELAY_MS);
    }

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [location]);

  if (!isVisible) {
    return null;
  }

  return <Loader fullscreen label="Loading next page" />;
};
