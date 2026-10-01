interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class SocketRateLimiter {
  private records = new Map<string, RateLimitRecord>();

  /**
   * Checks if an action from a socket/user exceeds the allowed limit in a time window.
   * @param key unique identifier (e.g. `${socketId}:${eventType}`)
   * @param maxRequests maximum requests allowed in window
   * @param windowMs window duration in milliseconds
   * @returns true if within limit, false if rate limited
   */
  public check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now > record.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Cleanup expired rate limit records periodically.
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetAt) {
        this.records.delete(key);
      }
    }
  }
}

export const socketRateLimiter = new SocketRateLimiter();

// Clean up old rate limit records every 2 minutes
setInterval(() => socketRateLimiter.cleanup(), 2 * 60 * 1000);
