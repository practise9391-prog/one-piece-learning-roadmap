import { dbManager } from '../database/DatabaseManager';
import {
  CareerGoalSummary,
  CareerPillarProgress,
  CareerStage,
  TodayMissionTask,
} from '../models/CareerGoal';
import { activityRepository } from '../repositories/ActivityRepository';

export class CareerGoalService {
  /**
   * Aggregates real SQLite progress data across courses, topics, practice tasks,
   * and streaks to construct the comprehensive ₹30 LPA Career Goal summary.
   */
  async getCareerGoalSummary(): Promise<CareerGoalSummary> {
    const db = await dbManager.getDatabase();

    // 1. Fetch course progress
    const courses = await db.getAllAsync<{
      id: string;
      name: string;
      is_completed: number;
      progress_percentage: number;
      completed_modules: number;
      total_modules: number;
    }>('SELECT id, name, is_completed, progress_percentage, completed_modules, total_modules FROM courses;');

    const courseMap = new Map<string, { pct: number; comp: number; tot: number }>();
    for (const c of courses) {
      courseMap.set(c.id, {
        pct: c.progress_percentage || 0,
        comp: c.completed_modules || 0,
        tot: c.total_modules || 1,
      });
    }

    // Helper to get average percentage across course IDs
    const getAvgPct = (ids: string[]) => {
      let sum = 0;
      let count = 0;
      for (const id of ids) {
        const c = courseMap.get(id);
        if (c) {
          sum += c.pct;
          count++;
        }
      }
      return count > 0 ? Math.round(sum / count) : 0;
    };

    // 2. Fetch solved practice tasks count
    let solvedTasksCount = 0;
    try {
      const taskRes = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM practice_tasks WHERE is_completed = 1 OR status = 'SOLVED';"
      );
      solvedTasksCount = taskRes?.count || 0;
    } catch {
      // Table may be empty
    }

    // 3. Fetch completed topics count
    let completedTopicsCount = 0;
    let totalTopicsCount = 0;
    try {
      const topRes = await db.getFirstAsync<{ comp: number; tot: number }>(
        'SELECT SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as comp, COUNT(*) as tot FROM topics;'
      );
      completedTopicsCount = topRes?.comp || 0;
      totalTopicsCount = topRes?.tot || 1;
    } catch {
      // ignore
    }

    // 4. Streak & Activity metrics
    const streakMetrics = await activityRepository.getStreakMetrics();

    // 5. Construct 6 Normalized Pillars
    const dsaPct = Math.min(100, Math.max(getAvgPct(['algorithms', 'dsa']), Math.round((solvedTasksCount / 30) * 100)));
    const devPct = getAvgPct(['react', 'python', 'javascript', 'django']);
    const sysDesignPct = getAvgPct(['system_design']);
    const corePct = getAvgPct(['sql', 'linux', 'git']);
    const prepPct = Math.min(100, Math.round((completedTopicsCount / Math.max(totalTopicsCount, 50)) * 100));
    const projectPct = Math.min(100, Math.round((devPct * 0.7 + sysDesignPct * 0.3)));

    const pillars: CareerPillarProgress[] = [
      {
        id: 'dsa',
        name: 'Algorithms & Problem Solving',
        weight: 30,
        completedUnits: solvedTasksCount,
        totalUnits: 150,
        percentage: dsaPct,
        color: '#6366F1',
        icon: 'code-slash',
      },
      {
        id: 'frontend_backend',
        name: 'Full Stack & React Engineering',
        weight: 20,
        completedUnits: Math.round((devPct / 100) * 80),
        totalUnits: 80,
        percentage: devPct,
        color: '#0284C7',
        icon: 'layers',
      },
      {
        id: 'system_design',
        name: 'Distributed Systems & Scale',
        weight: 15,
        completedUnits: Math.round((sysDesignPct / 100) * 30),
        totalUnits: 30,
        percentage: sysDesignPct,
        color: '#8B5CF6',
        icon: 'git-network',
      },
      {
        id: 'core_cs',
        name: 'CS Core (SQL, Linux, Git)',
        weight: 15,
        completedUnits: Math.round((corePct / 100) * 50),
        totalUnits: 50,
        percentage: corePct,
        color: '#10B981',
        icon: 'terminal',
      },
      {
        id: 'interview_quiz',
        name: 'Technical & Interview Mastery',
        weight: 10,
        completedUnits: Math.round((prepPct / 100) * 60),
        totalUnits: 60,
        percentage: prepPct,
        color: '#F59E0B',
        icon: 'bulb',
      },
      {
        id: 'projects',
        name: 'Production Capstone Projects',
        weight: 10,
        completedUnits: Math.round((projectPct / 100) * 10),
        totalUnits: 10,
        percentage: projectPct,
        color: '#EC4899',
        icon: 'rocket',
      },
    ];

    // 6. Overall Readiness Calculation
    const weightedSum = pillars.reduce(
      (acc, p) => acc + (p.percentage * p.weight) / 100,
      0
    );
    const overallReadinessPercentage = Math.round(weightedSum);

    // 7. Define the 9 Career Stages
    const stagesDef = [
      {
        stageNumber: 1,
        title: 'Engineering Foundations',
        subtitle: 'Linux, Git, Terminal & Python Basics',
        description: 'Master CLI environment, version control workflows, and core programming paradigms.',
        targetRole: 'Junior Developer Trainee',
        requiredSkills: ['Linux Shell', 'Git Workflows', 'Clean Code Basics'],
        courseIds: ['linux', 'git', 'python'],
      },
      {
        stageNumber: 2,
        title: 'Core Data Structures',
        subtitle: 'Arrays, Strings, Recursion & Two Pointers',
        description: 'Build algorithmic intuition with linear structures and space-time complexity analysis.',
        targetRole: 'Associate Software Engineer',
        requiredSkills: ['Big-O Analysis', 'Array Two-Pointers', 'Sliding Window', 'Recursion'],
        courseIds: ['algorithms', 'dsa'],
      },
      {
        stageNumber: 3,
        title: 'Modern Frontend & React Architecture',
        subtitle: 'Component Lifecycle, Hooks, State & Responsive UI',
        description: 'Architect performant mobile and web interfaces with clean reactivity and rendering.',
        targetRole: 'Frontend Engineer',
        requiredSkills: ['React Hooks', 'State Management', 'Component Architecture', 'DOM & Events'],
        courseIds: ['react', 'javascript'],
      },
      {
        stageNumber: 4,
        title: 'Backend Systems & Database Design',
        subtitle: 'PostgreSQL, Relational Modeling & API Architecture',
        description: 'Design robust schemas, indexing, transactions, and REST/GraphQL microservices.',
        targetRole: 'Full Stack Engineer',
        requiredSkills: ['SQL Normalization', 'Indexing', 'Query Optimization', 'API Architecture'],
        courseIds: ['sql', 'django'],
      },
      {
        stageNumber: 5,
        title: 'Advanced Algorithms & Visual Lab',
        subtitle: 'Dynamic Programming, Trees, Graphs & Backtracking',
        description: 'Solve complex competitive programming problems with visual execution traces.',
        targetRole: 'Software Engineer II',
        requiredSkills: ['DP State Machines', 'Graph Traversals', 'Tree Transformations', 'Greedy Choices'],
        courseIds: ['algorithms'],
      },
      {
        stageNumber: 6,
        title: 'Distributed System Design at Scale',
        subtitle: 'Microservices, Caching, Load Balancing & Partitioning',
        description: 'Design resilient systems processing 100k+ QPS with high availability and fault tolerance.',
        targetRole: 'Senior Software Engineer',
        requiredSkills: ['CAP Theorem', 'Distributed Cache', 'Event Streaming', 'DB Sharding'],
        courseIds: ['system_design'],
      },
      {
        stageNumber: 7,
        title: 'Production Capstone Projects',
        subtitle: 'End-to-End Enterprise Architecture Implementation',
        description: 'Deliver production-grade applications with CI/CD, testing, telemetry, and observability.',
        targetRole: 'Lead / Full-Cycle Engineer',
        requiredSkills: ['Docker/K8s', 'Testing Suites', 'Performance Profiling', 'Security'],
        courseIds: ['react', 'django', 'system_design'],
      },
      {
        stageNumber: 8,
        title: 'FAANG & Top Product Mock Drills',
        subtitle: 'Live Whiteboard, System Design & Behavioral Rounds',
        description: 'Simulate high-pressure technical interviews with instant AI feedback and rubrics.',
        targetRole: '₹30 LPA Candidate Finalist',
        requiredSkills: ['Live Problem Solving', 'Trade-off Articulation', 'STAR Behavioral', 'Leadership Principles'],
        courseIds: ['algorithms', 'system_design'],
      },
      {
        stageNumber: 9,
        title: 'Career Offer & ₹30 LPA Senior Engineer',
        subtitle: 'Portfolio Review, Salary Negotiation & Placement',
        description: 'Review elite candidate portfolio, interview performance, and command top compensation.',
        targetRole: 'Senior Software Engineer (₹30 LPA+)',
        requiredSkills: ['Executive Presence', 'System Vision', 'Offer Negotiation', 'Team Mentorship'],
        courseIds: ['system_design', 'algorithms', 'react'],
      },
    ];

    let currentStageIndex = 0;
    const stages: CareerStage[] = stagesDef.map((st, idx) => {
      const avgStagePct = getAvgPct(st.courseIds);
      const isCompleted = avgStagePct >= 80;
      const isUnlocked = idx === 0 || stagesDef[idx - 1] ? getAvgPct(stagesDef[idx - 1].courseIds) >= 40 : true;

      return {
        stageNumber: st.stageNumber,
        title: st.title,
        subtitle: st.subtitle,
        description: st.description,
        targetRole: st.targetRole,
        requiredSkills: st.requiredSkills,
        courseIds: st.courseIds,
        isUnlocked,
        isCurrent: false,
        isCompleted,
        completionPercentage: avgStagePct,
      };
    });

    // Mark current active stage
    for (let i = 0; i < stages.length; i++) {
      if (!stages[i].isCompleted && stages[i].isUnlocked) {
        currentStageIndex = i;
        stages[i].isCurrent = true;
        break;
      }
    }
    if (!stages.some((s) => s.isCurrent)) {
      stages[stages.length - 1].isCurrent = true;
      currentStageIndex = stages.length - 1;
    }

    // 8. Generate dynamic Today's Missions
    const todayMissions: TodayMissionTask[] = [
      {
        id: 'mission_dsa_1',
        title: 'Master Two-Pointer & Sliding Window Drill',
        category: 'DSA',
        targetScreen: 'InteractiveTopic',
        params: { courseId: 'algorithms', moduleId: 'mod_algo_p31_02' },
        estimatedMinutes: 20,
        xpReward: 35,
        isCompleted: false,
      },
      {
        id: 'mission_sys_2',
        title: 'Architect Rate Limiting & Token Bucket System',
        category: 'SYSTEM_DESIGN',
        targetScreen: 'InteractiveTopic',
        params: { courseId: 'system_design', moduleId: 'mod_sys_02' },
        estimatedMinutes: 25,
        xpReward: 40,
        isCompleted: false,
      },
      {
        id: 'mission_code_3',
        title: 'Interactive Code Execution & Visual Trace Debug',
        category: 'DSA',
        targetScreen: 'CodeWorkspace',
        params: {
          title: 'Two Sum Optimal Hash Map',
          language: 'python',
          code: 'def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in lookup:\n            return [lookup[complement], i]\n        lookup[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))\n',
          mode: 'PRACTICE',
          courseId: 'algorithms',
        },
        estimatedMinutes: 15,
        xpReward: 30,
        isCompleted: false,
      },
      {
        id: 'mission_quiz_4',
        title: '1-Minute Lightning Active Recall Quiz',
        category: 'QUIZ',
        targetScreen: 'CourseRoadmap',
        params: { courseId: 'react' },
        estimatedMinutes: 5,
        xpReward: 15,
        isCompleted: false,
      },
    ];

    return {
      targetRole: 'Senior Software Engineer / Tech Lead',
      targetCompensation: '₹30 LPA+ ($120k+)',
      targetDaysRemaining: 90,
      overallReadinessPercentage,
      currentStageNumber: stages[currentStageIndex]?.stageNumber || 1,
      totalStages: stages.length,
      pillars,
      stages,
      todayMissions,
      streakDays: streakMetrics.currentStreak,
      totalXp: (completedTopicsCount * 25) + (solvedTasksCount * 30),
      solvedProblemsCount: solvedTasksCount,
      completedTopicsCount,
    };
  }
}

export const careerGoalService = new CareerGoalService();

