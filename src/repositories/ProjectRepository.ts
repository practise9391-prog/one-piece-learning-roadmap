import { DatabaseManager } from '../database/DatabaseManager';
import {
  ProjectTemplate,
  UserProject,
  ProjectMilestone,
  ProjectTask,
  ProjectLearningLink,
  ProjectFeature,
  ProjectBug,
  ProjectTestCase,
  ProjectDocumentation,
  PortfolioProfile,
  ProjectDashboardStats,
  ProjectHealthStatus,
  ProjectCategory,
  ProjectDifficulty,
  ProjectStatus,
  MilestoneStatus,
  TaskStatus,
  TaskType,
  TaskPriority,
  FeatureStatus,
  BugSeverity,
  BugStatus,
  TestCaseStatus,
  RelationshipType,
} from '../models/Project';
import { generateId } from '../utils/idGenerator';

export class ProjectRepository {
  private static instance: ProjectRepository | null = null;
  private db = DatabaseManager.getInstance();

  public static getInstance(): ProjectRepository {
    if (!ProjectRepository.instance) {
      ProjectRepository.instance = new ProjectRepository();
    }
    return ProjectRepository.instance;
  }

  // =========================================================================
  // 1. PROJECT TEMPLATES (IDEA LIBRARY)
  // =========================================================================

  async getProjectTemplates(
    category?: ProjectCategory,
    difficulty?: ProjectDifficulty
  ): Promise<ProjectTemplate[]> {
    const database = await this.db.getDatabase();
    let query = `SELECT * FROM project_templates WHERE 1=1`;
    const params: any[] = [];

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (difficulty) {
      query += ` AND difficulty = ?`;
      params.push(difficulty);
    }

    query += ` ORDER BY estimated_hours ASC;`;
    const rows = await database.getAllAsync<any>(query, params);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category as ProjectCategory,
      difficulty: r.difficulty as ProjectDifficulty,
      estimated_hours: r.estimated_hours,
      required_skills: JSON.parse(r.required_skills || '[]'),
      recommended_courses: JSON.parse(r.recommended_courses || '[]'),
      recommended_topics: JSON.parse(r.recommended_topics || '[]'),
      prerequisites: JSON.parse(r.prerequisites || '[]'),
      learning_outcomes: JSON.parse(r.learning_outcomes || '[]'),
      suggested_features: JSON.parse(r.suggested_features || '[]'),
      created_at: r.created_at,
    }));
  }

  async getProjectTemplateById(id: string): Promise<ProjectTemplate | null> {
    const database = await this.db.getDatabase();
    const r = await database.getFirstAsync<any>(
      `SELECT * FROM project_templates WHERE id = ?;`,
      [id]
    );
    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category as ProjectCategory,
      difficulty: r.difficulty as ProjectDifficulty,
      estimated_hours: r.estimated_hours,
      required_skills: JSON.parse(r.required_skills || '[]'),
      recommended_courses: JSON.parse(r.recommended_courses || '[]'),
      recommended_topics: JSON.parse(r.recommended_topics || '[]'),
      prerequisites: JSON.parse(r.prerequisites || '[]'),
      learning_outcomes: JSON.parse(r.learning_outcomes || '[]'),
      suggested_features: JSON.parse(r.suggested_features || '[]'),
      created_at: r.created_at,
    };
  }

  // =========================================================================
  // 2. USER PROJECTS CRUD
  // =========================================================================

  async getUserProjects(status?: ProjectStatus): Promise<UserProject[]> {
    const database = await this.db.getDatabase();
    let query = `SELECT * FROM user_projects WHERE user_id = 'default_user'`;
    const params: any[] = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY updated_at DESC;`;
    const rows = await database.getAllAsync<any>(query, params);

    return rows.map(this.mapUserProjectRow);
  }

  async getUserProjectById(id: string): Promise<UserProject | null> {
    const database = await this.db.getDatabase();
    const r = await database.getFirstAsync<any>(
      `SELECT * FROM user_projects WHERE id = ?;`,
      [id]
    );
    if (!r) return null;
    return this.mapUserProjectRow(r);
  }

  async createUserProject(params: {
    template_id?: string;
    name: string;
    description: string;
    category: ProjectCategory;
    difficulty: ProjectDifficulty;
    estimated_hours?: number;
    technologies: string[];
    problem_statement?: string;
    goal?: string;
    target_date?: string;
  }): Promise<UserProject> {
    const database = await this.db.getDatabase();
    const id = generateId('uproj');
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO user_projects (
        id, user_id, template_id, name, description, category, difficulty,
        status, progress, estimated_hours, actual_hours, start_date, target_date,
        technologies, problem_statement, goal, is_pinned_in_portfolio,
        is_hidden_in_portfolio, portfolio_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', 0.0, ?, 0.0, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?);`,
      [
        id,
        'default_user',
        params.template_id || null,
        params.name,
        params.description,
        params.category,
        params.difficulty,
        params.estimated_hours || 15,
        now,
        params.target_date || null,
        JSON.stringify(params.technologies || []),
        params.problem_statement || null,
        params.goal || null,
        now,
        now,
      ]
    );

    // Initialize Default Milestones (Roadmap)
    await this.createDefaultMilestones(id);

    // If instantiated from a template, copy suggested features & learning links
    if (params.template_id) {
      const template = await this.getProjectTemplateById(params.template_id);
      if (template) {
        // Add suggested features
        for (const feat of template.suggested_features) {
          await this.saveProjectFeature({
            project_id: id,
            title: feat,
            description: `Planned feature from ${template.title}`,
            priority: 'MEDIUM',
            status: 'PLANNED',
          });
        }

        // Add recommended learning links
        for (const crs of template.recommended_courses) {
          await this.addProjectLearningLink({
            projectId: id,
            courseId: crs,
            relationshipType: 'APPLIES',
          });
        }
      }
    }

    // Initialize Documentation scaffold
    await this.saveProjectDocumentation(id, {
      title: params.name,
      problem: params.problem_statement || '',
      goal: params.goal || '',
      features: '',
      technologies: (params.technologies || []).join(', '),
      architecture: '',
      database: '',
      apis: '',
      important_decisions: '',
      challenges: '',
      solutions: '',
      testing: '',
      deployment: '',
      future_improvements: '',
    });

    const created = await this.getUserProjectById(id);
    return created!;
  }

  async updateUserProject(id: string, updates: Partial<UserProject>): Promise<UserProject> {
    const database = await this.db.getDatabase();
    const current = await this.getUserProjectById(id);
    if (!current) throw new Error('Project not found');

    const now = new Date().toISOString();

    await database.runAsync(
      `UPDATE user_projects SET
        name = ?,
        description = ?,
        category = ?,
        difficulty = ?,
        status = ?,
        progress = ?,
        estimated_hours = ?,
        actual_hours = ?,
        start_date = ?,
        target_date = ?,
        completed_date = ?,
        technologies = ?,
        github_url = ?,
        live_url = ?,
        problem_statement = ?,
        goal = ?,
        is_pinned_in_portfolio = ?,
        is_hidden_in_portfolio = ?,
        portfolio_order = ?,
        portfolio_description = ?,
        updated_at = ?
      WHERE id = ?;`,
      [
        updates.name ?? current.name,
        updates.description ?? current.description,
        updates.category ?? current.category,
        updates.difficulty ?? current.difficulty,
        updates.status ?? current.status,
        updates.progress ?? current.progress,
        updates.estimated_hours ?? current.estimated_hours,
        updates.actual_hours ?? current.actual_hours,
        (updates.start_date !== undefined ? updates.start_date : current.start_date) ?? null,
        (updates.target_date !== undefined ? updates.target_date : current.target_date) ?? null,
        (updates.completed_date !== undefined ? updates.completed_date : current.completed_date) ?? null,
        JSON.stringify(updates.technologies ?? current.technologies ?? []),
        (updates.github_url !== undefined ? updates.github_url : current.github_url) ?? null,
        (updates.live_url !== undefined ? updates.live_url : current.live_url) ?? null,
        (updates.problem_statement !== undefined ? updates.problem_statement : current.problem_statement) ?? null,
        (updates.goal !== undefined ? updates.goal : current.goal) ?? null,
        updates.is_pinned_in_portfolio !== undefined ? (updates.is_pinned_in_portfolio ? 1 : 0) : (current.is_pinned_in_portfolio ? 1 : 0),
        updates.is_hidden_in_portfolio !== undefined ? (updates.is_hidden_in_portfolio ? 1 : 0) : (current.is_hidden_in_portfolio ? 1 : 0),
        updates.portfolio_order ?? current.portfolio_order ?? 0,
        (updates.portfolio_description !== undefined ? updates.portfolio_description : current.portfolio_description) ?? null,
        now,
        id,
      ]
    );

    return (await this.getUserProjectById(id))!;
  }

  async completeUserProject(id: string, finalNotes?: string): Promise<UserProject> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    const proj = await this.getUserProjectById(id);
    if (!proj) throw new Error('Project not found');

    // 1. Mark user project as COMPLETED
    await database.runAsync(
      `UPDATE user_projects SET
        status = 'COMPLETED',
        progress = 100.0,
        completed_date = ?,
        portfolio_description = COALESCE(portfolio_description, ?),
        updated_at = ?
      WHERE id = ?;`,
      [now, finalNotes || proj.description, now, id]
    );

    // 2. Mark all milestones as COMPLETED
    await database.runAsync(
      `UPDATE project_milestones SET status = 'COMPLETED', progress = 100.0, completed_date = ? WHERE project_id = ?;`,
      [now, id]
    );

    // 3. Part 23 Integration: Synchronize into career_projects so it immediately
    // appears in Career Preparation, Resume, and Mock Interview defense!
    await database.runAsync(
      `INSERT OR REPLACE INTO career_projects (
        id, user_id, name, description, technologies, role, duration,
        problem_statement, solution, challenges, achievements, github_url, live_url,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        `career_${proj.id}`,
        'default_user',
        proj.name,
        proj.description,
        JSON.stringify(proj.technologies),
        'Lead Developer',
        `${proj.actual_hours || proj.estimated_hours || 15} hours`,
        proj.problem_statement || null,
        finalNotes || null,
        null,
        'Successfully completed and verified in Project Builder',
        proj.github_url || null,
        proj.live_url || null,
        proj.created_at,
        now,
      ]
    );

    return (await this.getUserProjectById(id))!;
  }

  async deleteUserProject(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(`DELETE FROM user_projects WHERE id = ?;`, [id]);
    await database.runAsync(`DELETE FROM career_projects WHERE id = ?;`, [`career_${id}`]);
  }

  // =========================================================================
  // 3. PROJECT MILESTONES (ROADMAP)
  // =========================================================================

  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM project_milestones WHERE project_id = ? ORDER BY order_index ASC;`,
      [projectId]
    );

    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      title: r.title,
      description: r.description,
      order: r.order_index,
      status: r.status as MilestoneStatus,
      progress: r.progress,
      start_date: r.start_date || undefined,
      target_date: r.target_date || undefined,
      completed_date: r.completed_date || undefined,
    }));
  }

  async createDefaultMilestones(projectId: string): Promise<void> {
    const defaults = [
      { order: 1, title: 'Planning & Requirements', description: 'Define user goals, scope, and required tech stack.' },
      { order: 2, title: 'System Architecture & Schema', description: 'Design database tables, relations, and API endpoints.' },
      { order: 3, title: 'Core Feature Implementation', description: 'Build main user workflows and state persistence.' },
      { order: 4, title: 'Testing & Bug Squashing', description: 'Run test cases, verify edge conditions, and fix defects.' },
      { order: 5, title: 'Documentation & Portfolio Ready', description: 'Write README, explain design decisions, and polish UI.' },
    ];

    const database = await this.db.getDatabase();
    for (const m of defaults) {
      await database.runAsync(
        `INSERT INTO project_milestones (
          id, project_id, title, description, order_index, status, progress
        ) VALUES (?, ?, ?, ?, ?, 'AVAILABLE', 0.0);`,
        [generateId('ms'), projectId, m.title, m.description, m.order]
      );
    }
  }

  async saveMilestone(milestone: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const database = await this.db.getDatabase();
    const id = milestone.id || generateId('ms');
    const existing = await database.getFirstAsync<any>(
      `SELECT id FROM project_milestones WHERE id = ?;`,
      [id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE project_milestones SET
          title = ?, description = ?, order_index = ?, status = ?, progress = ?,
          start_date = ?, target_date = ?, completed_date = ?
        WHERE id = ?;`,
        [
          milestone.title || '',
          milestone.description || '',
          milestone.order ?? 0,
          milestone.status || 'AVAILABLE',
          milestone.progress ?? 0,
          milestone.start_date || null,
          milestone.target_date || null,
          milestone.completed_date || null,
          id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO project_milestones (
          id, project_id, title, description, order_index, status, progress,
          start_date, target_date, completed_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          milestone.project_id!,
          milestone.title || 'Milestone',
          milestone.description || '',
          milestone.order ?? 0,
          milestone.status || 'AVAILABLE',
          milestone.progress ?? 0,
          milestone.start_date || null,
          milestone.target_date || null,
          milestone.completed_date || null,
        ]
      );
    }

    const row = await database.getFirstAsync<any>(
      `SELECT * FROM project_milestones WHERE id = ?;`,
      [id]
    );
    return {
      id: row.id,
      project_id: row.project_id,
      title: row.title,
      description: row.description,
      order: row.order_index,
      status: row.status,
      progress: row.progress,
      start_date: row.start_date,
      target_date: row.target_date,
      completed_date: row.completed_date,
    };
  }

  async deleteMilestone(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(`DELETE FROM project_milestones WHERE id = ?;`, [id]);
  }

  // =========================================================================
  // 4. PROJECT TASKS
  // =========================================================================

  async getProjectTasks(
    projectId: string,
    options?: { milestoneId?: string; status?: TaskStatus }
  ): Promise<ProjectTask[]> {
    const database = await this.db.getDatabase();
    let query = `SELECT * FROM project_tasks WHERE project_id = ?`;
    const params: any[] = [projectId];

    if (options?.milestoneId) {
      query += ` AND milestone_id = ?`;
      params.push(options.milestoneId);
    }
    if (options?.status) {
      query += ` AND status = ?`;
      params.push(options.status);
    }

    query += ` ORDER BY order_index ASC, created_at ASC;`;
    const rows = await database.getAllAsync<any>(query, params);

    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      milestone_id: r.milestone_id || undefined,
      title: r.title,
      description: r.description,
      task_type: r.task_type as TaskType,
      priority: r.priority as TaskPriority,
      status: r.status as TaskStatus,
      estimated_minutes: r.estimated_minutes,
      actual_minutes: r.actual_minutes,
      due_date: r.due_date || undefined,
      completed_at: r.completed_at || undefined,
      practice_task_id: r.practice_task_id || undefined,
      order_index: r.order_index,
      created_at: r.created_at,
    }));
  }

  async saveProjectTask(task: Partial<ProjectTask>): Promise<ProjectTask> {
    const database = await this.db.getDatabase();
    const id = task.id || generateId('ptask');
    const now = new Date().toISOString();

    const existing = await database.getFirstAsync<any>(
      `SELECT id FROM project_tasks WHERE id = ?;`,
      [id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE project_tasks SET
          milestone_id = ?, title = ?, description = ?, task_type = ?,
          priority = ?, status = ?, estimated_minutes = ?, actual_minutes = ?,
          due_date = ?, completed_at = ?, practice_task_id = ?, order_index = ?
        WHERE id = ?;`,
        [
          task.milestone_id || null,
          task.title || '',
          task.description || '',
          task.task_type || 'FEATURE',
          task.priority || 'MEDIUM',
          task.status || 'TODO',
          task.estimated_minutes ?? 60,
          task.actual_minutes ?? 0,
          task.due_date || null,
          task.completed_at || null,
          task.practice_task_id || null,
          task.order_index ?? 0,
          id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO project_tasks (
          id, project_id, milestone_id, title, description, task_type,
          priority, status, estimated_minutes, actual_minutes, due_date,
          completed_at, practice_task_id, order_index, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          task.project_id!,
          task.milestone_id || null,
          task.title || 'Untitled Task',
          task.description || '',
          task.task_type || 'FEATURE',
          task.priority || 'MEDIUM',
          task.status || 'TODO',
          task.estimated_minutes ?? 60,
          task.actual_minutes ?? 0,
          task.due_date || null,
          task.completed_at || null,
          task.practice_task_id || null,
          task.order_index ?? 0,
          now,
        ]
      );
    }

    if (task.project_id) {
      await this.calculateProjectProgress(task.project_id);
    }

    const row = await database.getFirstAsync<any>(
      `SELECT * FROM project_tasks WHERE id = ?;`,
      [id]
    );
    return {
      id: row.id,
      project_id: row.project_id,
      milestone_id: row.milestone_id || undefined,
      title: row.title,
      description: row.description,
      task_type: row.task_type,
      priority: row.priority,
      status: row.status,
      estimated_minutes: row.estimated_minutes,
      actual_minutes: row.actual_minutes,
      due_date: row.due_date || undefined,
      completed_at: row.completed_at || undefined,
      practice_task_id: row.practice_task_id || undefined,
      order_index: row.order_index,
      created_at: row.created_at,
    };
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    const completedAt = status === 'COMPLETED' ? now : null;

    await database.runAsync(
      `UPDATE project_tasks SET status = ?, completed_at = ? WHERE id = ?;`,
      [status, completedAt, id]
    );

    const task = await database.getFirstAsync<{ project_id: string }>(
      `SELECT project_id FROM project_tasks WHERE id = ?;`,
      [id]
    );
    if (task?.project_id) {
      await this.calculateProjectProgress(task.project_id);
    }
  }

  async deleteProjectTask(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    const task = await database.getFirstAsync<{ project_id: string }>(
      `SELECT project_id FROM project_tasks WHERE id = ?;`,
      [id]
    );
    await database.runAsync(`DELETE FROM project_tasks WHERE id = ?;`, [id]);
    if (task?.project_id) {
      await this.calculateProjectProgress(task.project_id);
    }
  }

  // =========================================================================
  // 5. PROJECT LEARNING LINKS & "LEARN THIS FIRST"
  // =========================================================================

  async getProjectLearningLinks(projectId: string): Promise<ProjectLearningLink[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT pll.*, 
              c.name as course_name, 
              m.title as module_title, 
              t.title as topic_title, 
              t.is_completed as is_topic_completed
       FROM project_learning_links pll
       LEFT JOIN courses c ON pll.course_id = c.id
       LEFT JOIN modules m ON pll.module_id = m.id
       LEFT JOIN topics t ON pll.topic_id = t.id
       WHERE pll.project_id = ?;`,
      [projectId]
    );

    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      course_id: r.course_id,
      module_id: r.module_id || undefined,
      topic_id: r.topic_id || undefined,
      relationship_type: r.relationship_type as RelationshipType,
      course_name: r.course_name || undefined,
      module_title: r.module_title || undefined,
      topic_title: r.topic_title || undefined,
      is_topic_completed: r.is_topic_completed === 1,
    }));
  }

  async addProjectLearningLink(params: {
    projectId: string;
    courseId: string;
    moduleId?: string;
    topicId?: string;
    relationshipType?: RelationshipType;
  }): Promise<ProjectLearningLink> {
    const database = await this.db.getDatabase();
    const id = generateId('plink');
    const rel = params.relationshipType || 'APPLIES';

    await database.runAsync(
      `INSERT INTO project_learning_links (
        id, project_id, course_id, module_id, topic_id, relationship_type
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [id, params.projectId, params.courseId, params.moduleId || null, params.topicId || null, rel]
    );

    const links = await this.getProjectLearningLinks(params.projectId);
    return links.find((l) => l.id === id)!;
  }

  async deleteProjectLearningLink(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(`DELETE FROM project_learning_links WHERE id = ?;`, [id]);
  }

  async getUnfinishedPrerequisiteLinks(projectId: string): Promise<ProjectLearningLink[]> {
    const links = await this.getProjectLearningLinks(projectId);
    return links.filter((l) => l.topic_id && !l.is_topic_completed);
  }

  // =========================================================================
  // 6. PROJECT FEATURES
  // =========================================================================

  async getProjectFeatures(projectId: string): Promise<ProjectFeature[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM project_features WHERE project_id = ? ORDER BY created_at ASC;`,
      [projectId]
    );

    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      title: r.title,
      description: r.description,
      priority: r.priority as TaskPriority,
      status: r.status as FeatureStatus,
      milestone_id: r.milestone_id || undefined,
      created_at: r.created_at,
    }));
  }

  async saveProjectFeature(feature: Partial<ProjectFeature>): Promise<ProjectFeature> {
    const database = await this.db.getDatabase();
    const id = feature.id || generateId('feat');
    const now = new Date().toISOString();

    const existing = await database.getFirstAsync<any>(
      `SELECT id FROM project_features WHERE id = ?;`,
      [id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE project_features SET
          title = ?, description = ?, priority = ?, status = ?, milestone_id = ?
        WHERE id = ?;`,
        [
          feature.title || '',
          feature.description || '',
          feature.priority || 'MEDIUM',
          feature.status || 'PLANNED',
          feature.milestone_id || null,
          id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO project_features (
          id, project_id, title, description, priority, status, milestone_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          feature.project_id!,
          feature.title || 'Untitled Feature',
          feature.description || '',
          feature.priority || 'MEDIUM',
          feature.status || 'PLANNED',
          feature.milestone_id || null,
          now,
        ]
      );
    }

    if (feature.project_id) {
      await this.calculateProjectProgress(feature.project_id);
    }

    const row = await database.getFirstAsync<any>(
      `SELECT * FROM project_features WHERE id = ?;`,
      [id]
    );
    return {
      id: row.id,
      project_id: row.project_id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      milestone_id: row.milestone_id || undefined,
      created_at: row.created_at,
    };
  }

  async updateFeatureStatus(id: string, status: FeatureStatus): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(`UPDATE project_features SET status = ? WHERE id = ?;`, [status, id]);
    const feat = await database.getFirstAsync<{ project_id: string }>(
      `SELECT project_id FROM project_features WHERE id = ?;`,
      [id]
    );
    if (feat?.project_id) {
      await this.calculateProjectProgress(feat.project_id);
    }
  }

  async deleteProjectFeature(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    const feat = await database.getFirstAsync<{ project_id: string }>(
      `SELECT project_id FROM project_features WHERE id = ?;`,
      [id]
    );
    await database.runAsync(`DELETE FROM project_features WHERE id = ?;`, [id]);
    if (feat?.project_id) {
      await this.calculateProjectProgress(feat.project_id);
    }
  }

  // =========================================================================
  // 7. PROJECT BUGS (TRACKER)
  // =========================================================================

  async getProjectBugs(projectId: string, status?: BugStatus): Promise<ProjectBug[]> {
    const database = await this.db.getDatabase();
    let query = `SELECT * FROM project_bugs WHERE project_id = ?`;
    const params: any[] = [projectId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC;`;
    const rows = await database.getAllAsync<any>(query, params);

    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      title: r.title,
      description: r.description,
      severity: r.severity as BugSeverity,
      status: r.status as BugStatus,
      reproduction_steps: r.reproduction_steps || undefined,
      expected_result: r.expected_result || undefined,
      actual_result: r.actual_result || undefined,
      resolution: r.resolution || undefined,
      created_at: r.created_at,
      resolved_at: r.resolved_at || undefined,
    }));
  }

  async saveProjectBug(bug: Partial<ProjectBug>): Promise<ProjectBug> {
    const database = await this.db.getDatabase();
    const id = bug.id || generateId('bug');
    const now = new Date().toISOString();

    const existing = await database.getFirstAsync<any>(
      `SELECT id FROM project_bugs WHERE id = ?;`,
      [id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE project_bugs SET
          title = ?, description = ?, severity = ?, status = ?,
          reproduction_steps = ?, expected_result = ?, actual_result = ?,
          resolution = ?, resolved_at = ?
        WHERE id = ?;`,
        [
          bug.title || '',
          bug.description || '',
          bug.severity || 'MEDIUM',
          bug.status || 'OPEN',
          bug.reproduction_steps || null,
          bug.expected_result || null,
          bug.actual_result || null,
          bug.resolution || null,
          bug.resolved_at || null,
          id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO project_bugs (
          id, project_id, title, description, severity, status,
          reproduction_steps, expected_result, actual_result, resolution,
          created_at, resolved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          bug.project_id!,
          bug.title || 'Untitled Bug',
          bug.description || '',
          bug.severity || 'MEDIUM',
          bug.status || 'OPEN',
          bug.reproduction_steps || null,
          bug.expected_result || null,
          bug.actual_result || null,
          bug.resolution || null,
          now,
          null,
        ]
      );
    }

    const row = await database.getFirstAsync<any>(
      `SELECT * FROM project_bugs WHERE id = ?;`,
      [id]
    );
    return {
      id: row.id,
      project_id: row.project_id,
      title: row.title,
      description: row.description,
      severity: row.severity,
      status: row.status,
      reproduction_steps: row.reproduction_steps || undefined,
      expected_result: row.expected_result || undefined,
      actual_result: row.actual_result || undefined,
      resolution: row.resolution || undefined,
      created_at: row.created_at,
      resolved_at: row.resolved_at || undefined,
    };
  }

  async resolveProjectBug(id: string, resolution: string): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    await database.runAsync(
      `UPDATE project_bugs SET status = 'FIXED', resolution = ?, resolved_at = ? WHERE id = ?;`,
      [resolution, now, id]
    );
  }

  async deleteProjectBug(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(`DELETE FROM project_bugs WHERE id = ?;`, [id]);
  }

  // =========================================================================
  // 8. PROJECT TEST CASES
  // =========================================================================

  async getProjectTestCases(projectId: string): Promise<ProjectTestCase[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM project_test_cases WHERE project_id = ? ORDER BY created_at ASC;`,
      [projectId]
    );

    return rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      title: r.title,
      description: r.description,
      input: r.input || undefined,
      expected_output: r.expected_output || undefined,
      actual_output: r.actual_output || undefined,
      status: r.status as TestCaseStatus,
      test_type: r.test_type,
      created_at: r.created_at,
    }));
  }

  async saveProjectTestCase(testCase: Partial<ProjectTestCase>): Promise<ProjectTestCase> {
    const database = await this.db.getDatabase();
    const id = testCase.id || generateId('tc');
    const now = new Date().toISOString();

    const existing = await database.getFirstAsync<any>(
      `SELECT id FROM project_test_cases WHERE id = ?;`,
      [id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE project_test_cases SET
          title = ?, description = ?, input = ?, expected_output = ?,
          actual_output = ?, status = ?, test_type = ?
        WHERE id = ?;`,
        [
          testCase.title || '',
          testCase.description || '',
          testCase.input || null,
          testCase.expected_output || null,
          testCase.actual_output || null,
          testCase.status || 'NOT_RUN',
          testCase.test_type || 'MANUAL',
          id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO project_test_cases (
          id, project_id, title, description, input, expected_output,
          actual_output, status, test_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          testCase.project_id!,
          testCase.title || 'Untitled Test',
          testCase.description || '',
          testCase.input || null,
          testCase.expected_output || null,
          testCase.actual_output || null,
          testCase.status || 'NOT_RUN',
          testCase.test_type || 'MANUAL',
          now,
        ]
      );
    }

    if (testCase.project_id) {
      await this.calculateProjectProgress(testCase.project_id);
    }

    const row = await database.getFirstAsync<any>(
      `SELECT * FROM project_test_cases WHERE id = ?;`,
      [id]
    );
    return {
      id: row.id,
      project_id: row.project_id,
      title: row.title,
      description: row.description,
      input: row.input || undefined,
      expected_output: row.expected_output || undefined,
      actual_output: row.actual_output || undefined,
      status: row.status,
      test_type: row.test_type,
      created_at: row.created_at,
    };
  }

  async updateTestCaseStatus(
    id: string,
    status: TestCaseStatus,
    actualOutput?: string
  ): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      `UPDATE project_test_cases SET status = ?, actual_output = COALESCE(?, actual_output) WHERE id = ?;`,
      [status, actualOutput || null, id]
    );
    const tc = await database.getFirstAsync<{ project_id: string }>(
      `SELECT project_id FROM project_test_cases WHERE id = ?;`,
      [id]
    );
    if (tc?.project_id) {
      await this.calculateProjectProgress(tc.project_id);
    }
  }

  async deleteProjectTestCase(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    const tc = await database.getFirstAsync<{ project_id: string }>(
      `SELECT project_id FROM project_test_cases WHERE id = ?;`,
      [id]
    );
    await database.runAsync(`DELETE FROM project_test_cases WHERE id = ?;`, [id]);
    if (tc?.project_id) {
      await this.calculateProjectProgress(tc.project_id);
    }
  }

  // =========================================================================
  // 9. PROJECT DOCUMENTATION
  // =========================================================================

  async getProjectDocumentation(projectId: string): Promise<ProjectDocumentation | null> {
    const database = await this.db.getDatabase();
    const r = await database.getFirstAsync<any>(
      `SELECT * FROM project_documentation WHERE project_id = ?;`,
      [projectId]
    );
    if (!r) return null;

    return {
      project_id: r.project_id,
      title: r.title,
      problem: r.problem,
      goal: r.goal,
      features: r.features,
      technologies: r.technologies,
      architecture: r.architecture,
      database: r.database_decisions,
      apis: r.apis,
      important_decisions: r.important_decisions,
      challenges: r.challenges,
      solutions: r.solutions,
      testing: r.testing,
      deployment: r.deployment,
      future_improvements: r.future_improvements,
      updated_at: r.updated_at,
    };
  }

  async saveProjectDocumentation(
    projectId: string,
    doc: Partial<ProjectDocumentation>
  ): Promise<ProjectDocumentation> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO project_documentation (
        project_id, title, problem, goal, features, technologies,
        architecture, database_decisions, apis, important_decisions,
        challenges, solutions, testing, deployment, future_improvements, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id) DO UPDATE SET
        title = excluded.title,
        problem = excluded.problem,
        goal = excluded.goal,
        features = excluded.features,
        technologies = excluded.technologies,
        architecture = excluded.architecture,
        database_decisions = excluded.database_decisions,
        apis = excluded.apis,
        important_decisions = excluded.important_decisions,
        challenges = excluded.challenges,
        solutions = excluded.solutions,
        testing = excluded.testing,
        deployment = excluded.deployment,
        future_improvements = excluded.future_improvements,
        updated_at = excluded.updated_at;`,
      [
        projectId,
        doc.title || 'Project Documentation',
        doc.problem || '',
        doc.goal || '',
        doc.features || '',
        doc.technologies || '',
        doc.architecture || '',
        doc.database || '',
        doc.apis || '',
        doc.important_decisions || '',
        doc.challenges || '',
        doc.solutions || '',
        doc.testing || '',
        doc.deployment || '',
        doc.future_improvements || '',
        now,
      ]
    );

    await this.calculateProjectProgress(projectId);
    return (await this.getProjectDocumentation(projectId))!;
  }

  // =========================================================================
  // 10. PORTFOLIO & PORTFOLIO PROFILE
  // =========================================================================

  async getPortfolioProjects(): Promise<UserProject[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM user_projects 
       WHERE status = 'COMPLETED' AND is_hidden_in_portfolio = 0 
       ORDER BY is_pinned_in_portfolio DESC, portfolio_order ASC, completed_date DESC;`
    );

    return rows.map(this.mapUserProjectRow);
  }

  async updatePortfolioItem(
    projectId: string,
    isPinned: boolean,
    isHidden: boolean,
    order?: number,
    description?: string
  ): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `UPDATE user_projects SET
        is_pinned_in_portfolio = ?,
        is_hidden_in_portfolio = ?,
        portfolio_order = COALESCE(?, portfolio_order),
        portfolio_description = COALESCE(?, portfolio_description),
        updated_at = ?
      WHERE id = ?;`,
      [isPinned ? 1 : 0, isHidden ? 1 : 0, order ?? null, description ?? null, now, projectId]
    );
  }

  async getPortfolioProfile(): Promise<PortfolioProfile> {
    const database = await this.db.getDatabase();
    const r = await database.getFirstAsync<any>(
      `SELECT * FROM portfolio_profiles WHERE user_id = 'default_user';`
    );

    if (!r) {
      const now = new Date().toISOString();
      const defaultProf: PortfolioProfile = {
        id: 'port_default_user',
        user_id: 'default_user',
        name: 'Pavan',
        headline: 'Software & Systems Developer',
        bio: 'Passionate about engineering reliable, scalable, and elegant systems.',
        skills: ['Python', 'DSA', 'SQL', 'Django', 'Git', 'Linux'],
        location_text: 'Hyderabad, India',
        github_url: '',
        linkedin_url: '',
        portfolio_url: '',
        updated_at: now,
      };

      await database.runAsync(
        `INSERT INTO portfolio_profiles (
          id, user_id, name, headline, bio, skills, location_text,
          github_url, linkedin_url, portfolio_url, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          defaultProf.id,
          defaultProf.user_id,
          defaultProf.name,
          defaultProf.headline,
          defaultProf.bio,
          JSON.stringify(defaultProf.skills),
          defaultProf.location_text,
          defaultProf.github_url,
          defaultProf.linkedin_url,
          defaultProf.portfolio_url,
          now,
        ]
      );

      return defaultProf;
    }

    return {
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      headline: r.headline,
      bio: r.bio,
      skills: JSON.parse(r.skills || '[]'),
      location_text: r.location_text,
      github_url: r.github_url,
      linkedin_url: r.linkedin_url,
      portfolio_url: r.portfolio_url,
      updated_at: r.updated_at,
    };
  }

  async savePortfolioProfile(profile: Partial<PortfolioProfile>): Promise<PortfolioProfile> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    const current = await this.getPortfolioProfile();

    await database.runAsync(
      `INSERT INTO portfolio_profiles (
        id, user_id, name, headline, bio, skills, location_text,
        github_url, linkedin_url, portfolio_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        headline = excluded.headline,
        bio = excluded.bio,
        skills = excluded.skills,
        location_text = excluded.location_text,
        github_url = excluded.github_url,
        linkedin_url = excluded.linkedin_url,
        portfolio_url = excluded.portfolio_url,
        updated_at = excluded.updated_at;`,
      [
        current.id,
        'default_user',
        profile.name ?? current.name,
        profile.headline ?? current.headline,
        profile.bio ?? current.bio,
        JSON.stringify(profile.skills ?? current.skills),
        profile.location_text ?? current.location_text,
        profile.github_url ?? current.github_url,
        profile.linkedin_url ?? current.linkedin_url,
        profile.portfolio_url ?? current.portfolio_url,
        now,
      ]
    );

    return this.getPortfolioProfile();
  }

  async exportPortfolioMarkdown(): Promise<string> {
    const profile = await this.getPortfolioProfile();
    const projects = await this.getPortfolioProjects();

    let md = `# ${profile.name}\n`;
    md += `**${profile.headline}**\n\n`;
    if (profile.location_text) md += `📍 ${profile.location_text}\n\n`;
    if (profile.bio) md += `> ${profile.bio}\n\n`;

    if (profile.github_url || profile.linkedin_url || profile.portfolio_url) {
      md += `### Connect & Links\n`;
      if (profile.github_url) md += `- **GitHub**: [${profile.github_url}](${profile.github_url})\n`;
      if (profile.linkedin_url) md += `- **LinkedIn**: [${profile.linkedin_url}](${profile.linkedin_url})\n`;
      if (profile.portfolio_url) md += `- **Portfolio**: [${profile.portfolio_url}](${profile.portfolio_url})\n`;
      md += `\n`;
    }

    if (profile.skills && profile.skills.length > 0) {
      md += `### Core Competencies & Skills\n`;
      md += profile.skills.map((s) => `\`${s}\``).join(' • ') + `\n\n`;
    }

    md += `## Featured Projects (${projects.length})\n\n`;
    for (const p of projects) {
      md += `### ${p.name} ${p.is_pinned_in_portfolio ? '⭐' : ''}\n`;
      md += `*${p.category} | ${p.difficulty} | ${p.actual_hours || p.estimated_hours} Hours*\n\n`;
      md += `${p.portfolio_description || p.description}\n\n`;

      if (p.technologies && p.technologies.length > 0) {
        md += `**Tech Stack:** ${p.technologies.join(', ')}\n\n`;
      }
      if (p.github_url || p.live_url) {
        md += `**Links:** `;
        if (p.github_url) md += `[GitHub](${p.github_url}) `;
        if (p.live_url) md += `• [Live Application](${p.live_url})`;
        md += `\n\n`;
      }
      md += `---\n\n`;
    }

    return md;
  }

  // =========================================================================
  // 11. PROGRESS CALCULATION & HEALTH STATUS
  // =========================================================================

  /**
   * Calculates factual project progress percentage based on actual stored items.
   * Progress weighting:
   * - Milestones: 30%
   * - Tasks: 30%
   * - Features: 20%
   * - Test Cases: 10%
   * - Documentation: 10%
   */
  async calculateProjectProgress(projectId: string): Promise<number> {
    const database = await this.db.getDatabase();

    const [milestonesStats, tasksStats, featuresStats, testsStats, doc] =
      await Promise.all([
        database.getFirstAsync<{ total: number; comp: number }>(`
          SELECT COUNT(*) as total,
                 COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as comp
          FROM project_milestones WHERE project_id = ?;
        `, [projectId]),
        database.getFirstAsync<{ total: number; comp: number }>(`
          SELECT COUNT(*) as total,
                 COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as comp
          FROM project_tasks WHERE project_id = ?;
        `, [projectId]),
        database.getFirstAsync<{ total: number; comp: number }>(`
          SELECT COUNT(*) as total,
                 COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as comp
          FROM project_features WHERE project_id = ?;
        `, [projectId]),
        database.getFirstAsync<{ total: number; comp: number }>(`
          SELECT COUNT(*) as total,
                 COALESCE(SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END), 0) as comp
          FROM project_test_cases WHERE project_id = ?;
        `, [projectId]),
        this.getProjectDocumentation(projectId),
      ]);

    // Milestones (30%)
    const mTotal = milestonesStats?.total || 0;
    const mComp = milestonesStats?.comp || 0;
    const mScore = mTotal > 0 ? (mComp / mTotal) * 30 : 0;

    // Tasks (30%)
    const tTotal = tasksStats?.total || 0;
    const tComp = tasksStats?.comp || 0;
    const tScore = tTotal > 0 ? (tComp / tTotal) * 30 : 0;

    // Features (20%)
    const fTotal = featuresStats?.total || 0;
    const fComp = featuresStats?.comp || 0;
    const fScore = fTotal > 0 ? (fComp / fTotal) * 20 : 0;

    // Tests (10%)
    const testTotal = testsStats?.total || 0;
    const testComp = testsStats?.comp || 0;
    const testScore = testTotal > 0 ? (testComp / testTotal) * 10 : 0;

    // Documentation (10%)
    let docFieldsFilled = 0;
    if (doc) {
      if (doc.problem?.trim()) docFieldsFilled++;
      if (doc.goal?.trim()) docFieldsFilled++;
      if (doc.architecture?.trim()) docFieldsFilled++;
      if (doc.challenges?.trim()) docFieldsFilled++;
      if (doc.solutions?.trim()) docFieldsFilled++;
    }
    const docScore = (docFieldsFilled / 5) * 10;

    const totalProgress = Math.min(100, Math.round(mScore + tScore + fScore + testScore + docScore));

    await database.runAsync(
      `UPDATE user_projects SET progress = ? WHERE id = ?;`,
      [totalProgress, projectId]
    );

    return totalProgress;
  }

  async getProjectHealth(projectId: string): Promise<ProjectHealthStatus> {
    const database = await this.db.getDatabase();

    const [tasks, features, bugs, tests, doc, milestones, proj] =
      await Promise.all([
        this.getProjectTasks(projectId),
        this.getProjectFeatures(projectId),
        this.getProjectBugs(projectId),
        this.getProjectTestCases(projectId),
        this.getProjectDocumentation(projectId),
        this.getMilestones(projectId),
        this.getUserProjectById(projectId),
      ]);

    const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;
    const tasksBlocked = tasks.filter((t) => t.status === 'BLOCKED').length;
    const now = new Date().toISOString().split('T')[0];
    const tasksOverdue = tasks.filter(
      (t) => t.due_date && t.due_date < now && t.status !== 'COMPLETED'
    ).length;

    const featuresCompleted = features.filter((f) => f.status === 'COMPLETED').length;
    const bugsOpen = bugs.filter((b) => b.status === 'OPEN' || b.status === 'IN_PROGRESS').length;
    const bugsCritical = bugs.filter(
      (b) => b.severity === 'CRITICAL' && (b.status === 'OPEN' || b.status === 'IN_PROGRESS')
    ).length;

    const testsPassed = tests.filter((t) => t.status === 'PASSED').length;

    let docFilledCount = 0;
    if (doc) {
      if (doc.problem) docFilledCount++;
      if (doc.goal) docFilledCount++;
      if (doc.architecture) docFilledCount++;
      if (doc.challenges) docFilledCount++;
      if (doc.solutions) docFilledCount++;
    }
    const docPct = Math.round((docFilledCount / 5) * 100);

    const activeMilestone =
      milestones.find((m) => m.status === 'IN_PROGRESS') ||
      milestones.find((m) => m.status === 'AVAILABLE') ||
      milestones[0];

    return {
      project_id: projectId,
      tasks_total: tasks.length,
      tasks_completed: tasksCompleted,
      tasks_overdue: tasksOverdue,
      tasks_blocked: tasksBlocked,
      features_total: features.length,
      features_completed: featuresCompleted,
      bugs_open: bugsOpen,
      bugs_critical: bugsCritical,
      tests_total: tests.length,
      tests_passed: testsPassed,
      documentation_completion_pct: docPct,
      last_activity_date: proj?.updated_at ? proj.updated_at.split('T')[0] : 'Today',
      current_milestone_title: activeMilestone ? activeMilestone.title : 'Planning',
      overall_progress_pct: proj?.progress || 0,
    };
  }

  async getProjectDashboardStats(): Promise<ProjectDashboardStats> {
    const database = await this.db.getDatabase();

    const [
      activeCountRow,
      completedCountRow,
      ideasCountRow,
      tasksRow,
      bugsRow,
      portfolioRow,
      currentProjRow,
    ] = await Promise.all([
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM user_projects WHERE status IN ('IN_PROGRESS', 'PLANNED');
      `),
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM user_projects WHERE status = 'COMPLETED';
      `),
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM project_templates;
      `),
      database.getFirstAsync<{ comp: number; rem: number }>(`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as comp,
          COALESCE(SUM(CASE WHEN status != 'COMPLETED' THEN 1 ELSE 0 END), 0) as rem
        FROM project_tasks;
      `),
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM project_bugs WHERE status IN ('OPEN', 'IN_PROGRESS');
      `),
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM user_projects WHERE status = 'COMPLETED' AND is_hidden_in_portfolio = 0;
      `),
      database.getFirstAsync<any>(`
        SELECT * FROM user_projects WHERE status = 'IN_PROGRESS' ORDER BY updated_at DESC LIMIT 1;
      `),
    ]);

    let currentProject: UserProject | null = null;
    let currentMilestone: ProjectMilestone | null = null;

    if (currentProjRow) {
      currentProject = this.mapUserProjectRow(currentProjRow);
      const mss = await this.getMilestones(currentProject.id);
      currentMilestone =
        mss.find((m) => m.status === 'IN_PROGRESS') ||
        mss.find((m) => m.status === 'AVAILABLE') ||
        mss[0] ||
        null;
    }

    // Aggregate unique technologies used
    const allProjects = await this.getUserProjects();
    const techSet = new Set<string>();
    for (const p of allProjects) {
      for (const t of p.technologies || []) {
        techSet.add(t);
      }
    }

    return {
      active_projects_count: activeCountRow?.count || 0,
      completed_projects_count: completedCountRow?.count || 0,
      total_ideas_count: ideasCountRow?.count || 0,
      tasks_completed_count: tasksRow?.comp || 0,
      tasks_remaining_count: tasksRow?.rem || 0,
      open_bugs_count: bugsRow?.count || 0,
      portfolio_projects_count: portfolioRow?.count || 0,
      technologies_used: Array.from(techSet),
      current_project: currentProject,
      current_milestone: currentMilestone,
    };
  }

  private mapUserProjectRow(r: any): UserProject {
    return {
      id: r.id,
      user_id: r.user_id,
      template_id: r.template_id || undefined,
      name: r.name,
      description: r.description,
      category: r.category as ProjectCategory,
      difficulty: r.difficulty as ProjectDifficulty,
      status: r.status as ProjectStatus,
      progress: r.progress,
      estimated_hours: r.estimated_hours,
      actual_hours: r.actual_hours,
      start_date: r.start_date || undefined,
      target_date: r.target_date || undefined,
      completed_date: r.completed_date || undefined,
      technologies: JSON.parse(r.technologies || '[]'),
      github_url: r.github_url || undefined,
      live_url: r.live_url || undefined,
      problem_statement: r.problem_statement || undefined,
      goal: r.goal || undefined,
      is_pinned_in_portfolio: r.is_pinned_in_portfolio === 1,
      is_hidden_in_portfolio: r.is_hidden_in_portfolio === 1,
      portfolio_order: r.portfolio_order,
      portfolio_description: r.portfolio_description || undefined,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  }

  async updatePortfolioProfile(profile: Partial<PortfolioProfile>): Promise<PortfolioProfile> {
    return this.savePortfolioProfile(profile);
  }

  async toggleProjectPinned(id: string, pinned: boolean): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      'UPDATE user_projects SET is_pinned_in_portfolio = ?, updated_at = ? WHERE id = ?;',
      [pinned ? 1 : 0, new Date().toISOString(), id]
    );
  }

  async toggleProjectHidden(id: string, hidden: boolean): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      'UPDATE user_projects SET is_hidden_in_portfolio = ?, updated_at = ? WHERE id = ?;',
      [hidden ? 1 : 0, new Date().toISOString(), id]
    );
  }

  async exportPortfolioJSON(): Promise<string> {
    const profile = await this.getPortfolioProfile();
    const projects = await this.getPortfolioProjects();
    return JSON.stringify({ profile, projects }, null, 2);
  }

  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return this.getMilestones(projectId);
  }

  async getProjectHealthStatus(projectId: string): Promise<ProjectHealthStatus> {
    return this.getProjectHealth(projectId);
  }

  async createProjectTask(task: Partial<ProjectTask>): Promise<ProjectTask> {
    return this.saveProjectTask(task);
  }

  async updateProjectTask(id: string, task: Partial<ProjectTask>): Promise<ProjectTask> {
    return this.saveProjectTask({ id, ...task });
  }

  async createProjectFeature(feature: Partial<ProjectFeature>): Promise<ProjectFeature> {
    return this.saveProjectFeature(feature);
  }

  async createProjectBug(bug: Partial<ProjectBug>): Promise<ProjectBug> {
    return this.saveProjectBug(bug);
  }

  async createProjectTestCase(testCase: Partial<ProjectTestCase>): Promise<ProjectTestCase> {
    return this.saveProjectTestCase(testCase);
  }

  async updateProjectTestCase(id: string, updates: Partial<ProjectTestCase>): Promise<ProjectTestCase> {
    return this.saveProjectTestCase({ id, ...updates });
  }

  async getActiveUserProjects(): Promise<UserProject[]> {
    return this.getUserProjects('IN_PROGRESS');
  }
}

export const projectRepository = ProjectRepository.getInstance();
