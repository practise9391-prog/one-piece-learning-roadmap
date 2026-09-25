import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SettingsSwitchProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  disabledBadge?: string;
  isLast?: boolean;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  disabledBadge,
  isLast = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.row,
        !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
        disabled && styles.disabledRow,
      ]}
    >
      <View style={styles.left}>
        {icon ? (
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${iconColor || theme.colors.primary}15` },
            ]}
          >
            <Ionicons
              name={icon}
              size={18}
              color={disabled ? theme.colors.textTertiary : iconColor || theme.colors.primary}
            />
          </View>
        ) : null}

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: disabled ? theme.colors.textTertiary : theme.colors.textPrimary },
              ]}
            >
              {title}
            </Text>
            {disabledBadge ? (
              <View style={[styles.badge, { backgroundColor: `${theme.colors.textTertiary}20` }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textTertiary }]}>
                  {disabledBadge}
                </Text>
              </View>
            ) : null}
          </View>

          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.divider,
          true: `${theme.colors.primary}80`,
        }}
        thumbColor={value ? theme.colors.primary : '#FFFFFF'}
      />
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
  disabledRow: {
    opacity: 0.65,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
