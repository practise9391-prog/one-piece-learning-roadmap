import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectTemplate, ProjectDifficulty } from '../../models/Project';

interface ProjectIdeaCardProps {
  template: ProjectTemplate;
  onStartProject: (template: ProjectTemplate) => void;
  onViewDetails?: (template: ProjectTemplate) => void;
}

export const ProjectIdeaCard: React.FC<ProjectIdeaCardProps> = ({
  template,
  onStartProject,
  onViewDetails,
}) => {
  const getDifficultyColor = (diff: ProjectDifficulty) => {
    switch (diff) {
      case 'EXPERT':
        return '#EF4444';
      case 'ADVANCED':
        return '#EC4899';
      case 'INTERMEDIATE':
        return '#F59E0B';
      case 'BEGINNER':
      default:
        return '#10B981';
    }
  };

  const diffColor = getDifficultyColor(template.difficulty);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{template.category}</Text>
          </View>
          <View style={[styles.diffBadge, { borderColor: diffColor }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>
              {template.difficulty}
            </Text>
          </View>
        </View>

        <View style={styles.hoursBadge}>
          <Ionicons name="time-outline" size={12} color="#94A3B8" />
          <Text style={styles.hoursText}>~{template.estimated_hours}h</Text>
        </View>
      </View>

      <Text style={styles.title}>{template.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {template.description}
      </Text>

      {/* Skills Pills */}
      {template.required_skills && template.required_skills.length > 0 && (
        <View style={styles.skillsRow}>
          {template.required_skills.slice(0, 3).map((skill, idx) => (
            <View key={idx} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {template.required_skills.length > 3 && (
            <Text style={styles.moreSkillsText}>
              +{template.required_skills.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Card Actions */}
      <View style={styles.actionRow}>
        {onViewDetails && (
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onViewDetails(template)}
          >
            <Text style={styles.detailsBtnText}>Details</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => onStartProject(template)}
        >
          <Ionicons name="rocket-outline" size={14} color="#FFFFFF" />
          <Text style={styles.startBtnText}>Start Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  diffBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 9,
    fontWeight: '800',
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hoursText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginBottom: 10,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  skillPill: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  moreSkillsText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
