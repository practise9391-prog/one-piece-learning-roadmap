import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AnimationConfig } from '../../theme/animationConfig';
import { useTheme } from '../../theme/ThemeContext';

interface PageTransitionWrapperProps {
  screenKey: string;
  children: React.ReactNode;
}

export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({
  screenKey,
  children,
}) => {
  const { reducedMotion } = useTheme();
  const opacityAnim = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(reducedMotion ? 0 : 8)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacityAnim.setValue(1);
      translateYAnim.setValue(0);
      return;
    }

    opacityAnim.setValue(0);
    translateYAnim.setValue(8);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: AnimationConfig.getDuration(200, reducedMotion),
        easing: AnimationConfig.easings.standard,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: AnimationConfig.getDuration(200, reducedMotion),
        easing: AnimationConfig.easings.decelerate,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, reducedMotion, screenKey, translateYAnim]);

  return (
    <Animated.View
      key={`page-${screenKey}`}
      style={[
        styles.container,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
