import { config } from "../config/index.js";

interface MessageAttempt {
  timestamp: number;
  count: number;
}

/**
 * Rate Limiter for Socket.IO messages
 * Prevents users from sending too many messages in a short time period
 */
export class MessageRateLimiter {
  private attempts: Map<string, MessageAttempt[]> = new Map();

  /**
   * Check if user can send a message
   * @param userId - User ID
   * @returns true if allowed, false if rate limited
   */
  canSendMessage(userId: number): boolean {
    const key = `user_${userId}`;
    const now = Date.now();
    const windowMs = config.messageLimitWindowMs; // 10 seconds
    const maxMessages = config.messageLimitPerWindow; // 5 messages

    // Get user's message attempts
    let userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    userAttempts = userAttempts.filter((attempt) => now - attempt.timestamp < windowMs);

    // Count messages in current window
    const messagesInWindow = userAttempts.reduce((total, attempt) => total + attempt.count, 0);

    // Check if user exceeded limit
    if (messagesInWindow >= maxMessages) {
      console.log(
        `🚫 Rate limit exceeded for user ${userId}: ${messagesInWindow}/${maxMessages} messages in ${windowMs}ms`
      );
      return false;
    }

    // Record this attempt
    userAttempts.push({
      timestamp: now,
      count: 1,
    });

    // Update attempts map
    this.attempts.set(key, userAttempts);

    console.log(
      `✅ Rate limit check passed for user ${userId}: ${
        messagesInWindow + 1
      }/${maxMessages} messages in window`
    );
    return true;
  }

  /**
   * Get remaining messages for user
   * @param userId - User ID
   * @returns number of messages remaining in current window
   */
  getRemainingMessages(userId: number): number {
    const key = `user_${userId}`;
    const now = Date.now();
    const windowMs = config.messageLimitWindowMs;
    const maxMessages = config.messageLimitPerWindow;

    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter((attempt) => now - attempt.timestamp < windowMs);

    const messagesInWindow = recentAttempts.reduce((total, attempt) => total + attempt.count, 0);
    return Math.max(0, maxMessages - messagesInWindow);
  }

  /**
   * Clean up old attempts to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const windowMs = config.messageLimitWindowMs;

    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter((attempt) => now - attempt.timestamp < windowMs);

      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }

  /**
   * Get reset time for user's rate limit
   * @param userId - User ID
   * @returns timestamp when rate limit resets
   */
  getResetTime(userId: number): number {
    const key = `user_${userId}`;
    const userAttempts = this.attempts.get(key) || [];

    if (userAttempts.length === 0) {
      return Date.now();
    }

    const oldestAttempt = userAttempts[0];
    if (!oldestAttempt) {
      return Date.now();
    }

    return oldestAttempt.timestamp + config.messageLimitWindowMs;
  }
}

// Export singleton instance
export const messageRateLimiter = new MessageRateLimiter();

// Cleanup old attempts every minute to prevent memory leaks
setInterval(() => {
  messageRateLimiter.cleanup();
}, 60000);
