import { dbManager } from '../database/DatabaseManager';
import { courseRepository } from '../repositories/CourseRepository';
import { moduleRepository } from '../repositories/ModuleRepository';
import { progressRepository } from '../repositories/ProgressRepository';
import { Course } from '../models/Course';
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

      // 2. Upsert user progress record in SQLite
      await progressRepository.upsert(courseId, moduleId, 'completed', now);

      // 3. Count total and completed modules for the course
      const counts = await moduleRepository.countByCourse(courseId);
      const total = counts.total;
      const completed = counts.completed;
      const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
      const isCourseCompleted = total > 0 && completed === total;

      // 4. Update course row in SQLite
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
   * Reverts module completion and recalculates course progress.
   */
  async uncompleteModule(courseId: string, moduleId: string): Promise<Course> {
    const db = await dbManager.getDatabase();

    await db.withTransactionAsync(async () => {
      // 1. Revert module status
      await moduleRepository.setCompletionStatus(moduleId, false, null);

      // 2. Revert progress record to in_progress
      await progressRepository.upsert(courseId, moduleId, 'in_progress', null);

      // 3. Recalculate
      const counts = await moduleRepository.countByCourse(courseId);
      const total = counts.total;
      const completed = counts.completed;
      const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
      const isCourseCompleted = total > 0 && completed === total;

      // 4. Update course
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
   * Recalculates stats for a course (e.g. after adding or deleting modules).
   */
  async recalculateCourse(courseId: string): Promise<Course> {
    const counts = await moduleRepository.countByCourse(courseId);
    const total = counts.total;
    const completed = counts.completed;
    const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0.0;
    const isCourseCompleted = total > 0 && completed === total;

    await courseRepository.updateProgressStats(
      courseId,
      total,
      completed,
      percentage,
      isCourseCompleted
    );

    const updated = await courseRepository.getById(courseId);
    if (!updated) {
      throw new Error(`Course ${courseId} not found`);
    }
    return updated;
  }
}

export const progressService = new ProgressService();

