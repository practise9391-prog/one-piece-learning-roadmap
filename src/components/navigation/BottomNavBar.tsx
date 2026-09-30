import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { RootScreen } from '../../navigation/types';
import { Colors } from '../../theme/colors';

interface TabItem {
  id: string;
  screen?: RootScreen;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
  isAction?: boolean;
}

const TABS: TabItem[] = [
  {
    id: 'Home',
    screen: 'Dashboard',
    label: 'Home',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  {
    id: 'Courses',
    screen: 'Courses',
    label: 'Courses',
    iconActive: 'book',
    iconInactive: 'book-outline',
  },
  {
    id: 'Notes',
    screen: 'Notes',
    label: 'Notes',
    iconActive: 'journal',
    iconInactive: 'journal-outline',
  },
  {
    id: 'Stats',
    screen: 'Statistics',
    label: 'Stats',
    iconActive: 'pie-chart',
    iconInactive: 'pie-chart-outline',
  },
  {
    id: 'More',
    label: 'More',
    iconActive: 'menu',
    iconInactive: 'menu-outline',
    isAction: true,
  },
];

const ANDROID_BOTTOM_INSET = Platform.OS === 'android' ? 32 : 12;

export const BottomNavBar: React.FC = () => {
  const { currentScreen, navigate, openDrawer } = useAppNavigation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  if (isCollapsed) {
    return (
      <View style={styles.floatingContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.expandFloatingBtn}
          onPress={() => setIsCollapsed(false)}
          activeOpacity={0.8}
          accessibilityLabel="Show Navigation Bar"
        >
          <Ionicons name="chevron-up" size={16} color={Colors.secondary} />
          <Text style={styles.expandFloatingText}>Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Quick Hide Button on top-right edge */}
      <TouchableOpacity
        style={styles.hideBarBtn}
        onPress={() => setIsCollapsed(true)}
        activeOpacity={0.7}
        accessibilityLabel="Hide Navigation Bar"
      >
        <Ionicons name="chevron-down" size={14} color="#94A3B8" />
      </TouchableOpacity>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = tab.screen === currentScreen;

          const handlePress = () => {
            if (tab.isAction) {
              openDrawer();
            } else if (tab.screen) {
              navigate(tab.screen);
            }
          };

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={22}
                  color={isActive ? Colors.secondary : '#94A3B8'}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: (Platform.OS === 'android' ? 58 : 54) + ANDROID_BOTTOM_INSET,
    backgroundColor: '#0A1128',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: ANDROID_BOTTOM_INSET,
    elevation: 8,
    position: 'relative',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  hideBarBtn: {
    position: 'absolute',
    top: -12,
    right: 16,
    width: 32,
    height: 18,
    backgroundColor: '#0A1128',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 44 : 20,
    right: 16,
    zIndex: 999,
  },
  expandFloatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0A1128',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 179, 0, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 10,
  },
  expandFloatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  iconWrapActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.secondary,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary,
    marginTop: 2,
  },
});
