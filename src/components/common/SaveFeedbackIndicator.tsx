import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { AnimationConfig } from '../../theme/animationConfig';

interface SaveFeedbackIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
}

export const SaveFeedbackIndicator: React.FC<SaveFeedbackIndicatorProps> = ({
  status,
  errorMessage,
}) => {
  const { reducedMotion } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'saved' || status === 'error' || status === 'saving') {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: AnimationConfig.getDuration(150, reducedMotion),
        useNativeDriver: true,
      }).start();

      if (status === 'saved') {
        const timer = setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: AnimationConfig.getDuration(300, reducedMotion),
            useNativeDriver: true,
          }).start();
        }, 1800);
        return () => clearTimeout(timer);
      }
    } else {
      opacityAnim.setValue(0);
    }
  }, [opacityAnim, reducedMotion, status]);

  if (status === 'idle') return null;

  return (
    <Animated.View
      style={[
        styles.container,
        status === 'error' ? styles.containerError : styles.containerSuccess,
        { opacity: opacityAnim },
      ]}
    >
      <Ionicons
        name={
          status === 'saving'
            ? 'sync'
            : status === 'error'
            ? 'alert-circle'
            : 'checkmark-circle'
        }
        size={14}
        color={status === 'error' ? '#EF4444' : '#10B981'}
      />
      <Text
        style={[
          styles.text,
          status === 'error' ? styles.textError : styles.textSuccess,
        ]}
      >
        {status === 'saving'
          ? 'Saving...'
          : status === 'error'
          ? errorMessage || 'Save failed'
          : 'Saved'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  containerSuccess: {
    backgroundColor: '#ECFDF5',
  },
  containerError: {
    backgroundColor: '#FEF2F2',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#059669',
  },
  textError: {
    color: '#DC2626',
  },
});
