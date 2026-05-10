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
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../types';
import { theme } from '../theme';
import { DescriptionPopover } from './DescriptionPopover';
import { ZoomModal } from './ZoomModal';
import { FlipIcon } from './icons';

const PREVIEW_LENGTH = 200;
const CREAM = '#F5F0EA';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Small circular ring showing how much of today remains — fills clockwise from midnight
function DayProgressRing({ size = 22 }: { size?: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
      const minutesRemaining = 24 * 60 - minutesSinceMidnight;
      setProgress(minutesRemaining / (24 * 60));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const strokeW = 2.5;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="rgba(44,24,16,0.12)"
        strokeWidth={strokeW}
        fill="none"
      />
      {/* Progress arc */}
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="rgba(44,24,16,0.5)"
        strokeWidth={strokeW}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

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
  const idleScale = useSharedValue(1);

  useEffect(() => {
    setIsFlipped(false);
    flipRotation.value = 0;
    setImageError(false);
    idleScale.value = 1;
  }, [artwork.id]);

  // Periodic double-pulse to hint the card is flippable
  useEffect(() => {
    const pulse = () => {
      idleScale.value = withSequence(
        withTiming(1.25, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 160, easing: Easing.in(Easing.quad) }),
        withDelay(180,
          withSequence(
            withTiming(1.25, { duration: 180, easing: Easing.out(Easing.quad) }),
            withTiming(1.0, { duration: 160, easing: Easing.in(Easing.quad) }),
          ),
        ),
      );
    };
    const initial = setTimeout(pulse, 3200);
    const repeat = setInterval(pulse, 9000);
    return () => { clearTimeout(initial); clearInterval(repeat); };
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

  const flipButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: idleScale.value }],
  }));

  const encodedUrl = getEncodedImageUrl(artwork.imageUrl);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>

      <View style={styles.cardWrapper}>
        <View style={styles.card}>

          {/* — Front side — */}
          <Animated.View style={[styles.cardSide, frontAnimatedStyle]}>

            {/* Image — tap to zoom */}
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

            {/* Info overlay — cream panel at card bottom */}
            <View style={styles.infoOverlay} pointerEvents="box-none">
              {/* Row 1: artist / year + flip button */}
              <View style={styles.overlayRow1}>
                <Text style={styles.overlayArtistYear} numberOfLines={1}>
                  {artwork.year}
                  {artwork.artistDisplayDate
                    ? ` · ${artwork.artist} (${artwork.artistDisplayDate})`
                    : ` · ${artwork.artist}`}
                </Text>
                <AnimatedTouchable
                  style={[styles.flipButton, flipButtonStyle]}
                  onPress={handleFlip}
                  hitSlop={10}
                  activeOpacity={0.7}
                >
                  <FlipIcon size={17} color="#3a2010" />
                </AnimatedTouchable>
              </View>

              {/* Row 2: title + day progress ring */}
              <View style={styles.overlayRow2}>
                <Text style={styles.overlayTitle} numberOfLines={2}>
                  {artwork.title}
                </Text>
                <DayProgressRing size={24} />
              </View>
            </View>

          </Animated.View>

          {/* — Back side — */}
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
    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: CREAM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 12,
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
    backgroundColor: CREAM,
  },
  image: {
    width: '100%',
    height: '100%',
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

  // Cream info panel overlaid at the bottom of the front face
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CREAM,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(44,24,16,0.12)',
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 13,
  },
  overlayRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  overlayArtistYear: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Helvetica Neue',
    color: 'rgba(44,24,16,0.5)',
    letterSpacing: 0.2,
    marginRight: 8,
  },
  flipButton: {
    backgroundColor: 'rgba(44,24,16,0.07)',
    borderRadius: 16,
    padding: 6,
  },
  overlayRow2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  overlayTitle: {
    flex: 1,
    fontSize: 19,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#1A1A1A',
    lineHeight: 25,
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
});
