import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface XpToastProps {
  visible: boolean;
  xp: number;
  points?: number;
  description?: string;
  onDismiss: () => void;
}

export const XpToast: React.FC<XpToastProps> = ({
  visible,
  xp,
  points,
  description,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-60);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 20,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 2.5s
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -60,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, opacityAnim, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        <Ionicons name="sparkles" size={16} color="#F59E0B" />
        <Text style={styles.xpText}>+{xp} XP</Text>
        {points !== undefined && points > 0 && (
          <View style={styles.ptsWrap}>
            <Text style={styles.ptsText}>+{points} Pts</Text>
          </View>
        )}
        {description && (
          <Text style={styles.descText} numberOfLines={1}>
            • {description}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    gap: 6,
  },
  xpText: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '800',
  },
  ptsWrap: {
    backgroundColor: '#FEF3C720',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ptsText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
  },
  descText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 180,
  },
});
