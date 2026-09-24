import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { dashboardService, OverallProgressStats } from '../../services/DashboardService';
import { RootScreen } from '../../navigation/types';
import { Colors } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

interface MenuItem {
  id: RootScreen;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { id: 'Courses', label: 'Courses', icon: 'book-outline' },
  { id: 'Statistics', label: 'Statistics', icon: 'pie-chart-outline' },
  { id: 'Notes', label: 'Notes', icon: 'journal-outline' },
  { id: 'Completed', label: 'Completed', icon: 'checkmark-circle-outline' },
  { id: 'Remaining', label: 'Remaining', icon: 'hourglass-outline' },
  { id: 'PracticeLinks', label: 'Practice', icon: 'code-slash-outline' },
  { id: 'News', label: 'News', icon: 'newspaper-outline' },
  { id: 'Motivation', label: 'Motivation', icon: 'flame-outline' },
  { id: 'Settings', label: 'Settings', icon: 'settings-outline' },
];

export const DrawerMenu: React.FC = () => {
  const { drawerOpen, closeDrawer, currentScreen, navigate } = useAppNavigation();
  const [stats, setStats] = useState<OverallProgressStats | null>(null);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (drawerOpen) {
      // Fetch latest stats dynamically from SQLite
      dashboardService.getOverallStats().then(setStats).catch(() => {});

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [drawerOpen, slideAnim, fadeAnim]);

  if (!drawerOpen) {
    return null;
  }

  const handleNavigate = (screen: RootScreen) => {
    closeDrawer();
    navigate(screen);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawerPanel,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="compass" size={26} color={Colors.secondary} />
            </View>
            <View style={styles.brandTextCol}>
              <Text style={styles.brandTitle}>ONE PIECE</Text>
              <Text style={styles.brandSubtitle}>LEARNING ROADMAP</Text>
            </View>
          </View>

          {/* Dynamic Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.progressHeadline}>Your Learning Journey</Text>
            <View style={styles.statsSummaryRow}>
              <Text style={styles.statMetricText}>
                {stats ? `${stats.startedCourses} / ${stats.totalCourses}` : '0 / 14'} Courses Started
              </Text>
            </View>
            <View style={styles.statsSummaryRow}>
              <Text style={styles.statMetricText}>
                {stats ? `${stats.completedModules}` : '0'} Modules Completed
              </Text>
            </View>

            {/* Overall Progress Bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${stats ? stats.overallProgressPercentage : 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentText}>
                {stats ? `${stats.overallProgressPercentage}%` : '0%'}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Items List */}
        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          {MENU_ITEMS.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleNavigate(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.itemIconCircle, isActive && styles.itemIconCircleActive]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? Colors.secondary : '#94A3B8'}
                  />
                </View>
                <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                  {item.label}
                </Text>
                {isActive && (
                  <View style={styles.activePill}>
                    <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Grand Line Edition • v1.0.0</Text>
          <Text style={styles.footerNote}>Offline SQLite Vault</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#0A1128',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 179, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 16,
    zIndex: 9999,
  },
  header: {
    padding: 18,
    paddingTop: Platform.OS === 'android' ? 24 : 36,
    backgroundColor: Colors.oceanDepths,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 179, 0, 0.4)',
    marginRight: 12,
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressHeadline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statsSummaryRow: {
    marginBottom: 3,
  },
  statMetricText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
    minWidth: 32,
    textAlign: 'right',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 3,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  itemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIconCircleActive: {
    backgroundColor: 'rgba(255, 179, 0, 0.2)',
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  itemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activePill: {
    marginLeft: 6,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  footerNote: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
});
