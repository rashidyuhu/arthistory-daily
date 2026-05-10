import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../types';
import { getFavorites } from '../services/favorites';
import { ZoomModal } from '../components/ZoomModal';
import { theme } from '../theme';

const GRID_PADDING = 16;
const GRID_GAP = 8;
const COLUMNS = 2;

export function CollectionScreen() {
  const [favorites, setFavorites] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / COLUMNS;

  useEffect(() => {
    getFavorites().then((favs) => {
      setFavorites(favs);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>♡</Text>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyText}>
          Tap the heart on today's artwork to save it here.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.heading}>Your Collection</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { width: cardWidth }]}
            onPress={() => setZoomUrl(item.imageUrl)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: cardWidth, height: cardWidth * 1.2 }}
              contentFit="cover"
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardArtist} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
          </Pressable>
        )}
      />
      <ZoomModal
        visible={!!zoomUrl}
        imageUrl={zoomUrl ?? ''}
        onClose={() => setZoomUrl(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#1A1A1A',
    paddingHorizontal: GRID_PADDING,
    marginBottom: 12,
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 24,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInfo: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 2,
  },
  cardArtist: {
    fontSize: 11,
    fontFamily: 'Helvetica Neue',
    color: '#666',
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
});
