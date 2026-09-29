import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ArchitectureFlowData, ArchitectureNode } from '../../models/TopicContent';
import { Colors } from '../../theme/colors';
import { GlobalAITeacherModal } from '../ai/GlobalAITeacherModal';
import { aiContextManager } from '../../services/ai/AIContextManager';

interface Props {
  data: ArchitectureFlowData;
}

export const SystemDesignDiagramWidget: React.FC<Props> = ({ data }) => {
  const [aiModalVisible, setAiModalVisible] = useState<boolean>(false);
  const getNodeIcon = (type: ArchitectureNode['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'client': return 'phone-portrait-outline';
      case 'cdn': return 'cloud-outline';
      case 'gateway': return 'shield-checkmark-outline';
      case 'lb': return 'git-merge-outline';
      case 'service': return 'server-outline';
      case 'cache': return 'flash-outline';
      case 'database': return 'file-tray-full-outline';
      case 'queue': return 'file-tray-stacked-outline';
      case 'storage': return 'folder-open-outline';
      case 'search': return 'search-outline';
      default: return 'cube-outline';
    }
  };

  const getNodeColor = (type: ArchitectureNode['type']): string => {
    switch (type) {
      case 'client': return '#3B82F6';
      case 'cdn': return '#8B5CF6';
      case 'gateway': return '#EC4899';
      case 'lb': return '#06B6D4';
      case 'service': return '#10B981';
      case 'cache': return '#F59E0B';
      case 'database': return '#EF4444';
      case 'queue': return '#6366F1';
      case 'storage': return '#64748B';
      case 'search': return '#14B8A6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Ionicons name="git-network-outline" size={18} color="#0284C7" />
          <Text style={styles.title}>{data.title || 'SYSTEM ARCHITECTURE FLOW'}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            aiContextManager.setSystemDesignContext({
              topicTitle: data.title,
              components: data.nodes.map((n) => `${n.label} (${n.type})`),
              tradeOffs: data.description,
            });
            setAiModalVisible(true);
          }}
          style={styles.aiExplainBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <Text style={styles.aiExplainBtnText}>AI Explain</Text>
        </TouchableOpacity>
      </View>
      {data.description && <Text style={styles.desc}>{data.description}</Text>}

      {/* Visual Nodes Sequence */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flowContainer}>
        {data.nodes.map((node, idx) => {
          const color = getNodeColor(node.type);
          return (
            <React.Fragment key={node.id || 'node-' + idx}>
              <View style={[styles.nodeCard, { borderColor: color }]}>
                <View style={[styles.nodeBadge, { backgroundColor: color + '20' }]}>
                  <Ionicons name={getNodeIcon(node.type)} size={16} color={color} />
                  <Text style={[styles.nodeType, { color }]}>{node.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.nodeLabel}>{node.label}</Text>
                <Text style={styles.nodeRole}>{node.role}</Text>
                {node.techExamples && node.techExamples.length > 0 && (
                  <View style={styles.techPill}>
                    <Text style={styles.techText}>{node.techExamples.join(', ')}</Text>
                  </View>
                )}
                {node.hitMissInfo && (
                  <Text style={styles.hitMiss}>{node.hitMissInfo}</Text>
                )}
              </View>
              {idx < data.nodes.length - 1 && (
                <View style={styles.arrowBox}>
                  <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
                  {data.edges && data.edges[idx]?.label && (
                    <Text style={styles.edgeLabel}>{data.edges[idx].label}</Text>
                  )}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Step by Step Flow Sequence */}
      {data.flowSteps && data.flowSteps.length > 0 && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Execution Flow:</Text>
          {data.flowSteps.map((step, sIdx) => (
            <View key={'step-' + sIdx} style={styles.stepRow}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{sIdx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      <GlobalAITeacherModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        initialMode="SYSTEM_DESIGN_ARCH"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  desc: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  flowContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    gap: 8,
  },
  nodeCard: {
    width: 140,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  nodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  nodeType: {
    fontSize: 9,
    fontWeight: '700',
  },
  nodeLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  nodeRole: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 6,
  },
  techPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  techText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '600',
  },
  hitMiss: {
    color: '#F59E0B',
    fontSize: 9,
    fontStyle: 'italic',
  },
  arrowBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  edgeLabel: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  stepsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  stepsTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  stepNumberBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  stepText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  aiExplainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiExplainBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
