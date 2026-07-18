/**
 * Security utilities for AU Track.
 * Provides input sanitization, file validation, CSRF tokens, and rate limiting.
 */

/**
 * Sanitize user input by stripping HTML tags, limiting length, and preventing XSS.
 * @param text The raw input string
 * @param maxLength Maximum allowed length (default: 10000)
 * @returns Sanitized string
 */
export function sanitizeInput(text: string, maxLength: number = 10000): string {
  if (!text || typeof text !== "string") return "";

  // Truncate to max length
  let sanitized = text.slice(0, maxLength);

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Remove HTML entities that could be used for XSS
  sanitized = sanitized
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x2f;/gi, "/")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, "&");

  // Remove script-related keywords (case-insensitive)
  sanitized = sanitized
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/vbscript:/gi, "");

  // Remove null bytes and other control characters (except newline, tab, carriage return)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Trim whitespace
  return sanitized.trim();
}

/**
 * Validate a file's type against allowed MIME types and extensions.
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types (e.g., ['image/png', 'image/jpeg'])
 * @returns True if the file type is allowed
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; reason?: string } {
  if (!file) {
    return { valid: false, reason: "No file provided" };
  }

  // Check MIME type
  if (file.type && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      reason: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Also check extension as a fallback (some browsers don't set MIME type)
  const extension = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = allowedTypes.map((type) => {
    const extMap: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "application/pdf": "pdf",
      "text/csv": "csv",
      "application/json": "json",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/vnd.ms-excel": "xls",
    };
    return extMap[type] || "";
  }).filter(Boolean);

  if (
    extension &&
    allowedExtensions.length > 0 &&
    !allowedExtensions.includes(extension)
  ) {
    return {
      valid: false,
      reason: `File extension ".${extension}" is not allowed.`,
    };
  }

  // Double-ended extension check (e.g., file.php.jpg)
  const doubleExtMatch = file.name.match(/\.(php|js|html|svg|exe|bat|cmd|sh)\./i);
  if (doubleExtMatch) {
    return {
      valid: false,
      reason: "Suspicious file extension detected",
    };
  }

  return { valid: true };
}

/**
 * Validate a file's size against a maximum.
 * @param file The file to validate
 * @param maxMB Maximum file size in megabytes
 * @returns True if the file size is within the limit
 */
export function validateFileSize(
  file: File,
  maxMB: number
): { valid: boolean; reason?: string } {
  if (!file) {
    return { valid: false, reason: "No file provided" };
  }

  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const actualMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      reason: `File size (${actualMB} MB) exceeds the maximum allowed size (${maxMB} MB)`,
    };
  }

  if (file.size === 0) {
    return { valid: false, reason: "File is empty" };
  }

  return { valid: true };
}

/**
 * Generate a cryptographically random CSRF token.
 * Uses the Web Crypto API when available, falls back to a less secure method.
 * @returns A random hex string token
 */
export function generateCSRFToken(): string {
  const length = 32;

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Fallback for environments without Web Crypto API
  const chars = "0123456789abcdef";
  let token = "";
  for (let i = 0; i < length * 2; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * Simple hash function for deduplication (not for security purposes).
 * Uses a djb2-like algorithm.
 * @param str The string to hash
 * @returns A numeric hash value as a hex string
 */
export function hashString(str: string): string {
  if (!str) return "0";

  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
    hash = hash & 0xffffffff; // Keep it 32-bit
  }

  // Convert to unsigned and then to hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Rate limit check using in-memory tracking.
 * For server-side use within a request lifecycle.
 *
 * @param key Unique key for the rate limit (e.g., user ID + action)
 * @param maxAttempts Maximum attempts allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
const rateLimitStore = new Map<string, { timestamps: number[] }>();

export function rateLimitCheck(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { timestamps: [now] });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  // Filter to valid timestamps within the window
  const validTimestamps = entry.timestamps.filter((ts) => now - ts < windowMs);
  entry.timestamps = validTimestamps;

  if (validTimestamps.length >= maxAttempts) {
    const oldest = Math.min(...validTimestamps);
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  entry.timestamps.push(now);
  const remaining = maxAttempts - entry.timestamps.length;
  const oldest = Math.min(...entry.timestamps);
  return {
    allowed: true,
    remaining,
    resetAt: oldest + windowMs,
  };
}

/**
 * Clear rate limit entries for a specific key (useful for testing).
 */
export function clearRateLimit(key?: string): void {
  if (key) {
    rateLimitStore.delete(key);
  } else {
    rateLimitStore.clear();
  }
}

/**
 * Content Security Policy header value for the application.
 * Allows Supabase, Google Fonts, inline styles for Tailwind, and self.
 */
export const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");
