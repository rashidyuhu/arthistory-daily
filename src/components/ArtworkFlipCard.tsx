import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../types';
import { theme } from '../theme';
import { CountdownTimer } from './CountdownTimer';
import { DescriptionPopover } from './DescriptionPopover';
import { ZoomModal } from './ZoomModal';
import { FlipIcon } from './icons';

const PREVIEW_LENGTH = 200;

interface ArtworkFlipCardProps {
  artwork: Artwork;
}

export function ArtworkFlipCard({ artwork }: ArtworkFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const insets = useSafeAreaInsets();
  const flipRotation = useSharedValue(0);

  useEffect(() => {
    setIsFlipped(false);
    flipRotation.value = 0;
    setImageError(false);
  }, [artwork.id]);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    flipRotation.value = withTiming(toValue, { duration: 380 });
    setIsFlipped(!isFlipped);
  };

  const getEncodedImageUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const assetParam = urlObj.searchParams.get('asset');
      if (assetParam) {
        urlObj.searchParams.set('asset', assetParam);
        return urlObj.toString();
      }
      return url;
    } catch {
      const match = url.match(/asset=([^&]*)/);
      if (match) {
        return url.replace(/asset=[^&]*/, `asset=${encodeURIComponent(match[1])}`);
      }
      return url;
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [0, 180], Extrapolate.CLAMP);
    const opacity = interpolate(flipRotation.value, [0, 90, 180], [1, 0, 0], Extrapolate.CLAMP);
    return { transform: [{ rotateY: `${rotateY}deg` }], opacity };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [180, 360], Extrapolate.CLAMP);
    const opacity = interpolate(flipRotation.value, [0, 90, 180], [0, 0, 1], Extrapolate.CLAMP);
    return { transform: [{ rotateY: `${rotateY}deg` }], opacity };
  });

  const encodedUrl = getEncodedImageUrl(artwork.imageUrl);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>

      {/* Card — fills all available vertical space */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>

          {/* — Front side: image only — */}
          <Animated.View style={[styles.cardSide, frontAnimatedStyle]}>
            {/* Image: tap → zoom */}
            <Pressable
              style={styles.imageArea}
              onPress={() => !imageError && setIsZoomOpen(true)}
            >
              {!imageError ? (
                <Image
                  source={{ uri: encodedUrl }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={styles.imageError}>
                  <Text style={styles.imageErrorText}>Image unavailable</Text>
                  <Text style={styles.imageErrorSubtext}>{artwork.title}</Text>
                </View>
              )}
            </Pressable>

            {/* Flip button — overlaid bottom-right of image */}
            <TouchableOpacity
              style={styles.flipOverlay}
              onPress={handleFlip}
              hitSlop={12}
            >
              <FlipIcon size={18} color="rgba(0,0,0,0.35)" />
            </TouchableOpacity>
          </Animated.View>

          {/* — Back side: details — */}
          <Animated.View style={[styles.cardSide, styles.cardBack, backAnimatedStyle]}>
            <ScrollView
              style={styles.backScroll}
              contentContainerStyle={styles.backContent}
              showsVerticalScrollIndicator={false}
            >
              {([
                { label: 'Medium', value: artwork.medium },
                { label: 'Classification', value: artwork.classification || 'Unknown' },
                { label: 'Credit', value: artwork.creditLine },
                { label: 'Collection', value: artwork.source },
              ] as { label: string; value: string }[]).map(({ label, value }) => (
                <View style={styles.detailRow} key={label}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}

              {artwork.imageDescription && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>About</Text>
                  <Text style={styles.detailValue}>
                    {artwork.imageDescription.length <= PREVIEW_LENGTH
                      ? artwork.imageDescription
                      : `${artwork.imageDescription.slice(0, PREVIEW_LENGTH)}…`}
                  </Text>
                  {artwork.imageDescription.length > PREVIEW_LENGTH && (
                    <TouchableOpacity
                      onPress={() => setIsDescriptionOpen(true)}
                      style={styles.readMore}
                    >
                      <Text style={styles.readMoreText}>Read more</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity onPress={handleFlip} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to artwork</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>

      {/* Info section — below the card */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={styles.artistYear} numberOfLines={1}>
              {artwork.year}
              {artwork.artistDisplayDate
                ? ` / ${artwork.artist} (${artwork.artistDisplayDate})`
                : ` / ${artwork.artist}`}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {artwork.title}
            </Text>
          </View>
          <CountdownTimer variant="text" />
        </View>
      </View>

      {/* Modals */}
      <ZoomModal
        visible={isZoomOpen}
        imageUrl={encodedUrl}
        onClose={() => setIsZoomOpen(false)}
      />
      {artwork.imageDescription && (
        <DescriptionPopover
          visible={isDescriptionOpen}
          onClose={() => setIsDescriptionOpen(false)}
          title="About the artwork"
          text={artwork.imageDescription}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // Card
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  cardSide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },

  // Front
  imageArea: {
    flex: 1,
    backgroundColor: '#F5F0EA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  flipOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 7,
  },
  imageError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageErrorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  imageErrorSubtext: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },

  // Back
  cardBack: {
    backgroundColor: '#F4E8D8',
  },
  backScroll: {
    flex: 1,
  },
  backContent: {
    padding: 20,
    paddingBottom: 8,
  },
  detailRow: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(44,24,16,0.15)',
    borderRadius: 3,
    padding: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
    lineHeight: 20,
  },
  readMore: {
    marginTop: 6,
  },
  readMoreText: {
    fontSize: 13,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44,24,16,0.15)',
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
  },

  // Info below card
  infoSection: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
  artistYear: {
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#1A1A1A',
    lineHeight: 26,
  },
});
