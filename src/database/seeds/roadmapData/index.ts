import { CourseRoadmapSeed } from './types';
import { pythonRoadmap } from './pythonRoadmap';
import { dsaRoadmap } from './dsaRoadmap';
import { sqlRoadmap } from './sqlRoadmap';
import { gitRoadmap } from './gitRoadmap';
import { linuxRoadmap } from './linuxRoadmap';
import { javascriptRoadmap } from './javascriptRoadmap';
import { htmlRoadmap, cssRoadmap } from './webRoadmaps';
import { djangoRoadmap, frappeRoadmap } from './backendRoadmaps';
import { mlRoadmap } from './mlRoadmap';
import { aptitudeRoadmap, englishRoadmap, hindiRoadmap } from './skillsRoadmaps';

export * from './types';

export const ALL_COURSE_ROADMAPS: CourseRoadmapSeed[] = [
  pythonRoadmap,
  dsaRoadmap,
  gitRoadmap,
  sqlRoadmap,
  djangoRoadmap,
  mlRoadmap,
  linuxRoadmap,
  frappeRoadmap,
  aptitudeRoadmap,
  englishRoadmap,
  hindiRoadmap,
  htmlRoadmap,
  cssRoadmap,
  javascriptRoadmap,
];
