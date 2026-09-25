import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SettingsDangerRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionText: string;
  onPress: () => void;
  isLast?: boolean;
}

export const SettingsDangerRow: React.FC<SettingsDangerRowProps> = ({
  icon = 'warning-outline',
  title,
  subtitle,
  actionText,
  onPress,
  isLast = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.row,
        !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
      ]}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color={theme.colors.error} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.error }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.actionText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  actionBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
