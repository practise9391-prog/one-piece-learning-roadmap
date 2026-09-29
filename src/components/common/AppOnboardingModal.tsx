import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface AppOnboardingModalProps {
  visible: boolean;
  onFinish: () => void;
}

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge: string;
  title: string;
  description: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    icon: 'map',
    color: '#0284C7',
    badge: 'STRUCTURED CURRICULUM',
    title: 'Island-by-Island Roadmaps',
    description:
      'Master complete engineering disciplines step by step. From Python & JavaScript fundamentals to full-stack React, System Design, and 10 Master Levels of Algorithms.',
  },
  {
    icon: 'terminal',
    color: '#10B981',
    badge: 'HANDS-ON PRACTICE',
    title: 'Real Code Execution & Labs',
    description:
      'Solve coding problems, run automated test cases, and explore visual algorithm simulations with line-by-line dry runs and live variable tracking.',
  },
  {
    icon: 'sparkles',
    color: '#F59E0B',
    badge: 'AI LEARNING LAYER',
    title: 'AI Tutor & Proven Mastery',
    description:
      'Get instant answers, debug error messages, practice interview questions, track XP, earn pirate achievements, and build daily study habits.',
  },
];

export const AppOnboardingModal: React.FC<AppOnboardingModalProps> = ({ visible, onFinish }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentSlide = ONBOARDING_SLIDES[currentIndex];
  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <SafeAreaView style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Top Row: Skip button */}
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.badgeDot, { backgroundColor: currentSlide.color }]} />
              <Text style={[styles.badgeText, { color: currentSlide.color }]}>
                {currentSlide.badge}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Central Icon Illustration */}
          <View style={styles.illustrationWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: currentSlide.color + '1A', borderColor: currentSlide.color + '40' }]}>
              <Ionicons name={currentSlide.icon} size={52} color={currentSlide.color} />
            </View>
          </View>

          {/* Content */}
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <Text style={styles.slideDesc}>{currentSlide.description}</Text>

          {/* Step Indicator Dots */}
          <View style={styles.dotsRow}>
            {ONBOARDING_SLIDES.map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.stepDot,
                  idx === currentIndex && [styles.stepDotActive, { backgroundColor: currentSlide.color }],
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: currentSlide.color }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {isLast ? 'Set Sail on Grand Line' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 33, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    maxWidth: 440,
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: 14,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  slideDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
    marginBottom: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  stepDotActive: {
    width: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
