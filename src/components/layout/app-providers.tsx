"use client";

import React, { useEffect, useState } from 'react';
import useEventsStore from '@/hooks/use-events-store';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const setStoreHydrated = useEventsStore((state) => state.setHydrated);

  useEffect(() => {
    // This effect runs once on the client after initial render.
    // Zustand's persist middleware handles rehydration.
    // We use this to ensure our local `isHydrated` matches the store's,
    // or to trigger any post-hydration logic if necessary.
    // For this app, ensuring the store's _isHydrated flag is set is key.
    // The persist middleware's onRehydrateStorage should set it.
    // This is more of a signal that the client has mounted.
    
    // A common pattern is to wait for the store to confirm hydration.
    const unsub = useEventsStore.subscribe(
      (hydrated) => {
        if (hydrated) {
          setIsHydrated(true);
          unsub(); // Unsubscribe once hydrated
        }
      },
      (state) => state._isHydrated
    );

    // If already hydrated (e.g. fast refresh or already rehydrated by middleware)
    if (useEventsStore.getState()._isHydrated) {
      setIsHydrated(true);
      unsub();
    } else {
      // If not hydrated by persist middleware yet, explicitly call setHydrated.
      // This is more of a fallback.
      setStoreHydrated();
      // This might be redundant if onRehydrateStorage works reliably.
      // Check if it's needed based on behavior.
    }
    
    return () => unsub(); // Cleanup subscription
  }, [setStoreHydrated]);

  // Optionally, render a loading state until hydrated
  // if (!isHydrated) {
  //   return <div>Loading calendar data...</div>; 
  // }

  return <>{children}</>;
}
