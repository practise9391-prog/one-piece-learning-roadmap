import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartRecommendation } from '../../models/SmartLearning';

interface WhyThisModalProps {
  visible: boolean;
  recommendation: SmartRecommendation | null;
  onClose: () => void;
}

export const WhyThisModal: React.FC<WhyThisModalProps> = ({
  visible,
  recommendation,
  onClose,
}) => {
  if (!recommendation) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="bulb-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.headerTitle}>Why this recommendation?</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.topicSubtitle}>
            {recommendation.course_name} → {recommendation.topic_title}
          </Text>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Primary rationale box */}
            <View style={styles.primaryBox}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 2 }} />
              <Text style={styles.primaryText}>{recommendation.primary_reason}</Text>
            </View>

            {/* Fact-based criteria points */}
            <Text style={styles.criteriaTitle}>Real Data Signals Used:</Text>
            {recommendation.detailed_reasons.map((reason, index) => (
              <View key={`reason_${index}`} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{reason}</Text>
              </View>
            ))}

            {/* Transparency Note */}
            <View style={styles.transparencyBox}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
              <Text style={styles.transparencyText}>
                This recommendation is calculated strictly from your local course progress, practice submissions, and spaced revision timeline.
              </Text>
            </View>
          </ScrollView>

          {/* Close Action */}
          <TouchableOpacity style={styles.gotItButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.gotItText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  topicSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  body: {
    marginBottom: 16,
  },
  primaryBox: {
    flexDirection: 'row',
    backgroundColor: '#05966915',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryText: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#E2E8F0',
    flex: 1,
    lineHeight: 20,
  },
  transparencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  transparencyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  gotItButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
});
