import { dbManager } from '../database/DatabaseManager';
import {
  CareerRoadmap,
  CareerStage,
  CareerProject,
  CareerReadiness,
  ResumeProfile,
  MockInterviewRecord,
} from '../models/Career';

export class CareerRepository {
  private static instance: CareerRepository;
  

  private constructor() {
    
  }

  public static getInstance(): CareerRepository {
    if (!CareerRepository.instance) {
      CareerRepository.instance = new CareerRepository();
    }
    return CareerRepository.instance;
  }

  async getCareerRoadmaps(): Promise<CareerRoadmap[]> {
    const database = await dbManager.getDatabase();
    return database.getAllAsync<CareerRoadmap>(
      'SELECT * FROM career_roadmaps ORDER BY created_at ASC;'
    );
  }

  async getCareerProjects(): Promise<CareerProject[]> {
    const database = await dbManager.getDatabase();
    return database.getAllAsync<CareerProject>(
      'SELECT * FROM career_projects ORDER BY updated_at DESC;'
    );
  }

  async addCareerProject(project: Omit<CareerProject, 'created_at' | 'updated_at'>): Promise<CareerProject> {
    const database = await dbManager.getDatabase();
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT OR REPLACE INTO career_projects (
        id, title, role, tech_stack, github_url, live_demo_url,
        description, key_achievements, interview_topics, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        project.id,
        project.title,
        project.role,
        project.tech_stack,
        project.github_url ?? null,
        project.live_demo_url ?? null,
        project.description,
        project.key_achievements ?? null,
        project.interview_topics ?? null,
        now,
        now,
      ]
    );

    const rows = await database.getAllAsync<CareerProject>(
      'SELECT * FROM career_projects WHERE id = ?;',
      [project.id]
    );
    return rows[0];
  }

  async getCareerReadiness(): Promise<CareerReadiness> {
    const database = await dbManager.getDatabase();
    const rows = await database.getAllAsync<CareerReadiness>(
      'SELECT * FROM career_readiness WHERE user_id = ? LIMIT 1;',
      ['default_user']
    );

    if (rows.length > 0) return rows[0];

    const defaultReadiness: CareerReadiness = {
      id: 'default_readiness',
      user_id: 'default_user',
      technical_score: 45.0,
      dsa_score: 30.0,
      system_design_score: 25.0,
      soft_skills_score: 60.0,
      overall_score: 40.0,
      updated_at: new Date().toISOString(),
    };

    await database.runAsync(
      `INSERT OR REPLACE INTO career_readiness (
        id, user_id, technical_score, dsa_score, system_design_score, soft_skills_score, overall_score, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        defaultReadiness.id,
        defaultReadiness.user_id,
        defaultReadiness.technical_score,
        defaultReadiness.dsa_score,
        defaultReadiness.system_design_score,
        defaultReadiness.soft_skills_score,
        defaultReadiness.overall_score,
        defaultReadiness.updated_at,
      ]
    );

    return defaultReadiness;
  }
}

export const careerRepository = CareerRepository.getInstance();
