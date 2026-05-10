import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PortraitIcon,
  GalleryIcon,
  BirdIcon,
  EyeIcon,
  BookmarkFillIcon,
  BookmarkIcon,
} from './icons';
import { theme } from '../theme';

export type Tab = 'daily' | 'collection';

interface NavBarProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  isFav: boolean;
  onFavorite: () => void;
  onShare: () => void;
  onInfo: () => void;
}

const BG = theme.colors.background;
const WHITE = '#FFFFFF';

export function NavBar({
  activeTab,
  onChangeTab,
  isFav,
  onFavorite,
  onShare,
  onInfo,
}: NavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>

      {/* Daily tab */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => onChangeTab('daily')}
        activeOpacity={0.75}
      >
        <PortraitIcon size={26} color={WHITE} />
        <Text style={[styles.label, activeTab === 'daily' && styles.labelActive]}>
          Daily
        </Text>
        {activeTab === 'daily' && <View style={styles.activePill} />}
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Save */}
      <TouchableOpacity style={styles.action} onPress={onFavorite} hitSlop={10} activeOpacity={0.75}>
        {isFav
          ? <BookmarkFillIcon size={24} color={WHITE} />
          : <BookmarkIcon size={24} color={WHITE} />
        }
        <Text style={styles.label}>Save</Text>
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity style={styles.action} onPress={onShare} hitSlop={10} activeOpacity={0.75}>
        <BirdIcon size={24} color={WHITE} />
        <Text style={styles.label}>Share</Text>
      </TouchableOpacity>

      {/* About */}
      <TouchableOpacity style={styles.action} onPress={onInfo} hitSlop={10} activeOpacity={0.75}>
        <EyeIcon size={24} color={WHITE} />
        <Text style={styles.label}>About</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Collection tab */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => onChangeTab('collection')}
        activeOpacity={0.75}
      >
        <GalleryIcon size={26} color={WHITE} />
        <Text style={[styles.label, activeTab === 'collection' && styles.labelActive]}>
          Collection
        </Text>
        {activeTab === 'collection' && <View style={styles.activePill} />}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: BG,
    paddingTop: 10,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  item: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    gap: 3,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Helvetica Neue',
    fontWeight: '500',
    letterSpacing: 0.2,
    color: WHITE,
  },
  labelActive: {
    fontWeight: '700',
  },
  activePill: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    backgroundColor: WHITE,
    borderRadius: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
  },
});
