export type RootScreen =
  | 'Home'
  | 'Dashboard'
  | 'Courses'
  | 'CourseRoadmap'
  | 'CourseCompletion'
  | 'ModuleDetails'
  | 'Notes'
  | 'Completed'
  | 'Remaining'
  | 'Statistics'
  | 'Settings'
  | 'ProfileSettings'
  | 'LearningPreferences'
  | 'DailyGoalSettings'
  | 'PracticeSettings'
  | 'NewsSettings'
  | 'MotivationSettings'
  | 'AppearanceSettings'
  | 'NotificationSettings'
  | 'DataManagement'
  | 'About'
  | 'PracticeLinks'
  | 'PracticeCategory'
  | 'PracticeQuestion'
  | 'News'
  | 'NewsArticle'
  | 'Motivation'
  | 'DailyLearning'
  | 'Achievements'
  | 'DatabaseTest';

export interface NavigationState {
  currentScreen: RootScreen;
  params?: {
    courseId?: string;
    moduleId?: string;
    categoryId?: string;
    questionId?: string;
    articleId?: string;
    topic?: string;
    replay?: boolean;
    [key: string]: any;
  };
}

export interface NavigationContextValue {
  currentScreen: RootScreen;
  params?: Record<string, any>;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  navigate: (screen: RootScreen, params?: Record<string, any>) => void;
  goBack: () => void;
}
