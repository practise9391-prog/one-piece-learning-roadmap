import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { AnimationConfig } from '../theme/animationConfig';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'success';
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
  const { reducedMotion } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (reducedMotion || disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (reducedMotion || disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

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
      case 'success':
        return {
          bg: '#10B981',
          border: '#059669',
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
    </Animated.View>
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
