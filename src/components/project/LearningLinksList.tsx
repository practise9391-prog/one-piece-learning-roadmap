import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectLearningLink } from '../../models/Project';

interface LearningLinksListProps {
  links: ProjectLearningLink[];
  onLearnTopic: (courseId: string, moduleId?: string, topicId?: string) => void;
  onAddLink?: () => void;
  onRemoveLink?: (id: string) => void;
}

export const LearningLinksList: React.FC<LearningLinksListProps> = ({
  links,
  onLearnTopic,
  onAddLink,
  onRemoveLink,
}) => {
  const unfinishedLinks = links.filter((l) => l.topic_id && !l.is_topic_completed);

  return (
    <View style={styles.container}>
      {/* "Learn This First" Callout Banner if prerequisites are pending */}
      {unfinishedLinks.length > 0 && (
        <View style={styles.learnFirstBanner}>
          <View style={styles.bannerTop}>
            <Ionicons name="school-outline" size={18} color="#F59E0B" />
            <Text style={styles.bannerTitle}>Learn This First</Text>
          </View>
          <Text style={styles.bannerDesc}>
            This project uses concepts you haven't mastered yet in your curriculum.
            Completing the lesson first will make building this feature much smoother.
          </Text>

          {unfinishedLinks.slice(0, 2).map((l) => (
            <View key={l.id} style={styles.pendingTopicCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingCourseName}>{l.course_name || l.course_id}</Text>
                <Text style={styles.pendingTopicTitle}>
                  {l.topic_title || `Topic ${l.topic_id}`}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.learnTopicBtn}
                onPress={() => onLearnTopic(l.course_id, l.module_id ?? undefined, l.topic_id ?? undefined)}
              >
                <Text style={styles.learnTopicText}>Learn Topic</Text>
                <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Connected Learning Links List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Connected Curriculum Topics</Text>
        {onAddLink && (
          <TouchableOpacity style={styles.addLinkBtn} onPress={onAddLink}>
            <Ionicons name="add" size={16} color="#38BDF8" />
            <Text style={styles.addLinkText}>Connect Topic</Text>
          </TouchableOpacity>
        )}
      </View>

      {links.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="git-network-outline" size={32} color="#64748B" />
          <Text style={styles.emptyText}>No learning topics connected yet.</Text>
          <Text style={styles.emptySub}>
            Link this project to courses like Python, Django, SQL, or DSA to bridge theory and practical implementation.
          </Text>
        </View>
      ) : (
        links.map((link) => {
          const isDone = link.is_topic_completed;

          return (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkLeft}>
                <Ionicons
                  name={isDone ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={isDone ? '#10B981' : '#F59E0B'}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <View style={styles.relBadge}>
                    <Text style={styles.relBadgeText}>{link.relationship_type}</Text>
                  </View>
                  <Text style={styles.linkTopicTitle}>
                    {link.topic_title || `${link.course_name || link.course_id} Roadmap`}
                  </Text>
                  <Text style={styles.linkCourseName}>
                    {link.course_name || link.course_id}
                    {link.module_title ? ` • ${link.module_title}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.openLessonBtn}
                  onPress={() => onLearnTopic(link.course_id, link.module_id ?? undefined, link.topic_id ?? undefined)}
                >
                  <Text style={styles.openLessonText}>{isDone ? 'Review' : 'Learn'}</Text>
                  <Ionicons name="chevron-forward" size={12} color="#38BDF8" />
                </TouchableOpacity>

                {onRemoveLink && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => onRemoveLink(link.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  learnFirstBanner: {
    backgroundColor: '#F59E0B15',
    borderColor: '#F59E0B40',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FDE68A',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
    marginBottom: 10,
  },
  pendingTopicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pendingCourseName: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pendingTopicTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  learnTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  learnTopicText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  addLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 8,
    marginBottom: 3,
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
  linkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  relBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 2,
  },
  relBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#38BDF8',
  },
  linkTopicTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  linkCourseName: {
    fontSize: 10,
    color: '#94A3B8',
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0284C720',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  openLessonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  removeBtn: {
    padding: 4,
  },
});
