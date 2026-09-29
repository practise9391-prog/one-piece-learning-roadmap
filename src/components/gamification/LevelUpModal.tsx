import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface LevelUpModalProps {
  visible: boolean;
  oldLevel: number;
  newLevel: number;
  levelTitle: string;
  onDismiss: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  oldLevel: _oldLevel,
  newLevel,
  levelTitle,
  onDismiss,
}) => {
  const { theme } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);
      starsAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(starsAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, scaleAnim, rotateAnim, opacityAnim, starsAnim]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfaceCard,
              borderColor: '#F59E0B',
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Glowing Ring & Sunburst */}
          <Animated.View style={[styles.haloRing, { transform: [{ rotate: spin }] }]}>
            <View style={styles.haloRay} />
            <View style={[styles.haloRay, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.haloRay, { transform: [{ rotate: '90deg' }] }]} />
            <View style={[styles.haloRay, { transform: [{ rotate: '135deg' }] }]} />
          </Animated.View>

          {/* Golden Badge Center */}
          <View style={styles.crestCircle}>
            <Ionicons name="trophy" size={42} color="#D97706" />
          </View>

          <Text style={styles.preBanner}>VICTORY AT SEA!</Text>
          <Text style={[styles.levelUpTitle, { color: theme.colors.textPrimary }]}>
            LEVEL UP!
          </Text>

          <View style={styles.levelTag}>
            <Text style={styles.levelTagText}>RANK {newLevel}</Text>
          </View>

          <Text style={[styles.rankTitle, { color: theme.colors.primary }]}>
            {levelTitle}
          </Text>

          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            Your dedication has elevated your navigation mastery across the Grand Line!
          </Text>

          {/* Floating Stars */}
          <Animated.View style={[styles.starsRow, { transform: [{ scale: starsAnim }] }]}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <Text style={{ fontSize: 28, marginHorizontal: 8 }}>🌟</Text>
            <Text style={{ fontSize: 24 }}>⭐</Text>
          </Animated.View>

          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: theme.colors.primary }]}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue Voyage</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 2,
    padding: 28,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  haloRing: {
    position: 'absolute',
    top: 30,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloRay: {
    position: 'absolute',
    width: 130,
    height: 2,
    backgroundColor: '#FDE68A60',
  },
  crestCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  preBanner: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  levelUpTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levelTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  levelTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
