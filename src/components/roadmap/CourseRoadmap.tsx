import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../models/Course';
import { Module } from '../../models/Module';
import { CourseHeader } from './CourseHeader';
import { RoadmapNode, NodeState } from './RoadmapNode';
import { RoadmapPath, Point } from './RoadmapPath';
import { Colors } from '../../theme/colors';

interface CourseRoadmapProps {
  course: Course;
  modules: Module[];
  onSelectModule: (module: Module) => void;
}

export const CourseRoadmap: React.FC<CourseRoadmapProps> = ({
  course,
  modules,
  onSelectModule,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  // Locked module warning toast state
  const [lockedToast, setLockedToast] = useState<{
    visible: boolean;
    moduleTitle: string;
    prevTitle?: string;
  }>({
    visible: false,
    moduleTitle: '',
  });

  const toastAnim = useRef(new Animated.Value(0)).current;

  // Determine course theme colors
  const themeMeta = Colors.courseThemes[course.theme || course.id] || {
    primary: Colors.primary,
    secondary: Colors.secondary,
    bg: '#EFF6FF',
  };

  // Determine state of each module sequentially
  const { moduleStates, completedCount, activeIndex } = useMemo(() => {
    let completed = 0;
    let firstAvailableIndex = -1;
    const states: NodeState[] = [];

    for (let i = 0; i < modules.length; i++) {
      const isSelfCompleted = modules[i].is_completed;
      const isPrevCompleted = i === 0 || modules[i - 1].is_completed;

      if (isSelfCompleted) {
        states.push('completed');
        completed++;
      } else if (isPrevCompleted) {
        states.push('available');
        if (firstAvailableIndex === -1) {
          firstAvailableIndex = i;
        }
      } else {
        states.push('locked');
      }
    }

    return {
      moduleStates: states,
      completedCount: completed,
      activeIndex: firstAvailableIndex === -1 ? modules.length - 1 : firstAvailableIndex,
    };
  }, [modules]);

  // Layout parameters for winding snake
  const nodeWidth = 220;
  const nodeHeight = 110;
  const stepY = 160;
  const startPaddingY = 90; // space after START island

  // Calculate coordinates for all nodes
  const nodeCoordinates = useMemo(() => {
    const centerX = screenWidth / 2;
    // Amplitude of snake curve (constrained to keep nodes comfortably on screen)
    const maxAmplitude = Math.min((screenWidth - nodeWidth) / 2 - 16, 65);

    return modules.map((_, index) => {
      // Sinusoidal winding: index 0: center-left, index 1: center-right, index 2: center-left...
      // Using sin with period of ~3 modules creates an organic S-path
      const angle = index * (Math.PI / 1.7);
      const offsetX = Math.sin(angle) * maxAmplitude;
      const x = centerX + offsetX;
      const y = startPaddingY + index * stepY;

      return {
        center: { x, y: y + nodeHeight / 2 } as Point,
        topLeft: { x: x - nodeWidth / 2, y },
      };
    });
  }, [modules, screenWidth]);

  // Auto-scroll to active module on mount or when activeIndex updates
  useEffect(() => {
    if (modules.length > 0 && activeIndex >= 0 && nodeCoordinates[activeIndex]) {
      const targetY = nodeCoordinates[activeIndex].topLeft.y;
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, targetY - 140),
          animated: true,
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, nodeCoordinates, modules.length]);

  // Show locked toast banner
  const handlePressLocked = (module: Module, prevTitle?: string) => {
    setLockedToast({
      visible: true,
      moduleTitle: module.title,
      prevTitle,
    });

    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLockedToast((prev) => ({ ...prev, visible: false }));
    });
  };

  const isCourseFullyCompleted = modules.length > 0 && completedCount === modules.length;
  const totalContentHeight = startPaddingY + modules.length * stepY + 160;

  return (
    <View style={styles.container}>
      {/* Course Header Banner */}
      <CourseHeader
        course={course}
        completedModulesCount={completedCount}
        totalModulesCount={modules.length}
      />

      {/* Floating Locked Warning Toast */}
      {lockedToast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.toastCard}>
            <Ionicons name="lock-closed" size={20} color="#EF4444" />
            <View style={styles.toastTextContainer}>
              <Text style={styles.toastTitle}>Island Locked!</Text>
              <Text style={styles.toastMessage}>
                {lockedToast.prevTitle
                  ? `Conquer "${lockedToast.prevTitle}" first to unlock this island.`
                  : 'Complete the previous module to unlock this module.'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Scrollable Snake Map */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContent, { height: totalContentHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* START ISLAND LANDMARK */}
        <View style={[styles.startIsland, { left: screenWidth / 2 - 75 }]}>
          <View style={[styles.startBadge, { backgroundColor: themeMeta.primary }]}>
            <Ionicons name="boat" size={16} color="#FFFFFF" />
            <Text style={styles.startBadgeText}>EXPEDITION START</Text>
          </View>
          <View style={styles.startAnchorPin}>
            <Ionicons name="location" size={24} color={themeMeta.primary} />
          </View>
        </View>

        {/* SVG ROAD CURVES */}
        {nodeCoordinates.map((coord, idx) => {
          if (idx === nodeCoordinates.length - 1) return null;
          const nextCoord = nodeCoordinates[idx + 1];
          const isSegmentActive = moduleStates[idx] === 'completed';

          return (
            <RoadmapPath
              key={`path-${idx}`}
              from={coord.center}
              to={nextCoord.center}
              isActive={isSegmentActive}
              themeColor={themeMeta.primary}
              index={idx}
            />
          );
        })}

        {/* ROADMAP NODES */}
        {modules.map((mod, idx) => {
          const coord = nodeCoordinates[idx];
          const state = moduleStates[idx];
          const prevTitle = idx > 0 ? modules[idx - 1].title : undefined;

          return (
            <View
              key={mod.id}
              style={[
                styles.nodePositioner,
                {
                  left: coord.topLeft.x,
                  top: coord.topLeft.y,
                },
              ]}
            >
              <RoadmapNode
                module={mod}
                index={idx}
                state={state}
                previousModuleTitle={prevTitle}
                themeColor={themeMeta.primary}
                onPress={onSelectModule}
                onPressLocked={handlePressLocked}
              />
            </View>
          );
        })}

        {/* FINAL DESTINATION ISLAND */}
        {modules.length > 0 && (
          <View
            style={[
              styles.finishIsland,
              {
                left: screenWidth / 2 - 100,
                top: startPaddingY + modules.length * stepY + 10,
              },
            ]}
          >
            <View
              style={[
                styles.finishCard,
                isCourseFullyCompleted && styles.finishCardCompleted,
              ]}
            >
              <Ionicons
                name={isCourseFullyCompleted ? 'trophy' : 'flag-outline'}
                size={32}
                color={isCourseFullyCompleted ? '#F59E0B' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.finishTitle,
                  isCourseFullyCompleted && styles.finishTitleCompleted,
                ]}
              >
                {isCourseFullyCompleted
                  ? 'COURSE COMPLETED!'
                  : 'GRAND LINE SUMMIT'}
              </Text>
              <Text style={styles.finishSubtitle}>
                {isCourseFullyCompleted
                  ? 'All islands conquered. You are a Master Developer!'
                  : `${modules.length - completedCount} modules left to claim victory.`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    position: 'relative',
    paddingBottom: 60,
  },
  startIsland: {
    position: 'absolute',
    top: 14,
    width: 150,
    alignItems: 'center',
    zIndex: 15,
  },
  startBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  startBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  startAnchorPin: {
    marginTop: 2,
  },
  nodePositioner: {
    position: 'absolute',
    zIndex: 10,
  },
  finishIsland: {
    position: 'absolute',
    width: 200,
    alignItems: 'center',
    zIndex: 15,
  },
  finishCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  finishCardCompleted: {
    borderColor: '#F59E0B',
    borderStyle: 'solid',
    backgroundColor: '#FFFBEB',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  finishTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  finishTitleCompleted: {
    color: '#B45309',
  },
  finishSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  toastContainer: {
    position: 'absolute',
    top: 190,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    maxWidth: 360,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F87171',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 12,
    color: '#F1F5F9',
    lineHeight: 16,
  },
});
