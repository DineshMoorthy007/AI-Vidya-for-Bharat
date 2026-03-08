/**
 * Network Status Detection Utility
 * Detects online/offline state and provides callbacks for network changes
 * Works across browser environments and handles edge cases
 */

// Callback type for network change listeners
type NetworkStatusCallback = (isOnline: boolean) => void;

// Store callbacks for all listeners
const listeners: Set<NetworkStatusCallback> = new Set();

// Track current online state
let currentOnlineState: boolean =
  typeof navigator !== "undefined" && navigator.onLine;

/**
 * Initialize network status listeners
 * Sets up event handlers for online/offline events
 */
function initializeNetworkListeners(): void {
  // Only initialize if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }

  // Listen for online event
  window.addEventListener("online", handleOnlineChange);

  // Listen for offline event
  window.addEventListener("offline", handleOnlineChange);

  // Listen for visibility changes (some browsers fire offline on tab hide)
  document.addEventListener("visibilitychange", handleVisibilityChange);

  console.log("[Network Status] Listeners initialized");
}

/**
 * Handle online/offline events
 */
function handleOnlineChange(): void {
  const newOnlineState = navigator.onLine;

  // Only trigger callbacks if state actually changed
  if (newOnlineState !== currentOnlineState) {
    currentOnlineState = newOnlineState;
    console.log(
      `[Network Status] Changed to ${newOnlineState ? "ONLINE" : "OFFLINE"}`,
    );
    notifyListeners(newOnlineState);
  }
}

/**
 * Handle visibility changes
 * Some browsers transition to offline when page loses focus
 */
function handleVisibilityChange(): void {
  // Recheck online status when page becomes visible
  if (document.visibilityState === "visible") {
    const newOnlineState = navigator.onLine;
    if (newOnlineState !== currentOnlineState) {
      handleOnlineChange();
    }
  }
}

/**
 * Notify all registered listeners of network status change
 * @param isOnline Current online state
 */
function notifyListeners(isOnline: boolean): void {
  listeners.forEach((callback) => {
    try {
      callback(isOnline);
    } catch (error) {
      console.error("Error in network status callback:", error);
    }
  });
}

/**
 * Perform a network connectivity check
 * Makes a HEAD request to a lightweight endpoint to verify connectivity
 * @returns Promise that resolves with boolean indicating connectivity
 */
export async function verifyConnectivity(): Promise<boolean> {
  try {
    // Use a lightweight endpoint (common CDN URL with cache busting)
    const response = await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
    });

    // For no-cors requests, we check if we get a response at all
    return response.ok || response.type === "opaque";
  } catch {
    // If fetch fails, we're offline
    return false;
  }
}

/**
 * Get current online status
 * @returns true if online, false if offline
 */
export function isOnline(): boolean {
  // Use navigator.onLine as primary indicator
  if (typeof navigator !== "undefined") {
    return navigator.onLine;
  }
  // Fallback for environments without navigator
  return currentOnlineState;
}

/**
 * Get current offline status
 * @returns true if offline, false if online
 */
export function isOffline(): boolean {
  return !isOnline();
}

/**
 * Register callback for network status changes
 * Callback will be invoked whenever online/offline status changes
 * @param callback Function to call on network status change
 * @returns Cleanup function to unsubscribe
 */
export function onNetworkChange(callback: NetworkStatusCallback): () => void {
  // Initialize listeners on first subscription
  if (listeners.size === 0) {
    initializeNetworkListeners();
  }

  listeners.add(callback);

  // Return cleanup function
  return () => {
    listeners.delete(callback);

    // Remove listeners when no one is subscribed anymore
    if (listeners.size === 0) {
      removeNetworkListeners();
    }
  };
}

/**
 * Remove network event listeners
 * Called when no listeners remain
 */
function removeNetworkListeners(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("online", handleOnlineChange);
  window.removeEventListener("offline", handleOnlineChange);
  document.removeEventListener("visibilitychange", handleVisibilityChange);

  console.log("[Network Status] Listeners removed");
}

/**
 * Wait for connectivity to be restored
 * Useful for offline-first operations
 * @param timeout Maximum time to wait in milliseconds (0 for unlimited)
 * @returns Promise that resolves when online, or rejects if timeout
 */
export function waitForConnectivity(timeout: number = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already online, resolve immediately
    if (isOnline()) {
      resolve();
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;

    // Set up timeout if specified
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        reject(new Error("Connectivity wait timeout"));
      }, timeout);
    }

    // Subscribe to network changes
    unsubscribe = onNetworkChange((isConnected) => {
      if (isConnected) {
        if (timeoutId) clearTimeout(timeoutId);
        if (unsubscribe) unsubscribe();
        resolve();
      }
    });
  });
}

/**
 * Get network information summary
 * @returns Object with current network status and metadata
 */
export function getNetworkStatus(): {
  isOnline: boolean;
  isOffline: boolean;
  hasListeners: boolean;
  timestamp: number;
} {
  return {
    isOnline: isOnline(),
    isOffline: isOffline(),
    hasListeners: listeners.size > 0,
    timestamp: Date.now(),
  };
}

// Initialize listeners immediately in browser environment
if (typeof window !== "undefined") {
  // Add delay to ensure DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Listeners will be initialized on first subscription
    });
  }
}

/**
 * Hook for React components to track network status
 * Usage: const isOnline = useNetworkStatus();
 * @returns Current online status and connectivity state
 */
export function useNetworkStatus(): {
  isOnline: boolean;
  isOffline: boolean;
  isConnected: boolean; // Alias for isOnline
} {
  // This is a utility function reference
  // In React components, use it within useEffect hooks
  const status = getNetworkStatus();
  return {
    isOnline: status.isOnline,
    isOffline: status.isOffline,
    isConnected: status.isOnline,
  };
}
