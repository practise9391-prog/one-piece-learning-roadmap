import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface OnePieceBadgeProps {
  label: string;
  variant?: 'primary' | 'gold' | 'ocean' | 'success' | 'dark';
  size?: 'small' | 'medium';
}

export const OnePieceBadge: React.FC<OnePieceBadgeProps> = ({
  label,
  variant = 'gold',
  size = 'small',
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'primary':
        return { bg: '#FEE2E2', text: Colors.primaryDark, border: '#FECACA' };
      case 'ocean':
        return { bg: Colors.accentLight, text: Colors.accent, border: '#BAE6FD' };
      case 'success':
        return { bg: '#DCFCE7', text: Colors.success, border: '#BBF7D0' };
      case 'dark':
        return { bg: '#334155', text: '#F8FAFC', border: '#475569' };
      case 'gold':
      default:
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    }
  };

  const colors = getBadgeStyle();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 12,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: colors.text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

