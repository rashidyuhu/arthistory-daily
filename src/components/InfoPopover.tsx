import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const POPOVER_HEIGHT = SCREEN_HEIGHT * 0.88; // 88% of screen height

interface InfoPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoPopover({ isOpen, onClose }: InfoPopoverProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isOpen]);

  const animatedPopoverStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > 100 || event.velocityY > 500;
      if (shouldClose) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        opacity.value = withTiming(0, { duration: 150 });
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: 250 });
      }
    });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.popover, animatedPopoverStyle]}>
            {/* Handle bar */}
            <View style={styles.handleBar} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>About</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* App Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What is this?</Text>
                <Text style={styles.sectionText}>
                  Art History Daily is a creative challenge app that presents you with a new artwork from the National Gallery of Art every day. Each day at midnight UTC, a new artwork is revealed for you to recreate and interpret in your own style.
                </Text>
              </View>

              {/* How it works */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How it works</Text>
                <Text style={styles.sectionText}>
                  Every day, you'll see a new artwork from the public domain. Your challenge is to recreate and interpret this artwork in your own creative style. Share your interpretation on social media using the hashtag below to connect with other artists and art enthusiasts.
                </Text>
              </View>

              {/* Hashtag */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Share your work</Text>
                <View style={styles.hashtagContainer}>
                  <Text style={styles.hashtag}>#ArtHistoryDaily</Text>
                </View>
                <Text style={styles.sectionText}>
                  Use this hashtag when sharing your recreations on social media to join the community!
                </Text>
              </View>

              {/* Credits */}
              <View style={styles.section}>
                <Text style={styles.creditsText}>
                  Artworks provided by the National Gallery of Art (USA), Open Access.
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  popover: {
    height: POPOVER_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingTop: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h2,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionText: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  hashtagContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
  },
  hashtag: {
    ...theme.typography.h2,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  creditsText: {
    ...theme.typography.bodySmall,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
