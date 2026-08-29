export class OnlineTracker {
  private static activeSessions = new Map<string, number>();
  private static readonly TIMEOUT_MS = 25000; // 25 seconds

  static ping(sessionId: string): number {
    const now = Date.now();
    this.activeSessions.set(sessionId, now);
    this.cleanup(now);
    return this.activeSessions.size;
  }

  static getCount(): number {
    const now = Date.now();
    this.cleanup(now);
    return this.activeSessions.size;
  }

  private static cleanup(now: number) {
    for (const [id, lastSeen] of this.activeSessions.entries()) {
      if (now - lastSeen > this.TIMEOUT_MS) {
        this.activeSessions.delete(id);
      }
    }
  }
}

