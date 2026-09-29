import {
  NotificationDecisionResult,
  NotificationPreferences,
  NotificationType,
} from '../models/Notification';
import { StudyPlan, StudyPlanItem } from '../models/StudyPlan';

export interface DecisionEngineInputs {
  studyPlan: StudyPlan | null;
  completedMinutesToday: number;
  activeStreakDays: number;
  weeklyData?: {
    completedMinutes: number;
    plannedMinutes: number;
    remainingTopics: number;
  };
  monthlyData?: {
    completedMinutes: number;
    plannedMinutes: number;
    percentage: number;
  };
  preferences: NotificationPreferences;
  isAlarm?: boolean;
}

export class NotificationDecisionEngine {
  /**
   * Evaluates current learning progress, daily plan, and settings to generate
   * dynamic, contextual study reminder notifications.
   */
  static evaluateStudyReminder(inputs: DecisionEngineInputs): NotificationDecisionResult {
    const { studyPlan, completedMinutesToday, preferences, isAlarm } = inputs;

    // 1. Rest Day Check
    if (studyPlan && studyPlan.isRestDay) {
      return {
        type: 'DAILY_STUDY_REMINDER',
        title: '🌴 Rest & Recharge Day',
        message: 'Today is charted as a rest day on your voyage. Rest well and recharge for your upcoming learning adventure!',
        targetScreen: 'StudyPlan',
        channelId: isAlarm ? 'study_alarm' : 'study_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
        isAlarm,
      };
    }

    // 2. No Plan Created Yet Check
    if (!studyPlan || !studyPlan.items || studyPlan.items.length === 0) {
      return {
        type: 'DAILY_STUDY_REMINDER',
        title: '🧭 Chart Your Voyage Today',
        message: "You don't have a study plan for today yet. Chart your daily missions and begin your learning voyage!",
        targetScreen: 'StudyPlan',
        channelId: isAlarm ? 'study_alarm' : 'study_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
        isAlarm,
      };
    }

    // 3. Goal Already Completed Check
    const plannedMin = studyPlan.plannedMinutes || 120;
    const isGoalReached = completedMinutesToday >= plannedMin && plannedMin > 0;
    const unfinishedItems = studyPlan.items.filter(
      (item) => item.status !== 'COMPLETED' && item.status !== 'SKIPPED'
    );

    if (isGoalReached && unfinishedItems.length === 0) {
      return {
        type: 'GOAL_COMPLETED',
        title: "🎉 Today's Study Goal Complete!",
        message: `Outstanding voyage! You have conquered all your planned topics and reached ${completedMinutesToday} minutes today.`,
        targetScreen: 'StudyPlan',
        channelId: 'goal_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
        isAlarm: false,
      };
    }

    // 4. Find Next Unfinished Topic (Skip completed & skipped topics)
    const nextItem: StudyPlanItem | undefined = unfinishedItems[0];

    const courseTitle = nextItem?.courseName || 'Learning Session';
    const topicTitle = nextItem?.topicTitle || 'Planned Topic';
    const courseId = nextItem?.courseId;
    const moduleId = nextItem?.moduleId;
    const topicId = nextItem?.topicId;

    if (isAlarm) {
      return {
        type: 'STUDY_ALARM',
        title: '⏰ STUDY ALARM: Time to Focus!',
        message: `Your focused study session begins now! Next mission: ${courseTitle} → ${topicTitle}.`,
        courseId,
        moduleId,
        topicId,
        targetScreen: topicId ? 'ModuleDetails' : 'StudyPlan',
        channelId: 'study_alarm',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
        isAlarm: true,
      };
    }

    // 5. In-progress vs. Not started variations
    if (completedMinutesToday === 0) {
      return {
        type: 'DAILY_STUDY_REMINDER',
        title: "📚 It's Study Time!",
        message: `Your learning journey is waiting. Next mission: ${courseTitle} → ${topicTitle}. Let's begin!`,
        courseId,
        moduleId,
        topicId,
        targetScreen: topicId ? 'ModuleDetails' : 'StudyPlan',
        channelId: 'study_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
        isAlarm: false,
      };
    }

    const remainingMinutes = Math.max(0, plannedMin - completedMinutesToday);

    if (remainingMinutes <= 15 && remainingMinutes > 0) {
      return {
        type: 'DAILY_STUDY_REMINDER',
        title: '⚡ Almost at the Finish Line!',
        message: `Just ${remainingMinutes} minutes left to complete today's goal! Next up: ${topicTitle}.`,
        courseId,
        moduleId,
        topicId,
        targetScreen: topicId ? 'ModuleDetails' : 'StudyPlan',
        channelId: 'study_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
        isAlarm: false,
      };
    }

    return {
      type: 'DAILY_STUDY_REMINDER',
      title: '🧭 Keep Up the Momentum!',
      message: `You're already ${completedMinutesToday} min into today's goal (${remainingMinutes} min remaining). Next: ${courseTitle} → ${topicTitle}.`,
      courseId,
      moduleId,
      topicId,
      targetScreen: topicId ? 'ModuleDetails' : 'StudyPlan',
      channelId: 'study_reminders',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
      isAlarm: false,
    };
  }

  /**
   * Advance reminder calculation (e.g. 5, 10, 15, 30 min before planned start).
   */
  static evaluateAdvanceReminder(
    inputs: DecisionEngineInputs,
    advanceMinutes: number
  ): NotificationDecisionResult {
    const { studyPlan, preferences } = inputs;
    const unfinishedItems = (studyPlan?.items || []).filter(
      (item) => item.status !== 'COMPLETED' && item.status !== 'SKIPPED'
    );
    const nextItem = unfinishedItems[0];
    const topicTitle = nextItem?.topicTitle || 'your planned lesson';
    const duration = nextItem?.plannedMinutes || 30;

    return {
      type: 'STUDY_START_REMINDER',
      title: `⏰ Study Session in ${advanceMinutes} Minutes`,
      message: `Prepare your deck! Your next session on ${topicTitle} (${duration}m) starts in ${advanceMinutes} minutes.`,
      courseId: nextItem?.courseId,
      moduleId: nextItem?.moduleId,
      topicId: nextItem?.topicId,
      targetScreen: nextItem?.topicId ? 'ModuleDetails' : 'StudyPlan',
      channelId: 'study_reminders',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
    };
  }

  /**
   * Morning plan briefing decision.
   */
  static evaluateMorningPlan(inputs: DecisionEngineInputs): NotificationDecisionResult | null {
    const { studyPlan, preferences } = inputs;
    if (!studyPlan || !studyPlan.items || studyPlan.items.length === 0) {
      return {
        type: 'MORNING_PLAN_REMINDER',
        title: 'Good morning, Voyager! 🌅',
        message: "You have no study missions planned for today yet. Open the Study Plan and set today's targets!",
        targetScreen: 'StudyPlan',
        channelId: 'study_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
      };
    }

    if (studyPlan.isRestDay) {
      return {
        type: 'MORNING_PLAN_REMINDER',
        title: 'Good morning, Voyager! 🌅',
        message: 'Today is your designated rest day. Rest up and recharge your spirit!',
        targetScreen: 'StudyPlan',
        channelId: 'study_reminders',
        soundEnabled: preferences.sound_enabled,
        vibrationEnabled: preferences.vibration_enabled,
      };
    }

    // Group duration by course
    const courseMap: Record<string, number> = {};
    for (const item of (studyPlan.items || [])) {
      const name = item.courseName || 'Course';
      courseMap[name] = (courseMap[name] || 0) + item.plannedMinutes;
    }

    const lines = Object.entries(courseMap)
      .slice(0, 3)
      .map(([name, min]) => `${name} — ${min}m`)
      .join(', ');

    const totalHours = (studyPlan.plannedMinutes / 60).toFixed(1).replace('.0', '');

    return {
      type: 'MORNING_PLAN_REMINDER',
      title: 'Good morning, Voyager! 🌅',
      message: `Today's plan: ${lines}. Total: ${totalHours}h planned. Let's make today count!`,
      targetScreen: 'StudyPlan',
      channelId: 'study_reminders',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
    };
  }

  /**
   * Evening unfinished topics reminder decision.
   */
  static evaluateEveningUnfinished(inputs: DecisionEngineInputs): NotificationDecisionResult | null {
    const { studyPlan, completedMinutesToday, preferences } = inputs;
    if (!studyPlan || studyPlan.isRestDay || !studyPlan.items) return null;

    const unfinished = studyPlan.items.filter(
      (item) => item.status !== 'COMPLETED' && item.status !== 'SKIPPED'
    );

    if (unfinished.length === 0) {
      return null; // All done! No need to bother the user
    }

    const remainingMin = Math.max(0, studyPlan.plannedMinutes - completedMinutesToday);
    const topRemaining = unfinished
      .slice(0, 2)
      .map((item) => `${item.courseName || 'Course'} → ${item.topicTitle || 'Topic'}`)
      .join(', ');

    return {
      type: 'EVENING_UNFINISHED_REMINDER',
      title: "⚓ Your Study Day Isn't Finished Yet",
      message: `Remaining missions: ${topRemaining}. You still have ${remainingMin > 0 ? remainingMin : unfinished.length * 20}m planned.`,
      targetScreen: 'StudyPlan',
      channelId: 'study_reminders',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
    };
  }

  /**
   * Streak protection reminder decision.
   */
  static evaluateStreakProtection(inputs: DecisionEngineInputs): NotificationDecisionResult | null {
    const { activeStreakDays, completedMinutesToday, preferences } = inputs;
    // Only remind if there is a streak to protect and 0 minutes studied today
    if (activeStreakDays <= 0 || completedMinutesToday > 0) {
      return null;
    }

    return {
      type: 'STREAK_REMINDER',
      title: '🔥 Protect Your Learning Streak!',
      message: `Your ${activeStreakDays}-day streak is on the line! Complete a quick study session today to keep your fire burning.`,
      targetScreen: 'StudyPlan',
      channelId: 'study_reminders',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
    };
  }

  /**
   * Weekly summary reminder decision.
   */
  static evaluateWeeklySummary(inputs: DecisionEngineInputs): NotificationDecisionResult {
    const { weeklyData, preferences } = inputs;
    const completedMin = weeklyData?.completedMinutes || 0;
    const plannedMin = weeklyData?.plannedMinutes || 1;
    const remainingTopics = weeklyData?.remainingTopics ?? 0;

    const completedHours = (completedMin / 60).toFixed(1).replace('.0', '');
    const plannedHours = (plannedMin / 60).toFixed(1).replace('.0', '');
    const percent = Math.min(100, Math.round((completedMin / Math.max(1, plannedMin)) * 100));

    return {
      type: 'WEEKLY_SUMMARY',
      title: '📅 Weekly Learning Check',
      message: `This week: ${completedHours}h completed of ${plannedHours}h planned (${percent}%). ${remainingTopics} topic${remainingTopics === 1 ? '' : 's'} remaining.`,
      targetScreen: 'StudyPlan',
      channelId: 'weekly_monthly_summary',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
    };
  }

  /**
   * Monthly summary reminder decision.
   */
  static evaluateMonthlySummary(inputs: DecisionEngineInputs): NotificationDecisionResult {
    const { monthlyData, preferences } = inputs;
    const completedMin = monthlyData?.completedMinutes || 0;
    const plannedMin = monthlyData?.plannedMinutes || 1;
    const completedHours = (completedMin / 60).toFixed(1).replace('.0', '');
    const plannedHours = (plannedMin / 60).toFixed(1).replace('.0', '');
    const percent = monthlyData?.percentage ?? Math.min(100, Math.round((completedMin / Math.max(1, plannedMin)) * 100));

    return {
      type: 'MONTHLY_SUMMARY',
      title: '📊 Monthly Learning Progress',
      message: `${completedHours} hours completed of ${plannedHours} hours planned (${percent}%). Keep moving toward your monthly goal!`,
      targetScreen: 'StudyPlan',
      channelId: 'weekly_monthly_summary',
      soundEnabled: preferences.sound_enabled,
      vibrationEnabled: preferences.vibration_enabled,
    };
  }
}
