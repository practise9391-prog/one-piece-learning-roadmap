import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationConfig } from '../../theme/animationConfig';
import { useTheme } from '../../theme/ThemeContext';

export type ToastType =
  | 'saved'
  | 'completed'
  | 'achievement'
  | 'error'
  | 'warning'
  | 'info'
  | 'bookmark';

export interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reducedMotion } = useTheme();
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: AnimationConfig.getDuration(200, reducedMotion),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: AnimationConfig.getDuration(200, reducedMotion),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  }, [opacityAnim, slideAnim, reducedMotion]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setCurrentToast(options);
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: Platform.OS === 'ios' ? 50 : 25,
          friction: reducedMotion ? 100 : 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: AnimationConfig.getDuration(220, reducedMotion),
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options.duration || 2600;
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacityAnim, slideAnim, reducedMotion]
  );

  const getMeta = (type: ToastType) => {
    switch (type) {
      case 'saved':
        return {
          icon: 'checkmark-circle' as const,
          color: '#10B981',
          bg: '#ECFDF5',
          border: '#A7F3D0',
        };
      case 'completed':
        return {
          icon: 'trophy' as const,
          color: '#6366F1',
          bg: '#EEF2FF',
          border: '#C7D2FE',
        };
      case 'achievement':
        return {
          icon: 'star' as const,
          color: '#F59E0B',
          bg: '#FFFBEB',
          border: '#FDE68A',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: '#EF4444',
          bg: '#FEF2F2',
          border: '#FECACA',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A',
        };
      case 'bookmark':
        return {
          icon: 'bookmark' as const,
          color: '#0284C7',
          bg: '#F0F9FF',
          border: '#BAE6FD',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: '#3B82F6',
          bg: '#EFF6FF',
          border: '#BFDBFE',
        };
    }
  };

  const meta = currentToast ? getMeta(currentToast.type) : null;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {currentToast && meta && (
        <SafeAreaView pointerEvents="box-none" style={styles.toastContainer}>
          <Animated.View
            style={[
              styles.toastCard,
              {
                backgroundColor: meta.bg,
                borderColor: meta.border,
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.innerRow}
              onPress={hideToast}
              activeOpacity={0.85}
              accessibilityRole="alert"
            >
              <View style={[styles.iconBox, { backgroundColor: meta.color + '20' }]}>
                <Ionicons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: meta.color }]}>{currentToast.title}</Text>
                {currentToast.message && (
                  <Text style={styles.message} numberOfLines={2}>
                    {currentToast.message}
                  </Text>
                )}
              </View>
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export const useFeedbackToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toastCard: {
    maxWidth: 520,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
    lineHeight: 15,
  },
});
