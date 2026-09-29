import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, BadgeCategory } from '../../models/Gamification';
import { useTheme } from '../../theme/ThemeContext';

interface BadgeGridProps {
  badges: Badge[];
  activeCategory: BadgeCategory | 'ALL';
  onCategoryChange: (cat: BadgeCategory | 'ALL') => void;
}

const CATEGORIES: Array<{ id: BadgeCategory | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'LEARNING', label: 'Learning' },
  { id: 'COURSE', label: 'Courses' },
  { id: 'STREAK', label: 'Streaks' },
  { id: 'PRACTICE', label: 'Practice' },
  { id: 'SPEAKING', label: 'Speaking' },
  { id: 'GOALS', label: 'Goals' },
  { id: 'MILESTONE', label: 'Milestones' },
  { id: 'SPECIAL', label: 'Special' },
];

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  activeCategory,
  onCategoryChange,
}) => {
  const { theme } = useTheme();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filtered = badges.filter(
    (b) => activeCategory === 'ALL' || b.category === activeCategory
  );

  return (
    <View style={styles.container}>
      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => onCategoryChange(cat.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textPrimary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Badges Grid (Section 22) */}
      <View style={styles.grid}>
        {filtered.map((badge) => {
          const isUnlocked = badge.is_unlocked;
          return (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeTile,
                {
                  backgroundColor: theme.colors.surfaceCard,
                  borderColor: isUnlocked ? '#F59E0B' : theme.colors.border,
                  opacity: isUnlocked ? 1 : 0.7,
                },
              ]}
              onPress={() => setSelectedBadge(badge)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isUnlocked ? '#FEF3C7' : '#F1F5F9',
                    borderColor: isUnlocked ? '#FCD34D' : 'transparent',
                  },
                ]}
              >
                <Text style={styles.iconText}>
                  {badge.is_hidden && !isUnlocked ? '❓' : badge.icon}
                </Text>
                {isUnlocked && (
                  <View style={styles.unlockedPin}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <Text
                style={[styles.badgeName, { color: theme.colors.textPrimary }]}
                numberOfLines={1}
              >
                {badge.name}
              </Text>

              {/* Progress Bar for Locked Badges */}
              {!isUnlocked && (
                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${badge.progress_percentage || 0}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressRatio, { color: theme.colors.textSecondary }]}>
                    {badge.current_progress || 0}/{badge.requirement_value}
                  </Text>
                </View>
              )}

              {isUnlocked && (
                <Text style={styles.unlockedLabel}>UNLOCKED</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Modal
          visible={!!selectedBadge}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border },
              ]}
            >
              <View
                style={[
                  styles.modalIconWrap,
                  {
                    backgroundColor: selectedBadge.is_unlocked ? '#FEF3C7' : '#F1F5F9',
                    borderColor: selectedBadge.is_unlocked ? '#F59E0B' : '#CBD5E1',
                  },
                ]}
              >
                <Text style={{ fontSize: 44 }}>
                  {selectedBadge.is_hidden && !selectedBadge.is_unlocked ? '❓' : selectedBadge.icon}
                </Text>
              </View>

              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                {selectedBadge.name}
              </Text>

              <View
                style={[
                  styles.categoryTag,
                  { backgroundColor: `${theme.colors.primary}15` },
                ]}
              >
                <Text style={[styles.categoryTagText, { color: theme.colors.primary }]}>
                  {selectedBadge.category} BADGE
                </Text>
              </View>

              <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>
                {selectedBadge.description}
              </Text>

              {selectedBadge.is_unlocked ? (
                <View style={styles.unlockedBox}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <Text style={styles.unlockedBoxText}>
                    Earned {selectedBadge.unlocked_at ? selectedBadge.unlocked_at.split('T')[0] : 'on your journey'}
                  </Text>
                </View>
              ) : (
                <View style={styles.lockedBox}>
                  <Text style={[styles.lockedBoxLabel, { color: theme.colors.textSecondary }]}>
                    Progress to Unlock:
                  </Text>
                  <View style={styles.modalTrack}>
                    <View
                      style={[
                        styles.modalFill,
                        {
                          width: `${selectedBadge.progress_percentage || 0}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.lockedRatio, { color: theme.colors.textPrimary }]}>
                    {selectedBadge.current_progress || 0} / {selectedBadge.requirement_value} ({selectedBadge.progress_percentage || 0}%)
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 2,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  badgeTile: {
    width: '31%',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    marginBottom: 6,
  },
  iconText: {
    fontSize: 24,
  },
  unlockedPin: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressWrap: {
    width: '100%',
    marginTop: 6,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressRatio: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  unlockedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  unlockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 18,
  },
  unlockedBoxText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  lockedBox: {
    width: '100%',
    marginBottom: 18,
    alignItems: 'center',
  },
  lockedBoxLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  modalTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalFill: {
    height: '100%',
    borderRadius: 4,
  },
  lockedRatio: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  closeBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
