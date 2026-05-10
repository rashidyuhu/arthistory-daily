import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Artwork } from '../types';
import { ArtworkFlipCard } from '../components/ArtworkFlipCard';
import { theme } from '../theme';

interface DailyScreenProps {
  artwork: Artwork | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function DailyScreen({ artwork, isLoading, isError, error }: DailyScreenProps) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading today's artwork...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.errorTitle}>Unable to load artwork</Text>
        <Text style={styles.errorText}>
          {error?.message ?? 'An unexpected error occurred'}
        </Text>
        <Text style={styles.errorHint}>Check your internet connection and try again.</Text>
      </ScrollView>
    );
  }

  if (!artwork) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>No artwork available</Text>
        <Text style={styles.errorText}>Please check back later.</Text>
      </View>
    );
  }

  return <ArtworkFlipCard artwork={artwork} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Helvetica Neue',
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 13,
    fontFamily: 'Helvetica Neue',
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
});
