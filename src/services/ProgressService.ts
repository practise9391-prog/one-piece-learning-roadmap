import { dbManager } from '../database/DatabaseManager';
import { courseRepository } from '../repositories/CourseRepository';
import { moduleRepository } from '../repositories/ModuleRepository';
import { topicRepository } from '../repositories/TopicRepository';
import { progressRepository } from '../repositories/ProgressRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Topic } from '../models/Topic';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class ProgressService {
  /**
   * Marks a module as completed and atomically recalculates course progress stats in SQLite.
   */
  async completeModule(courseId: string, moduleId: string): Promise<Course> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.withTransactionAsync(async () => {
      // 1. Mark module completed in SQLite
      await moduleRepository.setCompletionStatus(moduleId, true, now);

      // 2. Mark all topics under this module completed as well
      await db.runAsync(
        'UPDATE topics SET is_completed = 1, completed_at = ? WHERE module_id = ?;',
        [now, moduleId]
      );

      // 3. Upsert user progress record in SQLite
      await progressRepository.upsert(courseId, moduleId, 'completed', now);

      // 4. Count total and completed modules for the course
      const counts = await moduleRepository.countByCourse(courseId);
      const total = counts.total;
      const completed = counts.completed;
      const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
      const isCourseCompleted = total > 0 && completed === total;

      // 5. Update course row in SQLite
      await courseRepository.updateProgressStats(
        courseId,
        total,
        completed,
        percentage,
        isCourseCompleted
      );
    });

    // Record activity
    activityRepository.recordActivity({
      courseId,
      moduleId,
      activityType: 'MODULE_COMPLETED',
    }).catch(() => {});

    const updatedCourse = await courseRepository.getById(courseId);
    if (!updatedCourse) {
      throw new Error(`Course ${courseId} not found after progress calculation`);
    }
    return updatedCourse;
  }

  /**
   * Reverts module completion and recalculates course progress.
   */
  async uncompleteModule(courseId: string, moduleId: string): Promise<Course> {
    const db = await dbManager.getDatabase();

    await db.withTransactionAsync(async () => {
      // 1. Revert module status
      await moduleRepository.setCompletionStatus(moduleId, false, null);

      // 2. Mark topics under this module uncompleted
      await db.runAsync(
        'UPDATE topics SET is_completed = 0, completed_at = NULL WHERE module_id = ?;',
        [moduleId]
      );

      // 3. Revert progress record to in_progress
      await progressRepository.upsert(courseId, moduleId, 'in_progress', null);

      // 4. Recalculate
      const counts = await moduleRepository.countByCourse(courseId);
      const total = counts.total;
      const completed = counts.completed;
      const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
      const isCourseCompleted = total > 0 && completed === total;

      // 5. Update course
      await courseRepository.updateProgressStats(
        courseId,
        total,
        completed,
        percentage,
        isCourseCompleted
      );
    });

    const updatedCourse = await courseRepository.getById(courseId);
    if (!updatedCourse) {
      throw new Error(`Course ${courseId} not found after progress calculation`);
    }
    return updatedCourse;
  }

  /**
   * Toggles topic completion status and updates module and course completion atomically.
   */
  async toggleTopicCompletion(
    courseId: string,
    moduleId: string,
    topicId: string
  ): Promise<{ topic: Topic; module: Module; course: Course }> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    const currentTopic = await topicRepository.getById(topicId);
    if (!currentTopic) {
      throw new Error(`Topic ${topicId} not found`);
    }

    const nextState = !currentTopic.is_completed;
    const completedAt = nextState ? now : null;

    let isModuleComplete = false;

    await db.withTransactionAsync(async () => {
      // 1. Update topic
      await topicRepository.setCompletionStatus(topicId, nextState, completedAt);

      // 2. Check if all topics in this module are now completed
      const topicCounts = await topicRepository.countByModule(moduleId);
      isModuleComplete =
        topicCounts.total > 0 && topicCounts.completed === topicCounts.total;

      await moduleRepository.setCompletionStatus(
        moduleId,
        isModuleComplete,
        isModuleComplete ? now : null
      );

      // 3. Update user_progress
      await progressRepository.upsert(
        courseId,
        moduleId,
        isModuleComplete ? 'completed' : topicCounts.completed > 0 ? 'in_progress' : 'not_started',
        isModuleComplete ? now : null
      );

      // 4. Recalculate course statistics
      const moduleCounts = await moduleRepository.countByCourse(courseId);
      const total = moduleCounts.total;
      const completed = moduleCounts.completed;
      const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
      const isCourseComplete = total > 0 && completed === total;

      await courseRepository.updateProgressStats(
        courseId,
        total,
        completed,
        percentage,
        isCourseComplete
      );
    });

    // Record activity if marked complete
    if (nextState) {
      activityRepository.recordActivity({
        courseId,
        moduleId,
        topicId,
        activityType: 'TOPIC_COMPLETED',
      }).catch(() => {});

      if (isModuleComplete) {
        activityRepository.recordActivity({
          courseId,
          moduleId,
          activityType: 'MODULE_COMPLETED',
        }).catch(() => {});
      }
    }

    const [updatedTopic, updatedModule, updatedCourse] = await Promise.all([
      topicRepository.getById(topicId),
      moduleRepository.getById(moduleId),
      courseRepository.getById(courseId),
    ]);

    return {
      topic: updatedTopic!,
      module: updatedModule!,
      course: updatedCourse!,
    };
  }

  /**
   * Recalculates course module counts and percentage after structure modifications.
   */
  async recalculateCourse(courseId: string): Promise<Course> {
    const counts = await moduleRepository.countByCourse(courseId);
    const total = counts.total;
    const completed = counts.completed;
    const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
    const isCompleted = total > 0 && completed === total;

    await courseRepository.updateProgressStats(
      courseId,
      total,
      completed,
      percentage,
      isCompleted
    );

    const updated = await courseRepository.getById(courseId);
    if (!updated) {
      throw new Error(`Course ${courseId} not found`);
    }
    return updated;
  }
}

export const progressService = new ProgressService();
