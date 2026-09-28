import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusTimer } from '../../hooks/useFocusTimer';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { Colors } from '../../theme/colors';

export const ActiveFocusBanner: React.FC = () => {
  const { session, formattedTime, isPaused } = useFocusTimer();
  const { navigate, currentScreen } = useAppNavigation();

  // Do not show banner if no session, or if already on FocusMode screen
  if (!session || currentScreen === 'FocusMode') {
    return null;
  }

  const courseTitle = session.course_name || 'Study Session';
  const statusLabel = isPaused ? 'PAUSED' : 'ACTIVE';

  return (
    <TouchableOpacity
      style={styles.bannerContainer}
      activeOpacity={0.88}
      onPress={() => navigate('FocusMode')}
    >
      <View style={styles.leftRow}>
        <View style={[styles.iconCircle, isPaused && styles.iconCirclePaused]}>
          <Ionicons
            name={isPaused ? 'pause' : 'timer'}
            size={18}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={styles.bannerTitle}>FOCUS {statusLabel}</Text>
            <Text style={styles.timerDigits}>{formattedTime}</Text>
          </View>
          <Text style={styles.courseSubtitle} numberOfLines={1}>
            {courseTitle}
            {session.module_title ? ` › ${session.module_title}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.resumeChip}>
        <Text style={styles.resumeText}>OPEN</Text>
        <Ionicons name="arrow-forward" size={12} color="#FFFFFF" style={{ marginLeft: 3 }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconCirclePaused: {
    backgroundColor: '#F59E0B',
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  timerDigits: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  courseSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  resumeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resumeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
