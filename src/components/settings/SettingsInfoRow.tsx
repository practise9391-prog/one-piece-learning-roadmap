import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface SettingsInfoRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: string | number;
  subValue?: string;
  isLast?: boolean;
}

export const SettingsInfoRow: React.FC<SettingsInfoRowProps> = ({
  icon,
  iconColor,
  label,
  value,
  subValue,
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
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={iconColor || theme.colors.primary}
            style={styles.icon}
          />
        ) : null}
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
          {label}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
          {value}
        </Text>
        {subValue ? (
          <Text style={[styles.subValue, { color: theme.colors.textTertiary }]}>
            {subValue}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
  },
  subValue: {
    fontSize: 11,
    marginTop: 2,
  },
});
