import { useQuery } from '@tanstack/react-query';
import { Artwork, ArtworksResponse } from '../types';
import { getDailyArtwork, getTodayCacheKey } from './getDailyArtwork';

// Import local artworks (used in dev + as fallback when remote fails)
import localArtworks from '../../data/artworks.json';

// Change this if you host artworks.json elsewhere
const ARTWORKS_ENDPOINT = 'https://yuhu.no/dailyarthistory/artworks.json';

/**
 * Fetches all artworks from the remote endpoint (production) or returns local data (development).
 * Falls back to bundled local data if remote fetch fails (offline, server down, etc.).
 */
async function fetchArtworks(): Promise<ArtworksResponse> {
  // In development, use local bundled JSON file
  if (__DEV__) {
    return Promise.resolve(localArtworks as ArtworksResponse);
  }

  // In production, try remote first, fallback to local on failure
  try {
    const response = await fetch(ARTWORKS_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Remote failed – use bundled local data so app still works offline
  }
  return localArtworks as ArtworksResponse;
}

/**
 * React Query hook to fetch and cache artworks.
 * The daily artwork is selected deterministically based on local time.
 */
export function useArtworks() {
  const query = useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
    staleTime: Infinity, // Artworks don't change, so cache forever
    gcTime: Infinity, // Keep in cache forever
    retry: 2,
  });

  const dailyArtwork: Artwork | null = query.data
    ? getDailyArtwork(query.data)
    : null;

  return {
    ...query,
    dailyArtwork,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Gets the cache key for the current day's artwork.
 * Useful for local storage if needed.
 */
export function useTodayCacheKey(): string {
  return getTodayCacheKey();
}
