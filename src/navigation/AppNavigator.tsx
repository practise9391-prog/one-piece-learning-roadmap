import { PageTransitionWrapper } from '../components/common/PageTransitionWrapper';
import React from 'react';
import { useAppNavigation } from './NavigationContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailsScreen } from '../screens/CourseDetailsScreen';
import { ModuleDetailsScreen } from '../screens/ModuleDetailsScreen';
import { CourseCompletionScreen } from '../screens/CourseCompletionScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { CompletedScreen } from '../screens/CompletedScreen';
import { RemainingScreen } from '../screens/RemainingScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileSettingsScreen } from '../screens/settings/ProfileSettingsScreen';
import { LearningPreferencesScreen } from '../screens/settings/LearningPreferencesScreen';
import { DailyGoalSettingsScreen } from '../screens/settings/DailyGoalSettingsScreen';
import { PracticeSettingsScreen } from '../screens/settings/PracticeSettingsScreen';
import { NewsSettingsScreen } from '../screens/settings/NewsSettingsScreen';
import { MotivationSettingsScreen } from '../screens/settings/MotivationSettingsScreen';
import { AppearanceSettingsScreen } from '../screens/settings/AppearanceSettingsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { DataManagementScreen } from '../screens/settings/DataManagementScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';
import { PracticeHomeScreen } from '../screens/practice/PracticeHomeScreen';
import { PracticeCategoryScreen } from '../screens/practice/PracticeCategoryScreen';
import { PracticeQuestionScreen } from '../screens/practice/PracticeQuestionScreen';
import { NewsHomeScreen } from '../screens/news/NewsHomeScreen';
import { NewsArticleScreen } from '../screens/news/NewsArticleScreen';
import { MotivationHomeScreen } from '../screens/motivation/MotivationHomeScreen';
import { DailyLearningScreen } from '../screens/motivation/DailyLearningScreen';
import { AchievementsScreen } from '../screens/motivation/AchievementsScreen';
import { FocusScreen } from '../screens/focus/FocusScreen';
import { FocusHistoryScreen } from '../screens/focus/FocusHistoryScreen';
import { FocusSettingsScreen } from '../screens/settings/FocusSettingsScreen';
import { TopicSearchScreen } from '../screens/search/TopicSearchScreen';
import { DatabaseTestScreen } from '../screens/DatabaseTestScreen';
import { StudyPlanScreen } from '../screens/studyPlan/StudyPlanScreen';
import { ProgressDashboardScreen } from '../screens/progress/ProgressDashboardScreen';
import { CourseDetailAnalyticsScreen } from '../screens/progress/CourseDetailAnalyticsScreen';
import { RewardsDashboardScreen } from '../screens/gamification/RewardsDashboardScreen';
import { CodingProblemScreen } from '../screens/practice/CodingProblemScreen';
import { AITutorHomeScreen } from '../screens/ai/AITutorHomeScreen';
import { AIChatScreen } from '../screens/ai/AIChatScreen';
import { AISpeakingScreen } from '../screens/ai/AISpeakingScreen';
import { AIInterviewScreen } from '../screens/ai/AIInterviewScreen';
import { AIDataSettingsScreen } from '../screens/settings/AIDataSettingsScreen';
import { InteractiveTopicScreen } from '../screens/learning/InteractiveTopicScreen';

export const AppNavigator: React.FC = () => {
  const { currentScreen } = useAppNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
    case 'Courses':
      return <CoursesScreen />;

    case 'CourseRoadmap':
      return <CourseDetailsScreen />;

    case 'CourseCompletion':
      return <CourseCompletionScreen />;

    case 'ModuleDetails':
      return <ModuleDetailsScreen />;

    case 'Notes':
      return <NotesScreen />;

    case 'Completed':
      return <CompletedScreen />;

    case 'Remaining':
      return <RemainingScreen />;

    case 'Statistics':
      return <StatisticsScreen />;

    case 'Settings':
      return <SettingsScreen />;

    case 'ProfileSettings':
      return <ProfileSettingsScreen />;

    case 'LearningPreferences':
      return <LearningPreferencesScreen />;

    case 'DailyGoalSettings':
      return <DailyGoalSettingsScreen />;

    case 'PracticeSettings':
      return <PracticeSettingsScreen />;

    case 'NewsSettings':
      return <NewsSettingsScreen />;

    case 'MotivationSettings':
      return <MotivationSettingsScreen />;

    case 'AppearanceSettings':
      return <AppearanceSettingsScreen />;

    case 'NotificationSettings':
      return <NotificationSettingsScreen />;

    case 'DataManagement':
      return <DataManagementScreen />;

    case 'About':
      return <AboutScreen />;

    case 'PracticeLinks':
      return <PracticeHomeScreen />;

    case 'PracticeCategory':
      return <PracticeCategoryScreen />;

    case 'PracticeQuestion':
      return <PracticeQuestionScreen />;

    case 'News':
      return <NewsHomeScreen />;

    case 'NewsArticle':
      return <NewsArticleScreen />;

    case 'Motivation':
      return <MotivationHomeScreen />;

    case 'DailyLearning':
      return <DailyLearningScreen />;

    case 'Achievements':
      return <AchievementsScreen />;

    case 'FocusMode':
      return <FocusScreen />;

    case 'FocusHistory':
      return <FocusHistoryScreen />;

    case 'FocusSettings':
      return <FocusSettingsScreen />;

    case 'TopicSearch':
      return <TopicSearchScreen />;

    case 'StudyPlan':
      return <StudyPlanScreen />;

    case 'DatabaseTest':
      return <DatabaseTestScreen />;

    case 'Progress':
      return <ProgressDashboardScreen />;

    case 'CourseDetailAnalytics':
    case 'CourseProgressDetail':
      return <CourseDetailAnalyticsScreen />;

    case 'Rewards':
      return <RewardsDashboardScreen />;

    case 'CodingProblem':
    case 'CodingChallenge':
    case 'CodeWorkspace':
      return <CodingProblemScreen />;

    case 'InteractiveTopic':
      return <InteractiveTopicScreen />;

    case 'AITutorHome':
      return <AITutorHomeScreen />;

    case 'AIChat':
      return <AIChatScreen />;

    case 'AISpeaking':
      return <AISpeakingScreen />;

    case 'AIInterview':
      return <AIInterviewScreen />;

    case 'AIDataSettings':
      return <AIDataSettingsScreen />;

    case 'Home':
    case 'Dashboard':
    default:
      return <DashboardScreen />;
    }
  };

  return (
    <PageTransitionWrapper screenKey={currentScreen}>
      {renderScreen()}
    </PageTransitionWrapper>
  );
};
