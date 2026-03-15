import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
import { Ionicons } from '@expo/vector-icons';
import { Artwork } from '../types';
import { theme } from '../theme';
import { CountdownTimer } from './CountdownTimer';
import { InfoPopover } from './InfoPopover';
import { DescriptionPopover } from './DescriptionPopover';

const PREVIEW_LENGTH = 180;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_PADDING = theme.spacing.lg;
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.6; // 60% of screen height
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width

interface ArtworkFlipCardProps {
  artwork: Artwork;
}

export function ArtworkFlipCard({ artwork }: ArtworkFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const flipRotation = useSharedValue(0);

  // Helper function to ensure image URL is properly encoded
  const getEncodedImageUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const assetParam = urlObj.searchParams.get('asset');
      if (assetParam) {
        // Re-encode the asset parameter to ensure it's properly encoded
        urlObj.searchParams.set('asset', assetParam);
        return urlObj.toString();
      }
      return url;
    } catch {
      // If URL parsing fails, try to manually encode the asset parameter
      const match = url.match(/asset=([^&]*)/);
      if (match) {
        return url.replace(/asset=[^&]*/, `asset=${encodeURIComponent(match[1])}`);
      }
      return url;
    }
  };

  // Calculate image dimensions with constraints
  // Image width should match text width (accounting for container and content padding)
  const getTextWidth = () => {
    return SCREEN_WIDTH - CARD_PADDING * 1 - theme.spacing.lg * 1.5;
  };

  const getImageDimensions = () => {
    // Calculate available width for image (matching text width)
    const textWidth = getTextWidth();
    // Account for frame padding
    const availableImageWidth = textWidth - theme.spacing.md * 2;
    
    if (!artwork.imageWidth || !artwork.imageHeight) {
      // Default to text width if dimensions not available
      return {
        width: availableImageWidth,
        height: availableImageWidth,
        aspectRatio: 1,
      };
    }

    const aspectRatio = artwork.imageWidth / artwork.imageHeight;
    let width = availableImageWidth;
    let height = availableImageWidth / aspectRatio;

    // Constrain by max height if needed
    if (height > MAX_IMAGE_HEIGHT) {
      height = MAX_IMAGE_HEIGHT;
      width = height * aspectRatio;
    }

    return { width, height, aspectRatio };
  };

  const imageDimensions = getImageDimensions();

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    flipRotation.value = withTiming(toValue, {
      duration: 350,
    });
    setIsFlipped(!isFlipped);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 180],
      [0, 180],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      flipRotation.value,
      [0, 90, 180],
      [1, 0, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 180],
      [180, 360],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      flipRotation.value,
      [0, 90, 180],
      [0, 0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Header with countdown - Outside card */}
      <View style={styles.header}>
        <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
          Art challenge of the day
        </Text>
        <View style={styles.headerCountdown}>
          <CountdownTimer variant="text" />
        </View>
      </View>

      <ScrollView
        style={styles.cardScrollView}
        contentContainerStyle={styles.cardScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <Pressable onPress={handleFlip} style={styles.cardPressable}>
          {/* Front Side */}
          <Animated.View
            style={[styles.card, styles.cardFront, frontAnimatedStyle]}
          >
            {/* Image Container */}
            <View style={styles.imageContainer}>
              <View style={styles.imageFrame}>
                {!imageError ? (
                  <Image
                    source={{ uri: getEncodedImageUrl(artwork.imageUrl) }}
                    style={[
                      styles.image,
                      {
                        width: imageDimensions.width,
                        height: imageDimensions.height,
                        maxWidth: MAX_IMAGE_WIDTH,
                        maxHeight: MAX_IMAGE_HEIGHT,
                      },
                    ]}
                    contentFit="contain"
                    transition={200}
                    placeholderContentFit="contain"
                    onError={(error) => {
                      console.log('Image load error:', error);
                      console.log('Failed URL:', artwork.imageUrl);
                      console.log('Encoded URL:', getEncodedImageUrl(artwork.imageUrl));
                      setImageError(true);
                    }}
                  />
                ) : (
                  <View style={styles.imageErrorContainer}>
                    <Text style={styles.imageErrorText}>Image unavailable</Text>
                    <Text style={styles.imageErrorSubtext}>{artwork.title}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Text Section */}
            <View style={styles.frontContent}>
              <Text
                style={styles.artistYear}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {artwork.year} / {artwork.artist}{artwork.artistDisplayDate ? ` (${artwork.artistDisplayDate})` : ''}
              </Text>
              <Text
                style={styles.title}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {artwork.title}
              </Text>
            </View>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[styles.card, styles.cardBack, backAnimatedStyle]}
          >
            <ScrollView
              style={styles.backScrollView}
              contentContainerStyle={styles.backContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Medium</Text>
                <Text style={styles.detailValue}>{artwork.medium}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Classification</Text>
                <Text style={styles.detailValue}>{artwork.classification || 'Unknown'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Credit Line</Text>
                <Text style={styles.detailValue}>{artwork.creditLine}</Text>
              </View>
              {artwork.source && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Collection</Text>
                  <Text style={styles.detailValue}>{artwork.source}</Text>
                </View>
              )}
              {artwork.imageDescription && artwork.imageDescription.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>About the artwork</Text>
                  <Text style={styles.detailValue}>
                    {artwork.imageDescription.length <= PREVIEW_LENGTH
                      ? artwork.imageDescription
                      : `${artwork.imageDescription.slice(0, PREVIEW_LENGTH)}…`}
                  </Text>
                  {artwork.imageDescription.length > PREVIEW_LENGTH && (
                    <TouchableOpacity
                      onPress={() => setIsDescriptionOpen(true)}
                      style={styles.readMoreButton}
                    >
                      <Text style={styles.readMoreText}>Read more</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </Animated.View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Challenge Section - Fixed at bottom */}
      <View style={styles.challengeSection}>
        <Text style={styles.challengeText}>
          Recreate and interpret this artwork in your own style
        </Text>
        <TouchableOpacity
          onPress={() => setIsInfoOpen(true)}
          style={styles.infoButton}
          accessibilityLabel="Show app information"
          accessibilityRole="button"
        >
          <Text style={styles.infoButtonText}>i</Text>
        </TouchableOpacity>
      </View>

      {/* Info Popover */}
      <InfoPopover isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      {/* Description Popover (full image description) */}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: CARD_PADDING,
    backgroundColor: theme.colors.background,
  },
  cardScrollView: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.md,
  },
  cardContainer: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - CARD_PADDING * 2,
  },
  cardPressable: {
    width: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardFront: {
    paddingBottom: theme.spacing.lg,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4E8D8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  headerText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#000000',
    textAlign: 'left',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerCountdown: {
    flexShrink: 0,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 0,
  },
  imageFrame: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  image: {
    resizeMode: 'contain',
  },
  imageErrorContainer: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  imageErrorText: {
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  imageErrorSubtext: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  frontContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h1,
    fontFamily: theme.typography.fontFamily.playfair,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  artistYear: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#333333',
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  challengeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
    marginTop: theme.spacing.xs,
  },
  challengeText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#000000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  backScrollView: {
    flex: 1,
  },
  backContent: {
    padding: theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  detailRow: {
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(44,24,16,0.2)',
    borderRadius: 2,
    padding: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.caption,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    ...theme.typography.body,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
    letterSpacing: 0.5,
  },
  readMoreButton: {
    marginTop: theme.spacing.sm,
  },
  readMoreText: {
    ...theme.typography.bodySmall,
    fontFamily: 'SpecialElite_400Regular',
    color: '#2c1810',
    fontWeight: '700',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
});
