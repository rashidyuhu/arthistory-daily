import AsyncStorage from '@react-native-async-storage/async-storage';
import { Artwork } from '../types';

const KEY = 'favoriteArtworks_v1';

export async function getFavorites(): Promise<Artwork[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(artwork: Artwork): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    const isFav = favorites.some((f) => f.id === artwork.id);
    const next = isFav
      ? favorites.filter((f) => f.id !== artwork.id)
      : [{ ...artwork }, ...favorites];
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return !isFav;
  } catch {
    return false;
  }
}

export async function checkIsFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id);
}
