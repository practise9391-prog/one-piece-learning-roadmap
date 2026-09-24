export interface SeedTopic {
  title: string;
  description?: string;
}

export interface SeedModule {
  title: string;
  description?: string;
  icon?: string;
  topics: (string | SeedTopic)[];
}

export interface CourseRoadmapSeed {
  courseId: string;
  modules: SeedModule[];
}
