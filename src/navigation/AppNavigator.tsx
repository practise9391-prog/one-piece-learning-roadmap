import React from 'react';
import { useAppNavigation } from './NavigationContext';
import { HomeScreen } from '../screens/HomeScreen';
import { DatabaseTestScreen } from '../screens/DatabaseTestScreen';
import { CourseDetailsScreen } from '../screens/CourseDetailsScreen';
import { ModuleDetailsScreen } from '../screens/ModuleDetailsScreen';
import { PlaceholderScreen } from '../screens/placeholders/PlaceholderScreen';

export const AppNavigator: React.FC = () => {
  const { currentScreen } = useAppNavigation();

  switch (currentScreen) {
    case 'DatabaseTest':
      return <DatabaseTestScreen />;

    case 'CourseRoadmap':
      return <CourseDetailsScreen />;

    case 'ModuleDetails':
      return <ModuleDetailsScreen />;

    case 'Dashboard':
      return (
        <PlaceholderScreen
          title="Grand Line Dashboard"
          subtitle="Command Center"
          icon="grid"
          plannedPart="Part 3"
          description="Central dashboard showing daily study goals, active course progress, recent achievements, and resume journey card."
        />
      );

    case 'Notes':
      return (
        <PlaceholderScreen
          title="Pirate Log Notes"
          subtitle="Study Journal"
          icon="journal"
          plannedPart="Part 3"
          description="Rich offline note-taking space organized by course and module with tags, search, and Markdown support."
        />
      );

    case 'Statistics':
      return (
        <PlaceholderScreen
          title="Log Pose Analytics"
          subtitle="Charts & Metrics"
          icon="pie-chart"
          plannedPart="Part 3"
          description="Visual completion velocity charts, time spent, mastery breakdown, and module completion streaks."
        />
      );

    case 'Settings':
      return (
        <PlaceholderScreen
          title="Crew Settings"
          subtitle="Preferences & Data"
          icon="settings"
          plannedPart="Part 4"
          description="Theme picker (Straw Hat Red, Gear 5 White, Zoro Emerald), SQLite database backup/export, and notification intervals."
        />
      );

    case 'PracticeLinks':
      return (
        <PlaceholderScreen
          title="Practice Grounds"
          subtitle="Bounty Challenges"
          icon="link"
          plannedPart="Part 4"
          description="Curated links and problem sets for LeetCode, HackerRank, GitHub repos, and official documentation."
        />
      );

    case 'News':
      return (
        <PlaceholderScreen
          title="World Economy News"
          subtitle="Tech & AI Headlines"
          icon="newspaper"
          plannedPart="Part 5"
          description="Curated tech headlines, AI updates, and market intelligence fetched when internet connectivity is active."
        />
      );

    case 'Motivation':
      return (
        <PlaceholderScreen
          title="Will of D. Quotes"
          subtitle="Daily Motivation"
          icon="flame"
          plannedPart="Part 5"
          description="Daily grit quotes, pirate king philosophies, and audio soundbites to inspire consistent learning discipline."
        />
      );

    case 'Home':
    default:
      return <HomeScreen />;
  }
};
