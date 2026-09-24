export type RootScreen =
  | 'Home'
  | 'DatabaseTest'
  | 'Dashboard'
  | 'CourseRoadmap'
  | 'CourseCompletion'
  | 'ModuleDetails'
  | 'Notes'
  | 'Statistics'
  | 'Settings'
  | 'PracticeLinks'
  | 'News'
  | 'Motivation';

export interface NavigationState {
  currentScreen: RootScreen;
  params?: {
    courseId?: string;
    moduleId?: string;
    [key: string]: any;
  };
}

export interface NavigationContextValue {
  currentScreen: RootScreen;
  params?: Record<string, any>;
  navigate: (screen: RootScreen, params?: Record<string, any>) => void;
  goBack: () => void;
}
