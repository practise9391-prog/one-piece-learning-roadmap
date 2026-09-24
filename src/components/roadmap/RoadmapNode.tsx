import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Module } from '../../models/Module';
import { Colors } from '../../theme/colors';

export type NodeState = 'locked' | 'available' | 'completed';

export interface RoadmapNodeProps {
  module: Module;
  index: number;
  state: NodeState;
  previousModuleTitle?: string;
  themeColor?: string;
  isFinalModule?: boolean;
  onPress: (module: Module) => void;
  onPressLocked?: (module: Module, prevTitle?: string) => void;
}

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({
  module,
  index,
  state,
  previousModuleTitle,
  themeColor = Colors.primary,
  isFinalModule = false,
  onPress,
  onPressLocked,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (state === 'available') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: isFinalModule ? 1.08 : 1.05,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.4,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.4);
    }
  }, [state, isFinalModule, pulseAnim, glowAnim]);

  const handlePress = () => {
    if (state === 'locked') {
      onPressLocked?.(module, previousModuleTitle);
    } else {
      onPress(module);
    }
  };

  const formattedNumber = String(module.order || index + 1).padStart(2, '0');
  const isLocked = state === 'locked';
  const isAvailable = state === 'available';
  const isCompleted = state === 'completed';

  return (
    <Animated.View
      style={[
        styles.nodeWrapper,
        isAvailable && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={isLocked ? 0.7 : 0.85}
        onPress={handlePress}
        style={[
          styles.nodeCard,
          isCompleted && styles.nodeCardCompleted,
          isAvailable && [styles.nodeCardAvailable, { borderColor: isFinalModule ? '#F59E0B' : themeColor }],
          isLocked && styles.nodeCardLocked,
          isFinalModule && styles.finalNodeCard,
        ]}
      >
        {isAvailable && (
          <Animated.View
            style={[
              styles.availableBeacon,
              {
                borderColor: isFinalModule ? '#F59E0B' : themeColor,
                opacity: glowAnim,
              },
            ]}
          />
        )}

        <View style={styles.topRow}>
          <View
            style={[
              styles.numberBadge,
              isCompleted && styles.numberBadgeCompleted,
              isAvailable && { backgroundColor: isFinalModule ? '#D97706' : themeColor },
              isLocked && styles.numberBadgeLocked,
            ]}
          >
            <Text style={[styles.numberText, isLocked && styles.numberTextLocked]}>
              {formattedNumber}
            </Text>
          </View>

          <View style={styles.statusCrest}>
            {isCompleted && (
              <View style={styles.completedCrest}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              </View>
            )}
            {isAvailable && (
              <View
                style={[
                  styles.availableCrest,
                  { backgroundColor: isFinalModule ? '#FEF3C7' : `${themeColor}20` },
                ]}
              >
                <Ionicons
                  name={isFinalModule ? 'trophy' : 'compass'}
                  size={20}
                  color={isFinalModule ? '#D97706' : themeColor}
                />
              </View>
            )}
            {isLocked && (
              <View style={styles.lockedCrest}>
                <Ionicons
                  name={isFinalModule ? 'lock-closed' : 'lock-closed'}
                  size={18}
                  color="#94A3B8"
                />
              </View>
            )}
          </View>
        </View>

        <Text
          style={[
            styles.titleText,
            isCompleted && styles.titleCompleted,
            isLocked && styles.titleLocked,
            isFinalModule && styles.finalTitle,
          ]}
          numberOfLines={2}
        >
          {module.title}
        </Text>

        <View style={styles.bottomRow}>
          {isCompleted && (
            <View style={styles.tagCompleted}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.success} />
              <Text style={styles.tagCompletedText}>
                {isFinalModule ? 'SUMMIT CONQUERED' : 'ISLAND CONQUERED'}
              </Text>
            </View>
          )}

          {isAvailable && (
            <View
              style={[
                styles.tagAvailable,
                { backgroundColor: isFinalModule ? '#FEF3C7' : `${themeColor}15` },
              ]}
            >
              <Ionicons
                name={isFinalModule ? 'star' : 'flag'}
                size={12}
                color={isFinalModule ? '#D97706' : themeColor}
              />
              <Text
                style={[
                  styles.tagAvailableText,
                  { color: isFinalModule ? '#B45309' : themeColor },
                ]}
              >
                {isFinalModule ? 'FINAL SUMMIT' : 'CURRENT ADVENTURE'}
              </Text>
            </View>
          )}

          {isLocked && (
            <View style={styles.tagLocked}>
              <Ionicons name="lock-closed" size={11} color="#94A3B8" />
              <Text style={styles.tagLockedText}>
                {isFinalModule ? 'SUMMIT LOCKED' : 'LOCKED'}
              </Text>
            </View>
          )}

          {module.topic_count !== undefined && module.topic_count > 0 && !isLocked && (
            <Text style={styles.topicsCount}>
              {module.completed_topic_count || 0}/{module.topic_count} topics
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  nodeWrapper: {
    width: 220,
    zIndex: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  nodeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  finalNodeCard: {
    borderColor: '#FDE68A',
    borderWidth: 2.5,
  },
  nodeCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
  },
  nodeCardAvailable: {
    borderWidth: 2.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#E53935',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  nodeCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  availableBeacon: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#64748B',
  },
  numberBadgeCompleted: {
    backgroundColor: '#10B981',
  },
  numberBadgeLocked: {
    backgroundColor: '#CBD5E1',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  numberTextLocked: {
    color: '#64748B',
  },
  statusCrest: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCrest: {
    padding: 2,
  },
  availableCrest: {
    padding: 4,
    borderRadius: 12,
  },
  lockedCrest: {
    padding: 2,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 8,
  },
  finalTitle: {
    fontWeight: '800',
  },
  titleCompleted: {
    color: '#065F46',
  },
  titleLocked: {
    color: '#94A3B8',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tagCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagCompletedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  tagAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  tagAvailableText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagLockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  topicsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});
