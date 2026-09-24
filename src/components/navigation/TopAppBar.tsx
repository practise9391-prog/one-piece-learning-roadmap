import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { Colors } from '../../theme/colors';

interface TopAppBarProps {
  title?: string;
  subtitle?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'ONE PIECE LEARNING',
}) => {
  const { openDrawer, navigate } = useAppNavigation();

  return (
    <View style={styles.container}>
      {/* Left: Hamburger Icon */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={openDrawer}
        activeOpacity={0.7}
        accessibilityLabel="Open Navigation Menu"
      >
        <Ionicons name="menu" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Center: App Title with Nautical Crest */}
      <View style={styles.centerContainer}>
        <View style={styles.crestRow}>
          <View style={styles.miniEmblem}>
            <Ionicons name="compass-outline" size={16} color={Colors.secondary} />
          </View>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      {/* Right: Settings Icon */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigate('Settings')}
        activeOpacity={0.7}
        accessibilityLabel="Open Settings"
      >
        <Ionicons name="settings-outline" size={22} color="#CBD5E1" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'android' ? 58 : 54,
    backgroundColor: Colors.oceanDepths,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniEmblem: {
    marginRight: 6,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
