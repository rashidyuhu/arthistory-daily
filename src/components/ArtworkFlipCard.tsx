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
import { Artwork } from '../types';
import { theme } from '../theme';
import { DescriptionPopover } from './DescriptionPopover';
import { ZoomModal } from './ZoomModal';

const PREVIEW_LENGTH = 200;
const CREAM = '#F5F0EA';

// Info panel fixed height (padding + two text rows)
const INFO_H = 76;
// Image mat — same as info panel horizontal padding
const IMG_PAD = 14;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W = SCREEN_W - 16; // container has 8px padding each side
const IMG_W = CARD_W - IMG_PAD * 2; // available image width inside mat
const MAX_CARD_H = SCREEN_H * 0.82;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Filled pie showing remaining time — full circle at midnight, drains clockwise through the day
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
      return `M ${cx} ${(cy - r).toFixed(2)} A ${r} ${r} 0 1 1 ${cx} ${(cy + r).toFixed(2)} A ${r} ${r} 0 1 1 ${cx} ${(cy - r).toFixed(2)} Z`;
    }
    if (progress <= 0.0001) return null;
    const start = -Math.PI / 2;
    const end = start + 2 * Math.PI * progress;
    const x1 = (cx + r * Math.cos(start)).toFixed(3);
    const y1 = (cy + r * Math.sin(start)).toFixed(3);
    const x2 = (cx + r * Math.cos(end)).toFixed(3);
    const y2 = (cy + r * Math.sin(end)).toFixed(3);
    const large = progress > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  })();

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} fill="rgba(44,24,16,0.1)" />
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

  const flipRotation = useSharedValue(0);
  const labelFlip = useSharedValue(1);

  // Card height: image fits in (IMG_W × imgH) mat, plus info panel, plus top mat padding
  const cardH = naturalSize
    ? Math.min(IMG_W * (naturalSize.h / naturalSize.w) + INFO_H + IMG_PAD, MAX_CARD_H)
    : IMG_W * 1.25 + INFO_H + IMG_PAD; // default 4:5 portrait while image loads

  useEffect(() => {
    setIsFlipped(false);
    flipRotation.value = 0;
    setImageError(false);
    setNaturalSize(null);
    labelFlip.value = 1;
  }, [artwork.id]);

  // "FLIP CARD" label does a scaleX card-flip animation every 10s
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
    <View style={styles.container}>
      {/* Card — explicit height, not flex */}
      <View style={[styles.card, { height: cardH }]}>

        {/* — Front side — */}
        <Animated.View style={[styles.cardSide, frontAnimatedStyle]}>

          {/* Image with 14px mat on top, left, right; info panel at bottom */}
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

          {/* Cream info panel — same background as mat */}
          <View style={styles.infoOverlay} pointerEvents="box-none">
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
    // No flex — parent decides layout (daily: flex-end, collection: flex-start)
    paddingHorizontal: 8,
    paddingBottom: 0,
    alignSelf: 'stretch',
  },

  card: {
    // height set via inline style from cardH
    backgroundColor: CREAM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 14,
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

  // Image sits inside a 14px cream mat (top, left, right); info panel at bottom
  imageArea: {
    position: 'absolute',
    top: IMG_PAD,
    left: IMG_PAD,
    right: IMG_PAD,
    bottom: INFO_H,
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

  // Cream info panel — shares same background as image mat
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CREAM,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(44,24,16,0.12)',
    paddingHorizontal: IMG_PAD,
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
