import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ~15% into next/prev page is enough to snap there – smooth, predictable swipe
const SNAP_THRESHOLD = 0.15;
// Forward: switch card at 40% so current card flies out, next appears sooner
const FORWARD_CARD_SWITCH = 0.4;
// Back: switch card at 40% into previous page – symmetric with forward
const BACK_CARD_SWITCH = 0.4;
function getPageFromOffset(x: number): number {
  return Math.min(2, Math.max(0, Math.floor(x / SCREEN_WIDTH + SNAP_THRESHOLD)));
}

const NUM_CARDS = 3;
const CARD_IMAGES = [
  require('../../assets/onboarding/onboarding-card-1.png'),
  require('../../assets/onboarding/onboarding-card-2.png'),
  require('../../assets/onboarding/onboarding-card-3.png'),
];
if (CARD_IMAGES.length !== NUM_CARDS) {
  console.warn('Onboarding expects exactly 3 card images');
}

const MAX_CARD_WIDTH = SCREEN_WIDTH * 0.72;
const MAX_CARD_HEIGHT = SCREEN_HEIGHT * 0.45;

function getCardDimensions(): { width: number; height: number }[] {
  return CARD_IMAGES.map((src) => {
    const resolved = Image.resolveAssetSource(src);
    const w = resolved?.width;
    const h = resolved?.height;
    if (typeof w !== 'number' || typeof h !== 'number') {
      return { width: MAX_CARD_WIDTH, height: Math.min(MAX_CARD_HEIGHT, MAX_CARD_WIDTH * 1.2) };
    }
    const scaleW = MAX_CARD_WIDTH / w;
    const scaleH = MAX_CARD_HEIGHT / h;
    const scale = Math.min(scaleW, scaleH, 1);
    return { width: w * scale, height: h * scale };
  });
}

const CARD_DIMENSIONS = getCardDimensions();
const CARD_OFFSET = 12;
const CARD_ROTATION = 4;
const FALLBACK_DIM = { width: MAX_CARD_WIDTH, height: Math.min(MAX_CARD_HEIGHT, MAX_CARD_WIDTH * 1.2) };
const CARD_SLOT_WIDTH = Math.min(
  MAX_CARD_WIDTH,
  Math.max(...CARD_DIMENSIONS.map((d) => d?.width ?? FALLBACK_DIM.width), FALLBACK_DIM.width)
);
const CARD_SLOT_HEIGHT = Math.min(
  MAX_CARD_HEIGHT,
  Math.max(...CARD_DIMENSIONS.map((d) => d?.height ?? FALLBACK_DIM.height), FALLBACK_DIM.height)
);
const STACK_WIDTH = CARD_SLOT_WIDTH + CARD_OFFSET * 2;
const STACK_HEIGHT = CARD_SLOT_HEIGHT + CARD_OFFSET * 0;
// Offset to center the front card: stack is wider than front card due to stacked cards
const FRONT_CARD_WIDTH = CARD_DIMENSIONS[0]?.width ?? CARD_SLOT_WIDTH;
const CENTER_OFFSET = (STACK_WIDTH - FRONT_CARD_WIDTH) / 2;
const CARD_RIGHT_SHIFT = 26;

const SLIDES: { title: string; body: string }[] = [
  {
    title: 'One artwork. Every day.',
    body: "Each day we curate a single artwork from art history. Take a moment to look, slow down, and discover something new.",
  },
  {
    title: 'Create your own version.',
    body: "Recreate and interpret the artwork in your own style. Any technique, any level, any mood. Make it yours.",
  },
  {
    title: 'Try any way you like. No rules',
    body: "Draw digitally, use collage, take a photo, or recreate it by hand. It's all about inspiration and creating.",
  },
];

// --- Part 1: Single card stack (no duplicates). One stack, scroll-driven animation. ---

import type { SharedValue } from 'react-native-reanimated';

interface OnboardingCardStackProps {
  scrollX: SharedValue<number>;
  displayPage: number;
}

function OnboardingCardStack({ scrollX, displayPage }: OnboardingCardStackProps) {
  const sw = SCREEN_WIDTH;
  const page = Math.min(2, Math.max(0, displayPage));

  // All card positions, opacity, and transform driven continuously from scrollX to avoid jumps
  const animatedStyle0 = useAnimatedStyle(() => {
    'worklet';
    const x = scrollX.value;
    const tx = interpolate(x, [0, sw], [0, -sw], Extrapolation.CLAMP);
    const op = interpolate(x, [0, sw], [1, 0], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: tx }],
      opacity: op,
    };
  });
  const animatedStyle1 = useAnimatedStyle(() => {
    'worklet';
    const x = scrollX.value;
    let tx: number;
    let ty: number;
    let rot: number;
    let op: number;
    if (x <= sw) {
      tx = interpolate(x, [0, sw], [-CARD_OFFSET, 0], Extrapolation.CLAMP);
      ty = interpolate(x, [0, sw], [CARD_OFFSET, 0], Extrapolation.CLAMP);
      rot = interpolate(x, [0, sw], [-CARD_ROTATION / 2, 0], Extrapolation.CLAMP);
      op = 1;
    } else {
      tx = interpolate(x, [sw, 2 * sw], [0, -sw], Extrapolation.CLAMP);
      ty = 0;
      rot = 0;
      op = interpolate(x, [sw, 2 * sw], [1, 0], Extrapolation.CLAMP);
    }
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${rot}deg` }],
      opacity: op,
    };
  });
  const animatedStyle2 = useAnimatedStyle(() => {
    'worklet';
    const x = scrollX.value;
    let tx: number;
    let ty: number;
    let rot: number;
    let op: number;
    if (x <= sw) {
      tx = interpolate(x, [0, sw], [-CARD_OFFSET * 2, -CARD_OFFSET], Extrapolation.CLAMP);
      ty = interpolate(x, [0, sw], [CARD_OFFSET * 2, CARD_OFFSET], Extrapolation.CLAMP);
      rot = interpolate(x, [0, sw], [-CARD_ROTATION, -CARD_ROTATION / 2], Extrapolation.CLAMP);
      op = 1;
    } else if (x <= 2 * sw) {
      tx = interpolate(x, [sw, 2 * sw], [-CARD_OFFSET, 0], Extrapolation.CLAMP);
      ty = interpolate(x, [sw, 2 * sw], [CARD_OFFSET, 0], Extrapolation.CLAMP);
      rot = interpolate(x, [sw, 2 * sw], [-CARD_ROTATION / 2, 0], Extrapolation.CLAMP);
      op = 1;
    } else {
      tx = interpolate(x, [2 * sw, 3 * sw], [0, -sw], Extrapolation.CLAMP);
      ty = 0;
      rot = 0;
      op = interpolate(x, [2 * sw, 3 * sw], [1, 0], Extrapolation.CLAMP);
    }
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${rot}deg` }],
      opacity: op,
    };
  });

  const isCard0Visible = page === 0;
  const isCard1Visible = page === 0 || page === 1;
  const isCard2Visible = true;

  return (
    <View style={cardStackStyles.section}>
      <View style={[cardStackStyles.stack, { width: STACK_WIDTH, height: STACK_HEIGHT }]}>
        <Animated.View
          pointerEvents={isCard0Visible ? 'auto' : 'none'}
          style={[
            cardStackStyles.card,
            {
              left: 0,
              top: 0,
              width: CARD_DIMENSIONS[0]?.width ?? CARD_SLOT_WIDTH,
              height: CARD_DIMENSIONS[0]?.height ?? CARD_SLOT_HEIGHT,
              zIndex: 3,
            },
            animatedStyle0,
          ]}
        >
          <Image source={CARD_IMAGES[0]} style={cardStackStyles.cardImage} resizeMode="contain" />
        </Animated.View>
        <Animated.View
          pointerEvents={isCard1Visible ? 'auto' : 'none'}
          style={[
            cardStackStyles.card,
            {
              left: 0,
              top: 0,
              width: CARD_DIMENSIONS[1]?.width ?? CARD_SLOT_WIDTH,
              height: CARD_DIMENSIONS[1]?.height ?? CARD_SLOT_HEIGHT,
              zIndex: 2,
            },
            animatedStyle1,
          ]}
        >
          <Image source={CARD_IMAGES[1]} style={cardStackStyles.cardImage} resizeMode="contain" />
        </Animated.View>
        <Animated.View
          pointerEvents={isCard2Visible ? 'auto' : 'none'}
          style={[
            cardStackStyles.card,
            {
              left: 0,
              top: 0,
              width: CARD_DIMENSIONS[2]?.width ?? CARD_SLOT_WIDTH,
              height: CARD_DIMENSIONS[2]?.height ?? CARD_SLOT_HEIGHT,
              zIndex: 1,
            },
            animatedStyle2,
          ]}
        >
          <Image source={CARD_IMAGES[2]} style={cardStackStyles.cardImage} resizeMode="contain" />
        </Animated.View>
      </View>
    </View>
  );
}

const cardStackStyles = StyleSheet.create({
  section: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    marginBottom: theme.spacing.xs,
    marginLeft: CENTER_OFFSET + CARD_RIGHT_SHIFT,
  },
  card: {
    position: 'absolute',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});

// --- Part 2: Text slides only (no cards). Horizontal pager. ---

interface OnboardingTextSlidesProps {
  onComplete: () => void;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  currentIndex: number;
  flatListRef?: React.RefObject<FlatList | null>;
}

function OnboardingTextSlides({
  onComplete,
  onScroll,
  onMomentumScrollEnd,
  onScrollEndDrag,
  currentIndex,
  flatListRef: externalRef,
}: OnboardingTextSlidesProps) {
  const internalRef = useRef<FlatList>(null);
  const listRef = externalRef ?? internalRef;
  const renderSlide = useCallback(
    ({ item, index }: { item: (typeof SLIDES)[number]; index: number }) => (
      <View style={[textStyles.slide, { width: SCREEN_WIDTH }]}>
        <Text style={textStyles.title}>{item.title}</Text>
        <Text style={textStyles.body}>{item.body}</Text>
        {index === SLIDES.length - 1 && (
          <TouchableOpacity
            style={textStyles.cta}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Text style={textStyles.ctaText}>Show me todays artwork</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [onComplete]
  );

  return (
    <>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={true}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      <View style={textStyles.indicators}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              textStyles.indicator,
              currentIndex === i ? textStyles.indicatorActive : textStyles.indicatorInactive,
            ]}
          />
        ))}
      </View>
    </>
  );
}

const textStyles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h1,
    fontFamily: theme.typography.fontFamily.playfair,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  body: {
    ...theme.typography.body,
    color: '#000000',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  cta: {
    backgroundColor: '#000000',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  ctaText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  indicator: {
    borderRadius: 100,
  },
  indicatorInactive: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  indicatorActive: {
    width: 24,
    height: 8,
    backgroundColor: theme.colors.surface,
  },
});

// --- Main screen: card section + text section (two separate parts) ---

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPageState, setDisplayPageState] = useState(0);
  const scrollX = useSharedValue(0);
  const lastX = useRef(0);
  const lastPage = useRef(0);
  const lastIndex = useRef(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      scrollX.value = x;
      const goingBack = x < lastX.current;
      lastX.current = x;
      const index = getPageFromOffset(x);
      if (lastIndex.current !== index) {
        lastIndex.current = index;
        setCurrentIndex(index);
      }
      if (goingBack) {
        // Back: switch card when threshold into previous page – card flies in rest of the way
        if (x <= (lastPage.current - 1 + BACK_CARD_SWITCH) * SCREEN_WIDTH && lastPage.current > 0) {
          const prevPage = lastPage.current - 1;
          lastPage.current = prevPage;
          setDisplayPageState(prevPage);
        } else if (lastPage.current !== index) {
          lastPage.current = index;
          setDisplayPageState(index);
        }
      } else {
        // Forward: switch card at 50% so current card flies out fully, then next appears (same feel as back)
        if (index > lastPage.current && x >= (lastPage.current + FORWARD_CARD_SWITCH) * SCREEN_WIDTH) {
          lastPage.current = index;
          setDisplayPageState(index);
        }
      }
    },
    [scrollX]
  );

  const syncDisplayPage = useCallback((x: number) => {
    const page = getPageFromOffset(x);
    lastX.current = x;
    lastPage.current = page;
    lastIndex.current = page;
    setDisplayPageState(page);
    setCurrentIndex(page);
  }, []);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncDisplayPage(e.nativeEvent.contentOffset.x);
    },
    [syncDisplayPage]
  );

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncDisplayPage(e.nativeEvent.contentOffset.x);
    },
    [syncDisplayPage]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.cardSectionWrapper}>
        <OnboardingCardStack scrollX={scrollX} displayPage={Math.min(2, Math.max(0, displayPageState))} />
      </View>
      <View style={styles.textSection}>
        <OnboardingTextSlides
          onComplete={onComplete}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          currentIndex={currentIndex}
          flatListRef={flatListRef}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  cardSectionWrapper: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  textSection: {
    flex: 0.8,
  },
});
