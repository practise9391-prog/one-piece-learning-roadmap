import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle, formatRelativeTime } from '../../models/News';
import { Colors } from '../../theme/colors';

interface NewsArticleCardProps {
  article: NewsArticle;
  onPress: () => void;
  onToggleBookmark: () => void;
}

export const NewsArticleCard: React.FC<NewsArticleCardProps> = ({
  article,
  onPress,
  onToggleBookmark,
}) => {
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'AI':
        return { bg: '#F5F3FF', text: '#7C3AED', label: 'AI' };
      case 'DEVELOPER':
        return { bg: '#ECFDF5', text: '#059669', label: 'DEVELOPER' };
      case 'TECH':
        return { bg: '#F0F9FF', text: '#0284C7', label: 'TECH' };
      case 'STOCKS':
        return { bg: '#FFFBEB', text: '#D97706', label: 'STOCKS & FINANCE' };
      case 'EDUCATION':
        return { bg: '#FDF2F8', text: '#DB2777', label: 'EDUCATION' };
      case 'TRENDS':
        return { bg: '#FFF7ED', text: '#EA580C', label: 'TRENDS' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: category };
    }
  };

  const theme = getCategoryTheme(article.category);
  const relativeTime = formatRelativeTime(article.published_at);

  return (
    <TouchableOpacity
      style={[styles.card, !article.is_read && styles.unreadCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: theme.bg }]}>
            <Text style={[styles.categoryBadgeText, { color: theme.text }]}>
              {theme.label}
            </Text>
          </View>
          {!article.is_read && (
            <View style={styles.unreadDot} />
          )}
          <Text style={styles.timeText}>{relativeTime}</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleBookmark}
          style={styles.bookmarkButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={article.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={article.is_bookmarked ? '#FFB300' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.contentCol}>
          <Text
            style={[styles.title, !article.is_read && styles.unreadTitle]}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          {article.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {article.description}
            </Text>
          ) : null}
        </View>

        {article.image_url && !imageFailed ? (
          <Image
            source={{ uri: article.image_url }}
            style={styles.thumbnail}
            onError={() => setImageFailed(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.bg }]}>
            <Ionicons name="newspaper-outline" size={24} color={theme.text} />
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.sourceRow}>
          <Ionicons name="globe-outline" size={13} color="#64748B" />
          <Text style={styles.sourceName} numberOfLines={1}>
            {article.source_name}
          </Text>
        </View>

        <View style={styles.readMoreRow}>
          <Text style={styles.readMoreText}>Read Article</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bookmarkButton: {
    padding: 2,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 21,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  thumbnailPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
