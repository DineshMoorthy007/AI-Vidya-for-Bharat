/**
 * Performance Optimization: Dynamic Imports Utility
 * Provides helpers for lazy loading components in Next.js
 * Reduces initial bundle size and improves page load performance
 */

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Loading component shown while async component loads
 */
const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin">
      <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full"></div>
    </div>
  </div>
);

/**
 * Error component shown if async component fails to load
 */
const ErrorComponent = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
    <p className="text-red-600 mb-4">Failed to load component</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

/**
 * Dynamically import a component with loading and error states
 * Useful for heavy components like video players, editors, etc.
 *
 * @example
 * const VideoPlayer = createDynamicComponent(
 *   () => import('../components/VideoPlayer')
 * );
 *
 * @param importFunc Function that returns dynamic import
 * @param options Configuration options
 * @returns Dynamically imported component with loading state
 */
export function createDynamicComponent<P extends {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options?: {
    ssr?: boolean;
    fallback?: React.ReactNode;
    timeout?: number;
  }
) {
  return dynamic(importFunc, {
    loading: () => options?.fallback || <LoadingComponent />,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload a component before it's needed
 * Call this in event handlers or when you anticipate user navigation
 *
 * @example
 * preloadComponent(() => import('../components/VideoPlayer'));
 *
 * @param importFunc Function that returns dynamic import
 */
export function preloadComponent(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
): void {
  try {
    importFunc();
  } catch (error) {
    console.warn('Preload failed:', error);
  }
}

/**
 * Lazy load route-based components
 * Primary use case: Code splitting for different routes
 *
 * @example
 * const Dashboard = lazyRoute(() => import('../pages/dashboard'));
 */
export function lazyRoute<P extends {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>
) {
  return dynamic(importFunc, {
    loading: () => <LoadingComponent />,
    ssr: false, // Route components typically don't need SSR
  });
}

/**
 * Create a dynamically imported component with retry logic
 * Useful for components that might fail to load on poor connections
 */
export function createRetryableComponent<P extends {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  maxRetries: number = 3
) {
  let retryCount = 0;

  const importWithRetry = async () => {
    try {
      return await importFunc();
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Retry attempt ${retryCount} for component`);
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return importWithRetry();
      }
      throw error;
    }
  };

  return dynamic(importWithRetry, {
    loading: () => <LoadingComponent />,
  });
}

/**
 * Get component size estimation (for monitoring)
 * In production, track imported component bundle sizes
 */
export function reportComponentLoad(
  componentName: string,
  loadTime: number,
  size?: number
): void {
  const metrics = {
    component: componentName,
    loadTime,
    size,
    timestamp: Date.now(),
  };

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    console.log('[Performance] Component loaded:', metrics);
    // Could send to analytics service: analytics.track('component_load', metrics);
  } else {
    console.log('[Performance] Component loaded:', metrics);
  }
}
