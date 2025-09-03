import { useState, useEffect } from 'react';
import { performHealthCheck } from '@/utils/monitoring';
import { useToast } from '@/hooks/use-toast';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  lastCheck: Date | null;
}

export const useHealthCheck = (intervalMs = 5 * 60 * 1000) => { // Default 5 minutes
  const [health, setHealth] = useState<HealthStatus>({
    status: 'healthy',
    checks: {},
    lastCheck: null
  });
  const { toast } = useToast();

  const runHealthCheck = async () => {
    try {
      const result = await performHealthCheck();
      const newHealth: HealthStatus = {
        ...result,
        lastCheck: new Date()
      };

      // Show warning if health degrades
      if (health.status === 'healthy' && result.status !== 'healthy') {
        toast({
          title: "System Health Alert",
          description: result.status === 'degraded' 
            ? "Some features may be slower than usual" 
            : "System experiencing issues",
          variant: result.status === 'unhealthy' ? 'destructive' : 'default'
        });
      }

      setHealth(newHealth);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth(prev => ({
        status: 'unhealthy',
        checks: {},
        lastCheck: new Date()
      }));
    }
  };

  useEffect(() => {
    // Run initial check
    runHealthCheck();

    // Set up periodic checks
    const interval = setInterval(runHealthCheck, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    health,
    runHealthCheck,
    isHealthy: health.status === 'healthy'
  };
};