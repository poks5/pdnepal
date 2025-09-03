import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          const metrics: PerformanceMetrics = {
            loadTime: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            renderTime: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart
          };

          // In production, send to analytics service
          if (process.env.NODE_ENV === 'production') {
            console.log('Performance metrics:', metrics);
            // sendToAnalytics('performance', metrics);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Monitor memory usage (if supported)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo.usedJSHeapSize / 1048576; // MB
      
      if (memoryUsage > 50) { // Alert if over 50MB
        console.warn('High memory usage detected:', memoryUsage.toFixed(2), 'MB');
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
};

export default PerformanceMonitor;