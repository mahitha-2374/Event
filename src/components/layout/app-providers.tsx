"use client";
import React from 'react';
// No need for useEventsStore or useState/useEffect for hydration here,
// as child components (like HomePage) will use useEvents().isHydrated
// to manage their own loading states based on the store's hydration status.
// The store's _isHydrated flag is set via onRehydrateStorage.

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
