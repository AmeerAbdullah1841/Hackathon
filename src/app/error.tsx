'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError = error.message?.includes('Loading chunk') || 
                       error.message?.includes('Failed to fetch dynamically imported module') ||
                       error.message?.includes('ChunkLoadError');

  useEffect(() => {
    // Auto-reload on chunk loading errors to clear stale cache
    if (isChunkError) {
      console.log('Chunk loading error detected, reloading page...');
      // Force a hard reload to clear cache
      window.location.reload();
    }
  }, [isChunkError]);

  const handleReload = () => {
    if (isChunkError) {
      // Force hard reload for chunk errors
      window.location.href = window.location.href;
    } else {
      reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        {isChunkError && (
          <p className="text-sm text-yellow-600 mb-4">
            Detected a chunk loading error. Reloading page to clear cache...
          </p>
        )}
        <button
          onClick={handleReload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isChunkError ? 'Reload Page' : 'Try again'}
        </button>
      </div>
    </div>
  );
}

