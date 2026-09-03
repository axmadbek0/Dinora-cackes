import React, { useState, useEffect } from 'react';
import { pingLiveVisitor } from '../../services/api';

// Helper to get or create persistent session ID for the active browser tab
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem('dinora_online_session_id');
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('dinora_online_session_id', id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

// Global active real online count hook
export function useRealOnlineCount(): number {
  const [count, setCount] = useState<number>(1);

  useEffect(() => {
    const sessionId = getSessionId();

    const doPing = async () => {
      const liveCount = await pingLiveVisitor(sessionId);
      if (liveCount > 0) {
        setCount(liveCount);
      }
    };

    doPing();
    const interval = setInterval(doPing, 12000); // Heartbeat ping every 12 seconds

    return () => clearInterval(interval);
  }, []);

  return count;
}

export const LiveOnlineVisitors: React.FC = () => {
  // Real heartbeat worker component
  useRealOnlineCount();
  return null;
};

// Inline Header & Hero Real Active Visitors Badge
export const OnlineVisitorsBadge: React.FC<{ variant?: 'header' | 'hero' }> = ({ variant = 'header' }) => {
  const count = useRealOnlineCount();

  if (variant === 'hero') {
    return (
      <div className="inline-flex items-center space-x-1.5 xs:space-x-2 bg-white/90 backdrop-blur-md px-2.5 py-1 xs:px-3.5 xs:py-1.5 rounded-full border border-emerald-200 shadow-sm text-[10px] 2xs:text-[11px] xs:text-xs font-bold text-emerald-900 max-w-full">
        <span className="relative flex h-2 w-2 xs:h-2.5 xs:w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 xs:h-2.5 xs:w-2.5 bg-emerald-500" />
        </span>
        <span className="truncate">
          {count} {count === 1 ? 'foydalanuvchi' : 'nafar'} onlayn
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center space-x-1 xs:space-x-1.5 bg-emerald-50 text-emerald-800 text-[9px] xs:text-[10px] sm:text-[11px] font-bold px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full border border-emerald-200 shadow-xs shrink-0">
      <span className="relative flex h-1.5 w-1.5 xs:h-2 xs:w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 xs:h-2 xs:w-2 bg-emerald-500" />
      </span>
      <span>{count} onlayn</span>
    </div>
  );
};
