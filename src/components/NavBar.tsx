import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PortraitIcon,
  GalleryIcon,
  ShareIcon,
  InfoIcon,
  HeartFillIcon,
  HeartOutlineIcon,
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

const BG = theme.colors.background; // coral #FF7676
const ACTIVE = '#FFFFFF';
const INACTIVE = 'rgba(255,255,255,0.45)';

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
        activeOpacity={0.7}
      >
        <PortraitIcon size={26} color={activeTab === 'daily' ? ACTIVE : INACTIVE} />
        <Text style={[styles.label, { color: activeTab === 'daily' ? ACTIVE : INACTIVE }]}>
          Daily
        </Text>
        {activeTab === 'daily' && <View style={styles.activePill} />}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Favourite */}
      <TouchableOpacity style={styles.action} onPress={onFavorite} hitSlop={10} activeOpacity={0.7}>
        {isFav
          ? <HeartFillIcon size={24} color="#FFD0D0" />
          : <HeartOutlineIcon size={24} color={ACTIVE} />
        }
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity style={styles.action} onPress={onShare} hitSlop={10} activeOpacity={0.7}>
        <ShareIcon size={24} color={ACTIVE} />
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity style={styles.action} onPress={onInfo} hitSlop={10} activeOpacity={0.7}>
        <InfoIcon size={24} color={ACTIVE} />
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Collection tab */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => onChangeTab('collection')}
        activeOpacity={0.7}
      >
        <GalleryIcon size={26} color={activeTab === 'collection' ? ACTIVE : INACTIVE} />
        <Text style={[styles.label, { color: activeTab === 'collection' ? ACTIVE : INACTIVE }]}>
          Samling
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
    paddingTop: 12,
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
  },
  label: {
    fontSize: 11,
    fontFamily: 'Helvetica Neue',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activePill: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 2,
  },
});
