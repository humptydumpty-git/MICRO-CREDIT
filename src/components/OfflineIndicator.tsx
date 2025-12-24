import React, { useEffect, useState } from 'react';
import { AlertIcon } from './ui/Icons';

/**
 * Component that shows an indicator when the app is offline
 */
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-2">
      <AlertIcon className="text-white" size={20} />
      <span className="text-sm font-medium">You are currently offline. Some features may not work.</span>
    </div>
  );
};

export default OfflineIndicator;

