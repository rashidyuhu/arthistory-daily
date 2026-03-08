import { Artwork } from '../types';

/**
 * Epoch date: January 1, 2024, 00:00:00 local time
 */
const EPOCH_YEAR = 2024;
const EPOCH_MONTH = 0; // January (0-indexed)
const EPOCH_DAY = 1;

/**
 * Milliseconds in a day
 */
const MS_PER_DAY = 86400000;

/**
 * Calculates the day index since the epoch date.
 * Uses local time so artwork changes at local midnight.
 */
export function getDayIndex(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const epoch = new Date(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY);
  const diffMs = today.getTime() - epoch.getTime();
  return Math.floor(diffMs / MS_PER_DAY);
}

/**
 * Seeded random number generator (0–1).
 * Same seed always gives same sequence, so everyone sees the same artwork on the same day.
 */
function seededRandom(seed: number): () => number {
  let t = seed;
  return function () {
    t ^= t << 13;
    t ^= t >> 17;
    t ^= t << 5;
    return ((t >>> 0) / 0xffffffff) + 0.5;
  };
}

/**
 * Minimum days before the same artwork can appear again.
 */
const MIN_GAP_DAYS = 30;

/**
 * Selects the artwork of the day using seeded random.
 * Excludes artworks shown in the last MIN_GAP_DAYS to avoid repeats.
 * Same artwork for everyone on the same day; selection appears random across days.
 * Artwork changes at local midnight based on user's timezone.
 */
export function getDailyArtwork(artworks: Artwork[]): Artwork | null {
  if (artworks.length === 0) {
    return null;
  }

  const dayIndex = getDayIndex();

  // Collect indices of artworks shown in the last MIN_GAP_DAYS
  const excludedIndices = new Set<number>();
  for (let d = dayIndex - MIN_GAP_DAYS; d < dayIndex; d++) {
    const random = seededRandom(d);
    const idx = Math.floor(random() * artworks.length);
    excludedIndices.add(idx);
  }

  // Build list of available indices (not recently shown)
  const availableIndices: number[] = [];
  for (let i = 0; i < artworks.length; i++) {
    if (!excludedIndices.has(i)) {
      availableIndices.push(i);
    }
  }

  // Pick from available, or fall back to all if all were excluded
  const indicesToUse =
    availableIndices.length > 0
      ? availableIndices
      : Array.from({ length: artworks.length }, (_, i) => i);

  const random = seededRandom(dayIndex);
  const pickIndex = Math.floor(random() * indicesToUse.length);
  const artworkIndex = indicesToUse[pickIndex];
  return artworks[artworkIndex];
}

/**
 * Gets the cache key for today's artwork.
 * This ensures the artwork doesn't change during the day.
 */
export function getTodayCacheKey(): string {
  const dayIndex = getDayIndex();
  return `artwork-${dayIndex}`;
}
