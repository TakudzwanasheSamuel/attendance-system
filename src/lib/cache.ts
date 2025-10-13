// Simple in-memory cache for performance optimization
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new SimpleCache();

// Cleanup expired entries every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

// Cache key generators
export const cacheKeys = {
  studentDashboard: (studentId: string) => `student:dashboard:${studentId}`,
  studentCourses: (studentId: string) => `student:courses:${studentId}`,
  lecturerCourses: (lecturerId: string) => `lecturer:courses:${lecturerId}`,
  sessionAttendance: (sessionId: string) => `session:attendance:${sessionId}`,
  courseEnrollments: (courseId: string) => `course:enrollments:${courseId}`,
};

// Cached data fetchers
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  cache.set(key, data, ttl);
  
  return data;
}

// Invalidate related cache entries
export function invalidateCache(pattern: string): void {
  const keys = Array.from(cache['cache'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}
