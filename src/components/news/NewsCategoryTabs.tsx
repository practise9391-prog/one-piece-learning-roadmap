import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsCategory } from '../../models/News';
import { Colors } from '../../theme/colors';

interface NewsCategoryTabsProps {
  selectedCategory: NewsCategory;
  bookmarkedOnly: boolean;
  onSelectCategory: (category: NewsCategory) => void;
  onToggleBookmarked: () => void;
  bookmarkedCount: number;
}

const CATEGORIES: { id: NewsCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ALL', label: 'All', icon: 'compass-outline' },
  { id: 'TECH', label: 'Tech', icon: 'hardware-chip-outline' },
  { id: 'AI', label: 'AI', icon: 'sparkles-outline' },
  { id: 'DEVELOPER', label: 'Developer', icon: 'code-slash-outline' },
  { id: 'STOCKS', label: 'Stocks & Finance', icon: 'trending-up-outline' },
  { id: 'EDUCATION', label: 'Education', icon: 'school-outline' },
  { id: 'TRENDS', label: 'Trends', icon: 'flame-outline' },
];

export const NewsCategoryTabs: React.FC<NewsCategoryTabsProps> = ({
  selectedCategory,
  bookmarkedOnly,
  onSelectCategory,
  onToggleBookmarked,
  bookmarkedCount,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Bookmarked / Saved Filter Tab */}
        <TouchableOpacity
          style={[styles.tab, bookmarkedOnly && styles.tabActiveSaved]}
          onPress={onToggleBookmarked}
          activeOpacity={0.7}
        >
          <Ionicons
            name={bookmarkedOnly ? 'bookmark' : 'bookmark-outline'}
            size={14}
            color={bookmarkedOnly ? '#0D1B2A' : '#D97706'}
          />
          <Text style={[styles.tabText, bookmarkedOnly && styles.tabTextActiveSaved]}>
            Saved ({bookmarkedCount})
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((cat) => {
          const isActive = !bookmarkedOnly && selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={isActive ? '#FFFFFF' : Colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabActive: {
    backgroundColor: Colors.oceanDepths,
    borderColor: Colors.oceanDepths,
  },
  tabActiveSaved: {
    backgroundColor: '#FFB300',
    borderColor: '#F59E0B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextActiveSaved: {
    color: '#0D1B2A',
  },
});
