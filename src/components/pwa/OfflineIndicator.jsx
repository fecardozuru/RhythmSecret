import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
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
    return (
      <span className="flex items-center gap-1 text-emerald-300 text-xs">
        <Wifi size={14} /> Online
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-red-300 text-xs">
      <WifiOff size={14} /> Offline
    </span>
  );
};

export default OfflineIndicator;
