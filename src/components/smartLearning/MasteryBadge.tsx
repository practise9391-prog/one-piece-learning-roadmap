import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MasteryLevel, WeakTopicLabel } from '../../models/SmartLearning';

interface MasteryBadgeProps {
  level?: MasteryLevel;
  weakLabel?: WeakTopicLabel;
  score?: number;
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({ level, weakLabel, score }) => {
  if (weakLabel) {
    let bg = '#F59E0B20';
    let text = '#D97706';
    let dot = '#D97706';

    if (weakLabel === 'Needs Practice') {
      bg = '#EF444420';
      text = '#DC2626';
      dot = '#EF4444';
    } else if (weakLabel === 'Needs Revision') {
      bg = '#8B5CF620';
      text = '#7C3AED';
      dot = '#8B5CF6';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={[styles.label, { color: text }]}>{weakLabel}</Text>
      </View>
    );
  }

  let bg = '#64748B20';
  let text = '#64748B';
  let dot = '#94A3B8';
  let title = 'Not Started';

  switch (level) {
    case 'MASTERED':
      bg = '#10B98120';
      text = '#059669';
      dot = '#10B981';
      title = 'Mastered';
      break;
    case 'STRONG':
      bg = '#3B82F620';
      text = '#2563EB';
      dot = '#3B82F6';
      title = 'Strong';
      break;
    case 'DEVELOPING':
      bg = '#F59E0B20';
      text = '#D97706';
      dot = '#F59E0B';
      title = 'Developing';
      break;
    case 'LEARNING':
      bg = '#F9731620';
      text = '#EA580C';
      dot = '#F97316';
      title = 'In Progress';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={[styles.label, { color: text }]}>
        {title}
        {score !== undefined ? ` • ${score}%` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
