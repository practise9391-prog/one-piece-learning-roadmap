import React from 'react';
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

export const BottomNavBar: React.FC = () => {
  const { currentScreen, navigate, openDrawer } = useAppNavigation();

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'android' ? 62 : 68,
    backgroundColor: '#0A1128',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'android' ? 4 : 10,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
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
