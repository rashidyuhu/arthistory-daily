import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Share, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DailyScreen } from '../src/screens/DailyScreen';
import { CollectionScreen } from '../src/screens/CollectionScreen';
import { NavBar, Tab } from '../src/components/NavBar';
import { OnboardingScreen } from '../src/components/OnboardingScreen';
import { InfoPopover } from '../src/components/InfoPopover';
import { useArtworks } from '../src/services/useArtworks';
import { checkIsFavorite, toggleFavorite } from '../src/services/favorites';
import { theme } from '../src/theme';

const ONBOARDING_KEY = 'hasCompletedOnboarding';
const FORCE_ONBOARDING = __DEV__ && false;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: Infinity },
  },
});

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [isFav, setIsFav] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { dailyArtwork, isLoading, isError, error } = useArtworks();

  useEffect(() => {
    if (dailyArtwork) {
      checkIsFavorite(dailyArtwork.id).then(setIsFav);
    }
  }, [dailyArtwork?.id]);

  // Refresh when app comes back to foreground (handles midnight artwork change)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && dailyArtwork) {
        checkIsFavorite(dailyArtwork.id).then(setIsFav);
      }
    });
    return () => sub.remove();
  }, [dailyArtwork?.id]);

  const handleFavorite = useCallback(async () => {
    if (!dailyArtwork) return;
    const newState = await toggleFavorite(dailyArtwork);
    setIsFav(newState);
  }, [dailyArtwork]);

  const handleShare = useCallback(async () => {
    if (!dailyArtwork) return;
    await Share.share({
      message: `${dailyArtwork.title} (${dailyArtwork.year})\n${dailyArtwork.artist}\n\n#ArtHistoryDaily`,
    });
  }, [dailyArtwork]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {activeTab === 'daily' ? (
          <DailyScreen
            artwork={dailyArtwork}
            isLoading={isLoading}
            isError={isError}
            error={error as Error | null}
          />
        ) : (
          <CollectionScreen />
        )}
      </View>
      <NavBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isFav={isFav}
        onFavorite={handleFavorite}
        onShare={handleShare}
        onInfo={() => setIsInfoOpen(true)}
      />
      <InfoPopover isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
