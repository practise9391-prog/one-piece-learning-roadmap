import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { AnimationConfig } from '../../theme/animationConfig';
import { useTheme } from '../../theme/ThemeContext';

interface StaggeredFadeInProps {
  index?: number;
  delayMs?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const StaggeredFadeIn: React.FC<StaggeredFadeInProps> = ({
  index = 0,
  delayMs,
  children,
  style,
}) => {
  const { reducedMotion } = useTheme();
  const opacityAnim = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(reducedMotion ? 0 : 10)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacityAnim.setValue(1);
      translateYAnim.setValue(0);
      return;
    }

    const calculatedDelay = delayMs !== undefined ? delayMs : Math.min(index * 70, 350);

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: AnimationConfig.getDuration(220, reducedMotion),
          easing: AnimationConfig.easings.standard,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: AnimationConfig.getDuration(220, reducedMotion),
          easing: AnimationConfig.easings.decelerate,
          useNativeDriver: true,
        }),
      ]).start();
    }, calculatedDelay);

    return () => clearTimeout(timer);
  }, [delayMs, index, opacityAnim, reducedMotion, translateYAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
