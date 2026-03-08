import { useQuery } from '@tanstack/react-query';
import { Artwork, ArtworksResponse } from '../types';
import { getDailyArtwork, getTodayCacheKey } from './getDailyArtwork';

// Import local artworks for development
import localArtworks from '../../data/artworks.json';

const ARTWORKS_ENDPOINT = 'https://yuhu.no/dailyarthistory/artworks.json';

/**
 * Fetches all artworks from the remote endpoint (production) or returns local data (development).
 */
async function fetchArtworks(): Promise<ArtworksResponse> {
  // In development, use local bundled JSON file
  if (__DEV__) {
    // Return local data as a resolved promise to maintain async interface
    return Promise.resolve(localArtworks as ArtworksResponse);
  }
  
  // In production, fetch from remote URL
  const response = await fetch(ARTWORKS_ENDPOINT);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch artworks: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * React Query hook to fetch and cache artworks.
 * The daily artwork is selected deterministically based on UTC time.
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
