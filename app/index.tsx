import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  AppState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArtworkFlipCard } from '../src/components/ArtworkFlipCard';
import { OnboardingScreen } from '../src/components/OnboardingScreen';
import { useArtworks } from '../src/services/useArtworks';
import { theme } from '../src/theme';

const ONBOARDING_KEY = 'hasCompletedOnboarding';
// Set to true to always show onboarding in dev (for testing). Set to false when done.
const FORCE_ONBOARDING = __DEV__ && true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: Infinity,
    },
  },
});

function ArtworkScreen() {
  const [, forceUpdate] = useState(0);
  const { dailyArtwork, isLoading, isError, error } = useArtworks();

  // Re-render when app comes to foreground so getDayIndex() runs with current date
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        forceUpdate((n) => n + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading today's artwork...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        style={styles.container}
      >
        <Text style={styles.errorTitle}>Unable to load artwork</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </Text>
        <Text style={styles.errorHint}>
          Please check your internet connection and try again.
        </Text>
      </ScrollView>
    );
  }

  if (!dailyArtwork) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No artwork available</Text>
        <Text style={styles.emptySubtext}>
          Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ArtworkFlipCard artwork={dailyArtwork} />
    </View>
  );
}

function AppContent() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasCompletedOnboarding(FORCE_ONBOARDING ? false : value === 'true');
    });
  }, []);

  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').then(() => {
      setHasCompletedOnboarding(true);
    });
  };

  if (hasCompletedOnboarding === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <ArtworkScreen />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Pink background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
