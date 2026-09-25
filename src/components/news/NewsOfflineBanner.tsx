import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NewsOfflineBannerProps {
  isOffline: boolean;
  cachedCount: number;
}

export const NewsOfflineBanner: React.FC<NewsOfflineBannerProps> = ({
  isOffline,
  cachedCount,
}) => {
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#B45309" />
      <Text style={styles.text}>
        Offline Mode • Showing {cachedCount} cached {cachedCount === 1 ? 'article' : 'articles'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
});
