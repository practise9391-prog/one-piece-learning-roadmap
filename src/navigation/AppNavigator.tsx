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
import { PracticeHomeScreen } from '../screens/practice/PracticeHomeScreen';
import { PracticeCategoryScreen } from '../screens/practice/PracticeCategoryScreen';
import { PracticeQuestionScreen } from '../screens/practice/PracticeQuestionScreen';
import { NewsHomeScreen } from '../screens/news/NewsHomeScreen';
import { NewsArticleScreen } from '../screens/news/NewsArticleScreen';
import { MotivationHomeScreen } from '../screens/motivation/MotivationHomeScreen';
import { DailyLearningScreen } from '../screens/motivation/DailyLearningScreen';
import { AchievementsScreen } from '../screens/motivation/AchievementsScreen';
import { DatabaseTestScreen } from '../screens/DatabaseTestScreen';

export const AppNavigator: React.FC = () => {
  const { currentScreen } = useAppNavigation();

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

    case 'DatabaseTest':
      return <DatabaseTestScreen />;

    case 'Home':
    case 'Dashboard':
    default:
      return <DashboardScreen />;
  }
};
