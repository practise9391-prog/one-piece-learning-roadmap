import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProject } from '../../models/Project';

interface PortfolioCardProps {
  project: UserProject;
  onTogglePin?: (id: string, currentlyPinned: boolean) => void;
  onHideProject?: (id: string) => void;
  onInterviewPrep?: (project: UserProject) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  onTogglePin,
  onHideProject,
  onInterviewPrep,
}) => {
  const openUrl = (url?: string | null) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const isPinned = project.is_pinned_in_portfolio;

  return (
    <View style={[styles.card, isPinned && styles.cardPinned]}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.badgeRow}>
            {isPinned && (
              <View style={styles.pinBadge}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={styles.pinText}>FEATURED</Text>
              </View>
            )}
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{project.category}</Text>
            </View>
          </View>
          <Text style={styles.title}>{project.name}</Text>
        </View>

        <View style={styles.headerActions}>
          {onTogglePin && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onTogglePin(project.id, !!isPinned)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isPinned ? 'star' : 'star-outline'}
                size={18}
                color={isPinned ? '#F59E0B' : '#64748B'}
              />
            </TouchableOpacity>
          )}

          {onHideProject && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onHideProject(project.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="eye-off-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.description}>
        {project.portfolio_description || project.description}
      </Text>

      {/* Tech Stack */}
      {project.technologies && project.technologies.length > 0 && (
        <View style={styles.techRow}>
          {project.technologies.map((t, idx) => (
            <View key={idx} style={styles.techPill}>
              <Text style={styles.techText}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Links & Metadata */}
      <View style={styles.metaRow}>
        <View style={styles.linksGroup}>
          {project.github_url && (
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openUrl(project.github_url)}
            >
              <Ionicons name="logo-github" size={14} color="#38BDF8" />
              <Text style={styles.linkText}>Source</Text>
            </TouchableOpacity>
          )}
          {project.live_url && (
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openUrl(project.live_url)}
            >
              <Ionicons name="globe-outline" size={14} color="#10B981" />
              <Text style={styles.linkText}>Live Demo</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.completedDate}>
          Delivered {project.completed_date ? project.completed_date.split('T')[0] : 'Recently'}
        </Text>
      </View>

      {/* Primary Action */}
      {onInterviewPrep && (
        <TouchableOpacity
          style={styles.interviewBtn}
          onPress={() => onInterviewPrep(project)}
        >
          <Ionicons name="school-outline" size={14} color="#38BDF8" />
          <Text style={styles.interviewBtnText}>Prepare Interview Defense</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardPinned: {
    borderColor: '#F59E0B60',
    backgroundColor: '#1E293BE0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleGroup: {
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F59E0B',
  },
  catBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  description: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 10,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  techPill: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  techText: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 10,
  },
  linksGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  completedDate: {
    fontSize: 10,
    color: '#64748B',
  },
  interviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C720',
    borderColor: '#0284C740',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
  },
  interviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
});
