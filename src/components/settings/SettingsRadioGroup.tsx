import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface RadioOption {
  label: string;
  value: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

interface SettingsRadioGroupProps {
  options: RadioOption[];
  selectedValue: string;
  onSelect: (val: string) => void;
}

export const SettingsRadioGroup: React.FC<SettingsRadioGroupProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option, idx) => {
        const isSelected = option.value === selectedValue;
        const isLast = idx === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionRow,
              !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
              isSelected && { backgroundColor: `${theme.colors.primary}0D` },
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.left}>
              {/* Radio Circle */}
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isSelected ? theme.colors.primary : theme.colors.textTertiary },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </View>

              {option.icon ? (
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                  style={styles.optionIcon}
                />
              ) : null}

              <View style={styles.textContainer}>
                <View style={styles.labelRow}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.textPrimary,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.badge ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: `${theme.colors.secondary}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: theme.colors.secondaryDark },
                        ]}
                      >
                        {option.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {option.subtitle ? (
                  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  optionRow: {
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
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionIcon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
