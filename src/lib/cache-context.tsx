import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface CacheMetadata {
  cachedAt: string | null;
  cachedMinutesAgo: number | null;
  isFresh: boolean;
}

interface CacheContextType {
  cacheInfo: Record<string, CacheMetadata>;
  updateCache: (key: string, metadata: CacheMetadata) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cacheInfo, setCacheInfo] = useState<Record<string, CacheMetadata>>({});

  const updateCache = (key: string, metadata: CacheMetadata) => {
    setCacheInfo((prev) => ({ ...prev, [key]: metadata }));
  };

  return (
    <CacheContext.Provider value={{ cacheInfo, updateCache }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within CacheProvider");
  }
  return context;
}

export function formatCacheFreshness(cachedMinutesAgo: number | null): string {
  if (cachedMinutesAgo === null) return "Loading...";
  if (cachedMinutesAgo === 0) return "just now";
  if (cachedMinutesAgo === 1) return "1 minute ago";
  if (cachedMinutesAgo < 60) return `${cachedMinutesAgo} minutes ago`;
  const hours = Math.floor(cachedMinutesAgo / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}
