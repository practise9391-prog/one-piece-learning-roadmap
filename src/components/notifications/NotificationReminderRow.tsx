import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface NotificationReminderRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  time24: string; // "HH:mm"
  onToggle: (val: boolean) => void;
  onPressTime: () => void;
  isLast?: boolean;
}

export const NotificationReminderRow: React.FC<NotificationReminderRowProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  enabled,
  time24,
  onToggle,
  onPressTime,
  isLast = false,
}) => {
  const { theme } = useTheme();

  // Format "HH:mm" to "hh:mm AM/PM"
  const formatTime12 = (t: string): string => {
    try {
      const [hStr, mStr] = t.split(':');
      const h24 = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      const period = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    } catch {
      return t;
    }
  };

  return (
    <View
      style={[
        styles.container,
        !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${iconColor || theme.colors.primary}15` },
            ]}
          >
            <Ionicons
              name={icon}
              size={18}
              color={enabled ? iconColor || theme.colors.primary : theme.colors.textTertiary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: enabled ? theme.colors.textPrimary : theme.colors.textTertiary },
              ]}
            >
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          </View>
        </View>

        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{
            false: theme.colors.divider,
            true: `${theme.colors.primary}80`,
          }}
          thumbColor={enabled ? theme.colors.primary : '#FFFFFF'}
        />
      </View>

      {/* Time Picker Button Row */}
      {enabled && (
        <View style={styles.bottomRow}>
          <Text style={[styles.reminderAtLabel, { color: theme.colors.textSecondary }]}>
            Scheduled daily at:
          </Text>
          <TouchableOpacity
            style={[
              styles.timePill,
              { backgroundColor: `${theme.colors.primary}12`, borderColor: `${theme.colors.primary}30` },
            ]}
            onPress={onPressTime}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.timeText, { color: theme.colors.primary }]}>
              {formatTime12(time24)}
            </Text>
            <Ionicons name="pencil-outline" size={12} color={theme.colors.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  reminderAtLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
