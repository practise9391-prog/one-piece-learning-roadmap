import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationConfig } from '../../theme/animationConfig';
import { Colors } from '../../theme/colors';

interface AppSplashScreenProps {
  isReady: boolean;
  statusMessage?: string;
  onFinish: () => void;
  reducedMotion?: boolean;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  isReady,
  statusMessage = 'Preparing your learning journey...',
  onFinish,
  reducedMotion = false,
}) => {
  const { width } = useWindowDimensions();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  // 3-dot indicator step (0, 1, 2)
  const [dotIndex, setDotIndex] = useState<number>(0);

  // Initial Logo and Text Entrance
  useEffect(() => {
    if (reducedMotion) {
      logoScale.setValue(1);
      logoOpacity.setValue(1);
      textOpacity.setValue(1);
      textTranslateY.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          easing: AnimationConfig.easings.standard,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 400,
          easing: AnimationConfig.easings.standard,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          easing: AnimationConfig.easings.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 300,
          easing: AnimationConfig.easings.decelerate,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoGlow, logoOpacity, logoScale, reducedMotion, textOpacity, textTranslateY]);

  // Dot pulse loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  // When database initialization is ready -> trigger smooth exit
  useEffect(() => {
    if (isReady) {
      const exitDelay = reducedMotion ? 50 : 250;
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(exitOpacity, {
            toValue: 0,
            duration: AnimationConfig.getDuration(300, reducedMotion),
            easing: AnimationConfig.easings.standard,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: AnimationConfig.getDuration(300, reducedMotion),
            easing: AnimationConfig.easings.standard,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinish();
        });
      }, exitDelay);

      return () => clearTimeout(timer);
    }
  }, [exitOpacity, isReady, logoScale, onFinish, reducedMotion]);

  return (
    <Animated.View style={[styles.fullScreen, { opacity: exitOpacity }]}>
      <SafeAreaView style={styles.centerContainer}>
        {/* Subtle Ambient Glow Aura */}
        <Animated.View
          style={[
            styles.glowAura,
            {
              opacity: logoGlow,
              transform: [{ scale: logoScale }],
            },
          ]}
        />

        {/* Logo Compass / Pirate Crest */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoBadge}>
            <Ionicons name="compass" size={54} color={Colors.secondary} />
          </View>
        </Animated.View>

        {/* Application Identity */}
        <Animated.View
          style={[
            styles.identityContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>One Piece Learning Roadmap</Text>
          <Text style={styles.tagline}>Setting Sail on the Grand Line...</Text>

          {/* Real Initialization Status */}
          <View style={styles.statusBox}>
            <View style={styles.dotRow}>
              <View style={[styles.dot, dotIndex >= 0 && styles.dotActive]} />
              <View style={[styles.dot, dotIndex >= 1 && styles.dotActive]} />
              <View style={[styles.dot, dotIndex >= 2 && styles.dotActive]} />
            </View>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFill as any || { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    backgroundColor: '#080E21',
    zIndex: 9999,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowAura: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 180, 216, 0.12)',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 179, 0, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 0, 0.5)',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  identityContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#FFB300',
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusBox: {
    marginTop: 36,
    alignItems: 'center',
    gap: 10,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#00B4D8',
    transform: [{ scale: 1.2 }],
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
});
