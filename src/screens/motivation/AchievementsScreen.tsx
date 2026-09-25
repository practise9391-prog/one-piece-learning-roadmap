import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useMotivationViewModel } from '../../hooks/useMotivationViewModel';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { AchievementCategory } from '../../models/Motivation';
import { Colors } from '../../theme/colors';

const CATEGORIES: { id: AchievementCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'STREAK', label: 'Streak' },
  { id: 'TOPICS', label: 'Topics' },
  { id: 'MODULES', label: 'Modules' },
  { id: 'COURSES', label: 'Courses' },
  { id: 'PRACTICE', label: 'Practice' },
  { id: 'NOTES', label: 'Notes' },
];

export const AchievementsScreen: React.FC = () => {
  const { goBack } = useAppNavigation();
  const { achievements, unlockedAchievementsCount } = useMotivationViewModel();
  const [selectedCat, setSelectedCat] = useState<AchievementCategory | 'ALL'>('ALL');

  const filtered = achievements.filter(
    (a) => selectedCat === 'ALL' || a.category === selectedCat
  );

  return (
    <View style={styles.container}>
      <Header
        title="Achievements"
        subtitle="Voyage Milestones"
        showBack
        onBackPress={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Summary Banner */}
        <View style={styles.banner}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={32} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerPre}>EXPLORER HONOR ROLL</Text>
            <Text style={styles.bannerTitle}>
              {unlockedAchievementsCount} of {achievements.length} Unlocked
            </Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${achievements.length > 0 ? (unlockedAchievementsCount / achievements.length) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catTab, isActive && styles.catTabActive]}
                onPress={() => setSelectedCat(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Achievement Cards */}
        {filtered.map((ach) => {
          const isDone = ach.is_unlocked;
          return (
            <View key={ach.id} style={[styles.card, isDone && styles.cardUnlocked]}>
              <View style={[styles.achIconWrap, isDone && styles.achIconWrapUnlocked]}>
                <Text style={{ fontSize: 24 }}>{ach.icon}</Text>
              </View>

              <View style={styles.achInfoCol}>
                <View style={styles.achTitleRow}>
                  <Text style={[styles.achTitle, isDone && styles.achTitleUnlocked]}>
                    {ach.title}
                  </Text>
                  {isDone ? (
                    <View style={styles.unlockedPill}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text style={styles.unlockedText}>UNLOCKED</Text>
                    </View>
                  ) : (
                    <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                  )}
                </View>

                <Text style={styles.achDesc}>{ach.description}</Text>

                {ach.unlocked_at && (
                  <Text style={styles.achDate}>
                    Unlocked: {new Date(ach.unlocked_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingVertical: 14,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPre: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  track: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  catTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  catTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  catTabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardUnlocked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  achIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achIconWrapUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  achInfoCol: {
    flex: 1,
  },
  achTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  achTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  achTitleUnlocked: {
    color: '#065F46',
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unlockedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  achDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  achDate: {
    fontSize: 10,
    color: '#059669',
    marginTop: 4,
    fontWeight: '600',
  },
});
