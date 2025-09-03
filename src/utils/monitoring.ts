/**
 * Application monitoring utilities
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: keyof LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get current user ID from localStorage or context
    try {
      const user = localStorage.getItem('dialysis_user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private sendToService(logEntry: LogEntry) {
    // In production, send to logging service like LogRocket, Sentry, etc.
    if (!this.isDevelopment) {
      // Example: window.LogRocket?.log(logEntry);
      console.log('PROD LOG:', logEntry);
    }
  }

  error(message: string, context?: any) {
    const log = this.formatLog('ERROR', message, context);
    console.error(message, context);
    this.sendToService(log);
  }

  warn(message: string, context?: any) {
    const log = this.formatLog('WARN', message, context);
    console.warn(message, context);
    this.sendToService(log);
  }

  info(message: string, context?: any) {
    const log = this.formatLog('INFO', message, context);
    if (this.isDevelopment) {
      console.info(message, context);
    }
    this.sendToService(log);
  }

  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      const log = this.formatLog('DEBUG', message, context);
      console.debug(message, context);
      this.sendToService(log);
    }
  }

  // Track user actions for analytics
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.info(`User Action: ${action}`, properties);
    
    // Send to analytics service
    if (!this.isDevelopment) {
      // Example: analytics.track(action, properties);
    }
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit = 'ms') {
    this.info(`Performance: ${metric}`, { value, unit });
  }
}

export const logger = new Logger();

// Health check utilities
export const performHealthCheck = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
}> => {
  const checks = {
    localStorage: checkLocalStorage(),
    memory: checkMemoryUsage(),
    connectivity: await checkConnectivity(),
  };

  const failedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (failedChecks === 0) {
    status = 'healthy';
  } else if (failedChecks < totalChecks / 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return { status, checks };
};

function checkLocalStorage(): boolean {
  try {
    const test = 'health-check-test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function checkMemoryUsage(): boolean {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1048576;
    return usedMB < 100; // Less than 100MB
  }
  return true; // Can't check, assume OK
}

async function checkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('/robots.txt', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
}