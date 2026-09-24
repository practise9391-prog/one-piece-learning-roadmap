import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'medium',
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: Colors.secondary,
          border: Colors.secondaryDark,
          text: '#78350F',
        };
      case 'accent':
        return {
          bg: Colors.accent,
          border: Colors.accent,
          text: '#FFFFFF',
        };
      case 'danger':
        return {
          bg: Colors.error,
          border: Colors.error,
          text: '#FFFFFF',
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: Colors.border,
          text: Colors.textPrimary,
        };
      case 'primary':
      default:
        return {
          bg: Colors.primary,
          border: Colors.primaryDark,
          text: '#FFFFFF',
        };
    }
  };

  const currentTheme = getButtonStyles();

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 };
      case 'medium':
      default:
        return { paddingVertical: 12, paddingHorizontal: 18, fontSize: 14 };
    }
  };

  const dims = getPadding();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          paddingVertical: dims.paddingVertical,
          paddingHorizontal: dims.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentTheme.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={dims.fontSize + 2}
              color={currentTheme.text}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: currentTheme.text, fontSize: dims.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

