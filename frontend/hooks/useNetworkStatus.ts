'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      let isSlowConnection = false;
      let effectiveType: string | undefined;
      let downlink: number | undefined;
      let rtt: number | undefined;

      // 检查网络连接质量（如果支持）
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        effectiveType = connection.effectiveType;
        downlink = connection.downlink;
        rtt = connection.rtt;

        // 判断是否为慢速连接
        isSlowConnection = 
          effectiveType === 'slow-2g' || 
          effectiveType === '2g' || 
          (downlink && downlink < 1.5) ||
          (rtt && rtt > 300);
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        effectiveType,
        downlink,
        rtt,
      });
    };

    // 初始检查
    updateNetworkStatus();

    // 监听网络状态变化
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // 监听连接变化（如果支持）
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};