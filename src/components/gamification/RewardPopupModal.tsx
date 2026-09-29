import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface RewardPopupModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  icon?: string;
  xp: number;
  points?: number;
  onDismiss: () => void;
}

export const RewardPopupModal: React.FC<RewardPopupModalProps> = ({
  visible,
  title,
  subtitle,
  icon = '🏆',
  xp,
  points,
  onDismiss,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surfaceCard, borderColor: '#F59E0B' },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 40 }}>{icon}</Text>
          </View>

          <Text style={styles.headerTag}>REWARD UNLOCKED</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>

          {/* Reward Badges */}
          <View style={styles.rewardsRow}>
            {xp > 0 && (
              <View style={styles.xpBadge}>
                <Ionicons name="sparkles" size={16} color="#2563EB" />
                <Text style={styles.xpText}>+{xp} XP</Text>
              </View>
            )}

            {points !== undefined && points > 0 && (
              <View style={styles.ptsBadge}>
                <Ionicons name="diamond" size={16} color="#D97706" />
                <Text style={styles.ptsText}>+{points} Points</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Claim Reward</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  xpText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '800',
  },
  ptsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ptsText: {
    color: '#B45309',
    fontSize: 14,
    fontWeight: '800',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
