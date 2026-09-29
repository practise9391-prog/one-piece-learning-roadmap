import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { AnimationConfig } from '../theme/animationConfig';
import { useTheme } from '../theme/ThemeContext';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 8,
  color = Colors.primary,
  backgroundColor = Colors.surfaceHover,
  style,
}) => {
  const { reducedMotion } = useTheme();
  const clamped = Math.min(100, Math.max(0, percentage));
  const animatedValue = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.setValue(clamped);
      return;
    }

    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: AnimationConfig.getDuration(400, reducedMotion),
      easing: AnimationConfig.easings.smoothOut,
      useNativeDriver: false, // width interpolation requires non-native driver in standard RN
    }).start();
  }, [animatedValue, clamped, reducedMotion]);

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolation,
            height,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
