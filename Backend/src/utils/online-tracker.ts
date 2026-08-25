export class OnlineTracker {
  private static activeSessions = new Map<string, number>();
  private static readonly TIMEOUT_MS = 30000; // 30 seconds

  static ping(sessionId: string): number {
    const now = Date.now();
    this.activeSessions.set(sessionId, now);
    this.cleanup(now);
    return this.getCount();
  }

  static getCount(): number {
    const now = Date.now();
    this.cleanup(now);
    return Math.max(1, this.activeSessions.size);
  }

  private static cleanup(now: number) {
    for (const [id, lastSeen] of this.activeSessions.entries()) {
      if (now - lastSeen > this.TIMEOUT_MS) {
        this.activeSessions.delete(id);
      }
    }
  }
}
