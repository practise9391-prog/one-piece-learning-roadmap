import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SettingsRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  valueText?: string;
  badge?: string;
  badgeColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
  destructive?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  emoji,
  iconColor,
  title,
  subtitle,
  valueText,
  badge,
  badgeColor,
  showChevron = true,
  onPress,
  isLast = false,
  destructive = false,
}) => {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
      ]}
    >
      <View style={styles.left}>
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : icon ? (
          <View
            style={[
              styles.iconBox,
              { backgroundColor: destructive ? 'rgba(239, 68, 68, 0.1)' : `${theme.colors.primary}15` },
            ]}
          >
            <Ionicons
              name={icon}
              size={18}
              color={destructive ? theme.colors.error : iconColor || theme.colors.primary}
            />
          </View>
        ) : null}

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: destructive ? theme.colors.error : theme.colors.textPrimary,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {badge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeColor || `${theme.colors.secondary}20` },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: badgeColor ? '#FFFFFF' : theme.colors.secondaryDark },
              ]}
            >
              {badge}
            </Text>
          </View>
        ) : null}

        {valueText ? (
          <Text style={[styles.valueText, { color: theme.colors.textTertiary }]}>
            {valueText}
          </Text>
        ) : null}

        {showChevron && onPress ? (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.textTertiary}
            style={styles.chevron}
          />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
    marginRight: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
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
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  chevron: {
    marginLeft: 4,
  },
});
