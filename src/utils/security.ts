/**
 * Security utilities for production deployment
 */

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .trim();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Nepal format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+977[-\s]?)?[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

// Generate secure random ID
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate file types for uploads
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Check for sensitive data patterns
export const containsSensitiveData = (text: string): boolean => {
  const patterns = [
    /\b\d{16}\b/, // Credit card numbers
    /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN patterns
    /password\s*[:=]\s*\S+/i, // Password in text
  ];
  
  return patterns.some(pattern => pattern.test(text));
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(attempt => now - attempt < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);
    return true;
  };
};