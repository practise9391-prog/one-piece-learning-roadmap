import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { newsRepository } from '../../repositories/NewsRepository';
import { NewsArticle, formatRelativeTime } from '../../models/News';
import { Colors } from '../../theme/colors';

export const NewsArticleScreen: React.FC = () => {
  const { params, goBack } = useAppNavigation();
  const articleId = params?.articleId;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    newsRepository.getArticleById(articleId).then((fetched) => {
      setArticle(fetched);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load article details:', err);
      setLoading(false);
    });
  }, [articleId]);

  const handleToggleBookmark = async () => {
    if (!article) return;
    const isBookmarked = await newsRepository.toggleBookmark(article.id);
    setArticle((prev) => (prev ? { ...prev, is_bookmarked: isBookmarked } : null));
  };

  const handleOpenOriginalArticle = async () => {
    if (!article?.article_url) return;

    try {
      const supported = await Linking.canOpenURL(article.article_url);
      if (supported) {
        await Linking.openURL(article.article_url);
      } else {
        Alert.alert('Unable to Open Link', 'The web browser could not load this URL.');
      }
    } catch {
      Alert.alert('Error', 'An error occurred while opening the original publisher link.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Article" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Unrolling Dispatch Scroll...</Text>
        </View>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.container}>
        <Header title="Article Not Found" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundTitle}>Article Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This story might have been removed or is no longer stored in the cache.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>Return to News</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const relativeTime = formatRelativeTime(article.published_at);

  return (
    <View style={styles.container}>
      <Header
        title={article.source_name}
        subtitle="Gazette Dispatch"
        showBack
        onBackPress={goBack}
        rightAction={
          <TouchableOpacity
            style={styles.headerBookmark}
            onPress={handleToggleBookmark}
            activeOpacity={0.7}
          >
            <Ionicons
              name={article.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={article.is_bookmarked ? '#FFB300' : '#FFFFFF'}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category & Date Pill */}
        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{article.category}</Text>
          </View>
          <View style={styles.timeTag}>
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text style={styles.timeText}>{relativeTime}</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Author & Source Card */}
        <View style={styles.sourceCard}>
          <View style={styles.sourceAvatar}>
            <Ionicons name="globe" size={20} color={Colors.primary} />
          </View>
          <View style={styles.sourceMetaCol}>
            <Text style={styles.sourceLabel}>ORIGINAL PUBLISHER</Text>
            <Text style={styles.sourceValue}>{article.source_name}</Text>
            {article.author ? (
              <Text style={styles.authorValue}>By {article.author}</Text>
            ) : null}
          </View>
        </View>

        {/* Article Image Banner */}
        {article.image_url && !imageFailed ? (
          <Image
            source={{ uri: article.image_url }}
            style={styles.heroImage}
            onError={() => setImageFailed(true)}
            resizeMode="cover"
          />
        ) : null}

        {/* Description / Content */}
        <View style={styles.bodyCard}>
          <Text style={styles.bodyHeading}>Overview & Key Points</Text>
          <Text style={styles.bodyDescription}>{article.description}</Text>

          {article.content && article.content !== article.description ? (
            <Text style={styles.bodyContent}>{article.content}</Text>
          ) : null}
        </View>

        {/* Open Original Publisher Link Card */}
        <View style={styles.externalCard}>
          <View style={styles.externalIconWrap}>
            <Ionicons name="open-outline" size={24} color="#0284C7" />
          </View>
          <View style={styles.externalTextCol}>
            <Text style={styles.externalTitle}>Read Complete Coverage</Text>
            <Text style={styles.externalSubtitle}>
              Full article text and multimedia available directly on {article.source_name}.
            </Text>
          </View>
        </View>

        {/* Main CTA: Open Original Article */}
        <TouchableOpacity
          style={styles.openButton}
          onPress={handleOpenOriginalArticle}
          activeOpacity={0.8}
        >
          <Ionicons name="globe" size={18} color="#FFFFFF" />
          <Text style={styles.openButtonText}>OPEN ORIGINAL ARTICLE</Text>
        </TouchableOpacity>

        {/* Footer info note */}
        <Text style={styles.disclaimerText}>
          Content belongs to {article.source_name}. Links open in your external browser.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 16,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  headerBookmark: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 16,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 12,
  },
  sourceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceMetaCol: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  sourceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  authorValue: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  heroImage: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
  },
  bodyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  bodyHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyDescription: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },
  bodyContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginTop: 12,
  },
  externalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
    gap: 12,
  },
  externalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalTextCol: {
    flex: 1,
  },
  externalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
  },
  externalSubtitle: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 2,
    lineHeight: 16,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  openButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
