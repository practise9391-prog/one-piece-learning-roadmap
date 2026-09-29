import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ExecutionStep } from '../../models/Debugger';

interface ExpressionEvaluatorProps {
  currentStep?: ExecutionStep;
}

export const ExpressionEvaluator: React.FC<ExpressionEvaluatorProps> = ({ currentStep }) => {
  const { colors, isDark } = useTheme();

  if (!currentStep) return null;

  const { expressionEvaluation, activeBranch, loopState, operation, explanation } = currentStep;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
      {/* 1. Step Explanation Banner */}
      <View style={[styles.explanationBanner, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Ionicons name="information-circle" size={17} color="#10B981" />
        <Text style={[styles.explanationText, { color: isDark ? colors.textPrimary : '#064E3B' }]}>
          {explanation}
        </Text>
      </View>

      {/* 2. Expression / Calculation Breakdown (Section 14) */}
      {expressionEvaluation && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator-outline" size={15} color="#38BDF8" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              EXPRESSION EVALUATION ORDER
            </Text>
          </View>

          <View style={[styles.calcBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border }]}>
            {/* Step A: Read Operands */}
            {expressionEvaluation.operands.length > 0 && (
              <View style={styles.operandsRow}>
                <Text style={styles.stepNum}>1. Read Operands: </Text>
                {expressionEvaluation.operands.map((op, idx) => (
                  <View key={idx} style={styles.operandChip}>
                    <Text style={styles.opName}>{op.name}</Text>
                    <Ionicons name="arrow-forward" size={10} color="#94A3B8" />
                    <Text style={styles.opVal}>{JSON.stringify(op.value)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Step B: Calculate */}
            <View style={styles.calcRow}>
              <Text style={styles.stepNum}>2. Calculate: </Text>
              <Text style={[styles.calcFormula, { color: '#38BDF8' }]}>
                {expressionEvaluation.calculation}
              </Text>
            </View>

            {/* Step C: Store Result */}
            {expressionEvaluation.targetVariable && (
              <View style={styles.storeRow}>
                <Text style={styles.stepNum}>3. Store Result: </Text>
                <View style={styles.storeChip}>
                  <Text style={styles.targetVar}>{expressionEvaluation.targetVariable}</Text>
                  <Text style={styles.arrowSymbol}>→</Text>
                  <Text style={styles.resultVal}>{JSON.stringify(expressionEvaluation.result)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 3. Condition Branching (Section 15) */}
      {activeBranch !== undefined && activeBranch !== null && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-branch-outline" size={15} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              BRANCH DECISION
            </Text>
          </View>
          <View style={styles.branchContainer}>
            <View
              style={[
                styles.branchCard,
                activeBranch === 'TRUE' ? styles.activeBranchCard : styles.inactiveBranchCard,
                { borderColor: activeBranch === 'TRUE' ? '#10B981' : colors.border },
              ]}
            >
              <View style={styles.branchTagRow}>
                <Ionicons
                  name={activeBranch === 'TRUE' ? 'checkmark-circle' : 'remove-circle-outline'}
                  size={14}
                  color={activeBranch === 'TRUE' ? '#10B981' : '#64748B'}
                />
                <Text style={[styles.branchTitle, { color: activeBranch === 'TRUE' ? '#10B981' : '#64748B' }]}>
                  TRUE BRANCH {activeBranch === 'TRUE' ? '(ACTIVE)' : '(SKIPPED)'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.branchCard,
                activeBranch === 'FALSE' ? styles.activeBranchCard : styles.inactiveBranchCard,
                { borderColor: activeBranch === 'FALSE' ? '#EF4444' : colors.border },
              ]}
            >
              <View style={styles.branchTagRow}>
                <Ionicons
                  name={activeBranch === 'FALSE' ? 'checkmark-circle' : 'remove-circle-outline'}
                  size={14}
                  color={activeBranch === 'FALSE' ? '#EF4444' : '#64748B'}
                />
                <Text style={[styles.branchTitle, { color: activeBranch === 'FALSE' ? '#EF4444' : '#64748B' }]}>
                  FALSE / ELSE BRANCH {activeBranch === 'FALSE' ? '(ACTIVE)' : '(SKIPPED)'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 4. Loop Tracker (Section 16) */}
      {loopState && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sync-outline" size={15} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              LOOP EXECUTION STATE
            </Text>
          </View>

          <View style={[styles.loopBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border }]}>
            <View style={styles.loopMetricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Variable</Text>
                <Text style={[styles.metricVal, { color: '#8B5CF6' }]}>{loopState.loopVariable}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Iteration</Text>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>#{loopState.iteration}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Condition / State</Text>
                <Text style={[styles.metricVal, { color: loopState.isFinished ? '#10B981' : '#F59E0B' }]}>
                  {loopState.condition}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 6,
    gap: 10,
  },
  explanationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  explanationText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  calcBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  operandsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  operandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  opName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#38BDF8',
    fontFamily: 'monospace',
  },
  opVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calcFormula: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  targetVar: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  arrowSymbol: {
    color: '#10B981',
    fontWeight: '800',
  },
  resultVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  branchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  branchCard: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  activeBranchCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  inactiveBranchCard: {
    opacity: 0.45,
    backgroundColor: 'transparent',
  },
  branchTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchTitle: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  loopBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  loopMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
