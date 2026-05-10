import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../types';
import { theme } from '../theme';
import { DescriptionPopover } from './DescriptionPopover';
import { ZoomModal } from './ZoomModal';

const PREVIEW_LENGTH = 200;
const CREAM = '#F5F0EA';

// Info panel height — paddingTop(9) + row1(~22) + gap(4) + row2(~25) + paddingBottom(13) ≈ 73
const INFO_H = 76;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W = SCREEN_W - 16; // container has 8px padding each side
const MAX_CARD_H = SCREEN_H * 0.80;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Filled pie chart showing remaining time in the day.
// Full circle at midnight (new challenge), drains clockwise to empty at 11:59pm.
function DayPie({ size = 26 }: { size?: number }) {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const elapsed = now.getHours() * 60 + now.getMinutes();
      setProgress((24 * 60 - elapsed) / (24 * 60));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const piePath = (() => {
    if (progress >= 0.9999) {
      // Full circle: SVG arc can't go 360° in one command, use two 180° arcs
      return `M ${cx} ${(cy - r).toFixed(2)} A ${r} ${r} 0 1 1 ${cx} ${(cy + r).toFixed(2)} A ${r} ${r} 0 1 1 ${cx} ${(cy - r).toFixed(2)} Z`;
    }
    if (progress <= 0.0001) return null;
    const startA = -Math.PI / 2; // 12 o'clock
    const endA = startA + 2 * Math.PI * progress;
    const x1 = (cx + r * Math.cos(startA)).toFixed(3);
    const y1 = (cy + r * Math.sin(startA)).toFixed(3);
    const x2 = (cx + r * Math.cos(endA)).toFixed(3);
    const y2 = (cy + r * Math.sin(endA)).toFixed(3);
    const large = progress > 0.5 ? 1 : 0;
    // Clockwise sweep (flag=1): filled arc from 12 o'clock shrinks as day progresses
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  })();

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Empty-state track */}
      <Circle cx={cx} cy={cy} r={r} fill="rgba(44,24,16,0.1)" />
      {/* Filled remaining portion */}
      {piePath && <Path d={piePath} fill="rgba(44,24,16,0.58)" />}
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
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const insets = useSafeAreaInsets();
  const flipRotation = useSharedValue(0);
  const labelFlip = useSharedValue(1); // scaleX: 1 → 0 → 1 simulates card flip

  // Card height: image natural ratio + info panel, capped at 80% of screen
  const cardH = naturalSize
    ? Math.min(CARD_W * (naturalSize.h / naturalSize.w) + INFO_H, MAX_CARD_H)
    : CARD_W * 1.25 + INFO_H; // default 4:5 portrait while loading

  useEffect(() => {
    setIsFlipped(false);
    flipRotation.value = 0;
    setImageError(false);
    setNaturalSize(null);
    labelFlip.value = 1;
  }, [artwork.id]);

  // "Flip Card" label does a 3D-style scaleX flip every 10s to hint interactivity
  useEffect(() => {
    const doFlip = () => {
      labelFlip.value = withSequence(
        withTiming(0, { duration: 230, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 230, easing: Easing.out(Easing.quad) }),
      );
    };
    const t = setTimeout(doFlip, 2800);
    const interval = setInterval(doFlip, 10_000);
    return () => { clearTimeout(t); clearInterval(interval); };
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

  const flipLabelStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: labelFlip.value }],
  }));

  const encodedUrl = getEncodedImageUrl(artwork.imageUrl);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>

      {/* Card sized to image natural height */}
      <View style={[styles.card, { height: cardH }]}>

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
                contentPosition="top"
                transition={200}
                onError={() => setImageError(true)}
                onLoad={(e) => {
                  const { width: w, height: h } = e.source;
                  if (w && h) setNaturalSize({ w, h });
                }}
              />
            ) : (
              <View style={styles.imageError}>
                <Text style={styles.imageErrorText}>Image unavailable</Text>
                <Text style={styles.imageErrorSubtext}>{artwork.title}</Text>
              </View>
            )}
          </Pressable>

          {/* Cream info panel — overlaid at bottom of card */}
          <View style={styles.infoOverlay} pointerEvents="box-none">
            {/* Row 1: artist / year + animated "Flip Card" label */}
            <View style={styles.overlayRow1}>
              <Text style={styles.overlayArtistYear} numberOfLines={1}>
                {artwork.year}
                {artwork.artistDisplayDate
                  ? ` · ${artwork.artist} (${artwork.artistDisplayDate})`
                  : ` · ${artwork.artist}`}
              </Text>
              <AnimatedTouchable
                style={[styles.flipLabel, flipLabelStyle]}
                onPress={handleFlip}
                hitSlop={10}
                activeOpacity={0.65}
              >
                <Text style={styles.flipLabelText}>Flip Card</Text>
              </AnimatedTouchable>
            </View>

            {/* Row 2: title + day pie */}
            <View style={styles.overlayRow2}>
              <Text style={styles.overlayTitle} numberOfLines={2}>
                {artwork.title}
              </Text>
              <DayPie size={26} />
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
    alignItems: 'stretch',
  },

  card: {
    // height set dynamically via inline style
    backgroundColor: CREAM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    borderRadius: 3,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

  // Cream info panel
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
    marginBottom: 5,
  },
  overlayArtistYear: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Helvetica Neue',
    color: 'rgba(44,24,16,0.5)',
    letterSpacing: 0.2,
    marginRight: 8,
  },
  // "Flip Card" label — scaleX animated to simulate card flip
  flipLabel: {
    borderWidth: 1,
    borderColor: 'rgba(44,24,16,0.18)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flipLabelText: {
    fontSize: 9,
    fontFamily: 'SpecialElite_400Regular',
    color: 'rgba(44,24,16,0.52)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
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
