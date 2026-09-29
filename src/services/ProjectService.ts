import { projectRepository, ProjectRepository } from '../repositories/ProjectRepository';
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
  TaskStatus,
  FeatureStatus,
  BugStatus,
  TestCaseStatus,
} from '../models/Project';
import { gamificationService } from './GamificationService';
import { notificationService } from './NotificationService';

export interface AISolutionOption {
  title: string;
  codeSnippet?: string;
  explanation: string;
  pros: string[];
  cons: string[];
}

export interface AIProjectAdvice {
  simpleApproach: AISolutionOption;
  alternativeApproach: AISolutionOption;
  tradeOffAnalysis: string;
  potentialEdgeCases: string[];
}

export class ProjectService {
  private static instance: ProjectService | null = null;
  private repository: ProjectRepository = projectRepository;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // =========================================================================
  // 1. REPOSITORY DELEGATION & GAMIFICATION HOOKS
  // =========================================================================

  async getProjectTemplates(
    category?: ProjectCategory,
    difficulty?: ProjectDifficulty
  ): Promise<ProjectTemplate[]> {
    return this.repository.getProjectTemplates(category, difficulty);
  }

  async getProjectTemplateById(id: string): Promise<ProjectTemplate | null> {
    return this.repository.getProjectTemplateById(id);
  }

  async getUserProjects(status?: ProjectStatus): Promise<UserProject[]> {
    return this.repository.getUserProjects(status);
  }

  async getUserProjectById(id: string): Promise<UserProject | null> {
    return this.repository.getUserProjectById(id);
  }

  async createUserProject(params: Parameters<ProjectRepository['createUserProject']>[0]): Promise<UserProject> {
    const created = await this.repository.createUserProject(params);
    try {
      await gamificationService.awardDirectReward(
        'CAREER_PROJECT_ADDED',
        created.id,
        20,
        10,
        `Started building real project: ${created.name}`
      );
    } catch {}
    return created;
  }

  async updateUserProject(
    id: string,
    updates: Partial<UserProject>
  ): Promise<UserProject> {
    return this.repository.updateUserProject(id, updates);
  }

  async completeUserProject(id: string, finalNotes?: string): Promise<UserProject> {
    const completed = await this.repository.completeUserProject(id, finalNotes);
    try {
      await gamificationService.awardDirectReward(
        'COURSE_COMPLETED', // highest tier milestone reward
        `proj_completed_${id}`,
        100,
        50,
        `🏆 Successfully delivered real-world project: ${completed.name}`
      );
    } catch {}
    return completed;
  }

  async deleteUserProject(id: string): Promise<void> {
    return this.repository.deleteUserProject(id);
  }

  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return this.repository.getMilestones(projectId);
  }

  async saveMilestone(milestone: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    return this.repository.saveMilestone(milestone);
  }

  async deleteMilestone(id: string): Promise<void> {
    return this.repository.deleteMilestone(id);
  }

  async getProjectTasks(
    projectId: string,
    options?: { milestoneId?: string; status?: TaskStatus }
  ): Promise<ProjectTask[]> {
    return this.repository.getProjectTasks(projectId, options);
  }

  async saveProjectTask(task: Partial<ProjectTask>): Promise<ProjectTask> {
    return this.repository.saveProjectTask(task);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    await this.repository.updateTaskStatus(id, status);
    if (status === 'COMPLETED') {
      try {
        await gamificationService.awardDirectReward(
          'PRACTICE_TASK_COMPLETED',
          `task_comp_${id}`,
          5,
          2,
          'Completed project milestone task'
        );
      } catch {}
    }
  }

  async deleteProjectTask(id: string): Promise<void> {
    return this.repository.deleteProjectTask(id);
  }

  async getProjectLearningLinks(projectId: string): Promise<ProjectLearningLink[]> {
    return this.repository.getProjectLearningLinks(projectId);
  }

  async addProjectLearningLink(params: Parameters<ProjectRepository['addProjectLearningLink']>[0]): Promise<ProjectLearningLink> {
    return this.repository.addProjectLearningLink(params);
  }

  async deleteProjectLearningLink(id: string): Promise<void> {
    return this.repository.deleteProjectLearningLink(id);
  }

  async getUnfinishedPrerequisiteLinks(projectId: string): Promise<ProjectLearningLink[]> {
    return this.repository.getUnfinishedPrerequisiteLinks(projectId);
  }

  async getProjectFeatures(projectId: string): Promise<ProjectFeature[]> {
    return this.repository.getProjectFeatures(projectId);
  }

  async saveProjectFeature(feature: Partial<ProjectFeature>): Promise<ProjectFeature> {
    return this.repository.saveProjectFeature(feature);
  }

  async updateFeatureStatus(id: string, status: FeatureStatus): Promise<void> {
    await this.repository.updateFeatureStatus(id, status);
    if (status === 'COMPLETED') {
      try {
        await gamificationService.awardDirectReward(
          'TASK_ACCEPTED',
          `feat_comp_${id}`,
          15,
          5,
          'Implemented project feature'
        );
      } catch {}
    }
  }

  async deleteProjectFeature(id: string): Promise<void> {
    return this.repository.deleteProjectFeature(id);
  }

  async getProjectBugs(projectId: string, status?: BugStatus): Promise<ProjectBug[]> {
    return this.repository.getProjectBugs(projectId, status);
  }

  async saveProjectBug(bug: Partial<ProjectBug>): Promise<ProjectBug> {
    return this.repository.saveProjectBug(bug);
  }

  async resolveProjectBug(id: string, resolution: string): Promise<void> {
    await this.repository.resolveProjectBug(id, resolution);
    try {
      await gamificationService.awardDirectReward(
        'BONUS_REWARD',
        `bug_fixed_${id}`,
        15,
        5,
        '🐞 Squashed and resolved project bug'
      );
    } catch {}
  }

  async deleteProjectBug(id: string): Promise<void> {
    return this.repository.deleteProjectBug(id);
  }

  async getProjectTestCases(projectId: string): Promise<ProjectTestCase[]> {
    return this.repository.getProjectTestCases(projectId);
  }

  async saveProjectTestCase(testCase: Partial<ProjectTestCase>): Promise<ProjectTestCase> {
    return this.repository.saveProjectTestCase(testCase);
  }

  async updateTestCaseStatus(
    id: string,
    status: TestCaseStatus,
    actualOutput?: string
  ): Promise<void> {
    await this.repository.updateTestCaseStatus(id, status, actualOutput);
    if (status === 'PASSED') {
      try {
        await gamificationService.awardDirectReward(
          'PRACTICE_CORRECT',
          `test_passed_${id}`,
          5,
          2,
          'Passed project test case verification'
        );
      } catch {}
    }
  }

  async deleteProjectTestCase(id: string): Promise<void> {
    return this.repository.deleteProjectTestCase(id);
  }

  async getProjectDocumentation(projectId: string): Promise<ProjectDocumentation | null> {
    return this.repository.getProjectDocumentation(projectId);
  }

  async saveProjectDocumentation(
    projectId: string,
    doc: Partial<ProjectDocumentation>
  ): Promise<ProjectDocumentation> {
    return this.repository.saveProjectDocumentation(projectId, doc);
  }

  async getPortfolioProjects(): Promise<UserProject[]> {
    return this.repository.getPortfolioProjects();
  }

  async updatePortfolioItem(
    projectId: string,
    isPinned: boolean,
    isHidden: boolean,
    order?: number,
    description?: string
  ): Promise<void> {
    return this.repository.updatePortfolioItem(projectId, isPinned, isHidden, order, description);
  }

  async getPortfolioProfile(): Promise<PortfolioProfile> {
    return this.repository.getPortfolioProfile();
  }

  async savePortfolioProfile(profile: Partial<PortfolioProfile>): Promise<PortfolioProfile> {
    return this.repository.savePortfolioProfile(profile);
  }

  async exportPortfolioMarkdown(): Promise<string> {
    return this.repository.exportPortfolioMarkdown();
  }

  async exportPortfolioJSON(): Promise<string> {
    const profile = await this.getPortfolioProfile();
    const projects = await this.getPortfolioProjects();
    return JSON.stringify({ profile, projects }, null, 2);
  }

  async getProjectDashboardStats(): Promise<ProjectDashboardStats> {
    return this.repository.getProjectDashboardStats();
  }

  async getProjectHealth(projectId: string): Promise<ProjectHealthStatus> {
    return this.repository.getProjectHealth(projectId);
  }

  // =========================================================================
  // 2. AI PROJECT ASSISTANT (MULTIPLE SOLUTIONS & SAFETY)
  // =========================================================================

  /**
   * Sanitizes input strings by masking API keys, JWT tokens, and private passwords.
   */
  sanitizeUserInput(input: string): string {
    return input
      .replace(/(?:api_key|apikey|secret|password|token)\s*[:=]\s*['"][^\s'"]+['"]/gi, '[SECRET MASKED]')
      .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[JWT TOKEN MASKED]');
  }

  /**
   * Generates multiple implementation approaches with architectural trade-offs.
   */
  suggestArchitecturalApproaches(topic: string, projectContext: string): AIProjectAdvice {
    const safeTopic = this.sanitizeUserInput(topic);
    const safeContext = this.sanitizeUserInput(projectContext);

    return {
      simpleApproach: {
        title: 'Synchronous / In-Memory State Model',
        codeSnippet: `// Simple direct update pattern\nconst handleAction = async (data) => {\n  const result = await directServiceCall(data);\n  updateLocalState(result);\n};`,
        explanation: 'Directly executes operations within the active request context, storing state in local memory or direct SQLite table writes.',
        pros: ['Minimal code complexity', 'Zero external background dependencies', 'Easy to test and reason about'],
        cons: ['Blocks thread on long operations', 'May not scale for batch processing'],
      },
      alternativeApproach: {
        title: 'Decoupled / Asynchronous Queue Model',
        codeSnippet: `// Asynchronous event pattern\nconst handleAction = (payload) => {\n  queue.dispatch({ type: 'ASYNC_JOB', payload });\n  return { status: 'QUEUED' };\n};`,
        explanation: 'Enqueues events into a message log or background worker, processing operations asynchronously and updating persistent state via listeners.',
        pros: ['Non-blocking UI experience', 'High resilience to unexpected spikes', 'Clear separation of concern'],
        cons: ['Requires state synchronization mechanisms', 'Slightly higher architectural overhead'],
      },
      tradeOffAnalysis:
        `For ${safeTopic || 'this feature'} in "${safeContext || 'your project'}", begin with the Simple Approach until profiling proves a bottleneck, then migrate to the Decoupled Model.`,
      potentialEdgeCases: [
        'Network timeouts or database locks during concurrent writes',
        'State divergence if optimistic updates fail',
        'Input sanitization to prevent injection vulnerabilities',
      ],
    };
  }

  /**
   * Generates a comprehensive README draft using real project data.
   * User approval is strictly required before saving to documentation.
   */
  async generateProjectReadme(projectId: string): Promise<{ markdown: string; title: string }> {
    const proj = await this.getUserProjectById(projectId);
    if (!proj) throw new Error('Project not found');

    const [doc, features, tests] = await Promise.all([
      this.getProjectDocumentation(projectId),
      this.getProjectFeatures(projectId),
      this.getProjectTestCases(projectId),
    ]);

    const techs = proj.technologies && proj.technologies.length > 0 ? proj.technologies.join(', ') : 'Python, SQLite';
    const completedFeatures = features.filter((f) => f.status === 'COMPLETED').map((f) => f.title);
    const plannedFeatures = features.filter((f) => f.status !== 'COMPLETED').map((f) => f.title);

    let md = `# ${proj.name}\n\n`;
    md += `> ${proj.description}\n\n`;
    md += `[![Status](https://img.shields.io/badge/Status-${proj.status}-blue.svg)]() `;
    md += `[![Difficulty](https://img.shields.io/badge/Level-${proj.difficulty}-green.svg)]()\n\n`;

    md += `## 📌 Problem & Purpose\n`;
    md += `${doc?.problem || proj.problem_statement || 'Solves key workflow inefficiencies with robust local data persistence and algorithmic design.'}\n\n`;

    md += `## 🛠️ Tech Stack & Dependencies\n`;
    md += `- **Primary Technologies**: ${techs}\n`;
    md += `- **Data Persistence**: Local Relational SQLite Database\n`;
    md += `- **Target Runtime**: Cross-Platform Mobile & Python Backend\n\n`;

    md += `## ✨ Key Implemented Features\n`;
    if (completedFeatures.length > 0) {
      for (const f of completedFeatures) {
        md += `- [x] ${f}\n`;
      }
    } else {
      md += `- [x] Modular architecture and core data model definitions\n`;
      md += `- [x] Responsive user workflows and state management\n`;
    }

    if (plannedFeatures.length > 0) {
      md += `\n### Roadmap & Upcoming Enhancements\n`;
      for (const pf of plannedFeatures) {
        md += `- [ ] ${pf}\n`;
      }
    }

    md += `\n## 🏛️ Architecture & Database Decisions\n`;
    md += `${doc?.architecture || 'Designed with strict separation between business service facades, SQLite persistence repositories, and declarative UI components.'}\n\n`;

    md += `## 🧪 Verification & Testing (${tests.length} Recorded Tests)\n`;
    const passedTests = tests.filter((t) => t.status === 'PASSED');
    md += `- **Passed Test Cases**: ${passedTests.length} / ${tests.length}\n`;
    if (passedTests.length > 0) {
      for (const t of passedTests.slice(0, 3)) {
        md += `  - ✓ ${t.title}\n`;
      }
    }

    if (proj.github_url || proj.live_url) {
      md += `\n## 🔗 Repository & Live Deployment\n`;
      if (proj.github_url) md += `- **Source Code**: [${proj.github_url}](${proj.github_url})\n`;
      if (proj.live_url) md += `- **Live Demo**: [${proj.live_url}](${proj.live_url})\n`;
    }

    md += `\n## 👤 Author\n`;
    md += `Built by **Pavan** as part of the Comprehensive Software Engineering & Placement Journey.\n`;

    return { markdown: md, title: proj.name };
  }

  // =========================================================================
  // 3. NOTIFICATION & REMINDER INTEGRATION
  // =========================================================================

  async scheduleProjectReminder(projectId: string, projectTitle: string, timeStr: string = '17:30'): Promise<boolean> {
    try {
      const res = await notificationService.scheduleDailyStudyReminder(
        `proj_rem_${projectId}`,
        timeStr,
        15
      );
      return res !== null;
    } catch {
      return false;
    }
  }

  async completeProject(id: string, notes?: string): Promise<UserProject> {
    return this.completeUserProject(id, notes);
  }

  async completeFeature(featureId: string): Promise<void> {
    await this.updateFeatureStatus(featureId, 'COMPLETED');
  }

  async resolveBug(bugId: string, notes: string = 'Fixed and verified'): Promise<void> {
    await this.resolveProjectBug(bugId, notes);
  }

  async updateMilestoneStatus(id: string, status: any): Promise<ProjectMilestone> {
    return this.repository.saveMilestone({ id, status });
  }
}

export const projectService = ProjectService.getInstance();
