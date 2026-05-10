import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../types';
import { getFavorites } from '../services/favorites';
import { ArtworkFlipCard } from '../components/ArtworkFlipCard';
import { theme } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 12;
const COL_GAP = 8;
const COL_W = (SCREEN_W - H_PAD * 2 - COL_GAP) / 2;

// Returns image height for a card given the artwork's natural dimensions (or a 3:4 fallback)
function getImageHeight(artwork: Artwork): number {
  if (artwork.imageWidth && artwork.imageHeight && artwork.imageWidth > 0) {
    return COL_W * (artwork.imageHeight / artwork.imageWidth);
  }
  return COL_W * 1.33; // default 3:4 portrait
}

interface CollectionCardProps {
  artwork: Artwork;
  onPress: () => void;
}

function CollectionCard({ artwork, onPress }: CollectionCardProps) {
  const imgH = getImageHeight(artwork);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: artwork.imageUrl }}
        style={{ width: COL_W, height: imgH }}
        contentFit="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{artwork.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {artwork.year} · {artwork.artist}
        </Text>
      </View>
    </Pressable>
  );
}

export function CollectionScreen() {
  const [favorites, setFavorites] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const insets = useSafeAreaInsets();

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
          Tap Save on today's artwork to add it here.
        </Text>
      </View>
    );
  }

  // Distribute items into two columns alternating (left: 0,2,4… right: 1,3,5…)
  const leftCol = favorites.filter((_, i) => i % 2 === 0);
  const rightCol = favorites.filter((_, i) => i % 2 === 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.heading}>Your Collection</Text>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {leftCol.map((item) => (
            <CollectionCard
              key={item.id}
              artwork={item}
              onPress={() => setSelected(item)}
            />
          ))}
        </View>
        <View style={styles.column}>
          {rightCol.map((item) => (
            <CollectionCard
              key={item.id}
              artwork={item}
              onPress={() => setSelected(item)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Full artwork detail modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Coral header matching nav bar */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelected(null)}
              hitSlop={12}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Collection</Text>
            </TouchableOpacity>
          </View>

          {/* Card — sits at top of remaining space (no floating) */}
          <View style={styles.modalContent}>
            {selected && <ArtworkFlipCard artwork={selected} />}
          </View>
        </View>
      </Modal>
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
    color: '#FFFFFF',
    paddingHorizontal: H_PAD,
    marginBottom: 12,
  },

  // Masonry grid
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: H_PAD,
    paddingBottom: 32,
    gap: COL_GAP,
  },
  column: {
    flex: 1,
    gap: COL_GAP,
  },

  // Collection card
  card: {
    backgroundColor: '#F5F0EA',
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 3,
  },
  cardMeta: {
    fontSize: 10,
    fontFamily: 'Helvetica Neue',
    color: 'rgba(44,24,16,0.55)',
    letterSpacing: 0.1,
  },

  // Empty state
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Detail modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  modalContent: {
    flex: 1,
    paddingTop: 12,
  },
});
