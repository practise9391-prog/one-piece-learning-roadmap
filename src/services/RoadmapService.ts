import { courseRepository } from '../repositories/CourseRepository';
import { moduleRepository } from '../repositories/ModuleRepository';
import { topicRepository } from '../repositories/TopicRepository';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Topic } from '../models/Topic';
import { progressService } from './ProgressService';
import { generateId, generateSlug } from '../utils/idGenerator';

export class RoadmapService {
  /**
   * Retrieves all courses currently in SQLite.
   */
  async getCourses(): Promise<Course[]> {
    return await courseRepository.getAll();
  }

  /**
   * Retrieves a single course by ID.
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    return await courseRepository.getById(courseId);
  }

  /**
   * Retrieves a course and its modules with topic counts.
   */
  async getCourseWithModules(courseId: string): Promise<{
    course: Course | null;
    modules: Module[];
  }> {
    const [course, modules] = await Promise.all([
      courseRepository.getById(courseId),
      moduleRepository.getByCourseId(courseId),
    ]);
    return { course, modules };
  }

  /**
   * Retrieves a module and all its topics ordered by order_index.
   */
  async getModuleWithTopics(moduleId: string): Promise<{
    module: Module | null;
    topics: Topic[];
  }> {
    const [mod, topics] = await Promise.all([
      moduleRepository.getById(moduleId),
      topicRepository.getByModuleId(moduleId),
    ]);
    return { module: mod, topics };
  }

  /**
   * Adds a new course to SQLite.
   */
  async addCourse(params: {
    name: string;
    description?: string;
    icon?: string;
    theme?: string;
    order?: number;
  }): Promise<Course> {
    const slug = generateSlug(params.name);
    const id = slug.length > 0 ? slug : generateId('course');

    const existing = await courseRepository.getById(id);
    const finalId = existing ? `${id}_${Date.now().toString(36)}` : id;

    const allCourses = await courseRepository.getAll();
    const nextOrder = params.order ?? allCourses.length + 1;

    return await courseRepository.create({
      id: finalId,
      name: params.name,
      description: params.description || '',
      icon: params.icon || 'book-outline',
      theme: params.theme || 'default',
      order: nextOrder,
    });
  }

  /**
   * Adds a new module to a course and updates course total modules in SQLite.
   */
  async addModule(params: {
    courseId: string;
    title: string;
    description?: string;
    order?: number;
    icon?: string;
  }): Promise<Module> {
    const existingModules = await moduleRepository.getByCourseId(params.courseId);
    const nextOrder = params.order ?? existingModules.length + 1;
    const moduleId = generateId('mod');

    const createdModule = await moduleRepository.create({
      id: moduleId,
      course_id: params.courseId,
      title: params.title,
      description: params.description || '',
      order: nextOrder,
      icon: params.icon || 'book-outline',
    });

    await progressService.recalculateCourse(params.courseId);

    return createdModule;
  }

  /**
   * Deletes a module and recalculates course stats.
   */
  async deleteModule(courseId: string, moduleId: string): Promise<void> {
    await moduleRepository.delete(moduleId);
    await progressService.recalculateCourse(courseId);
  }

  /**
   * Deletes a course.
   */
  async deleteCourse(courseId: string): Promise<void> {
    await courseRepository.delete(courseId);
  }
}

export const roadmapService = new RoadmapService();
