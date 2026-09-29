import { systemDesignRoadmap } from './systemDesignRoadmap';
import { reactRoadmap } from './reactRoadmap';
import { algorithmsRoadmap } from './algorithmsRoadmap';
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
import { aptitudeRoadmap } from './aptitudeRoadmap';
import { reasoningRoadmap } from './reasoningRoadmap';
import { verbalEnglishRoadmap } from './verbalEnglishRoadmap';
import { englishSpeakingRoadmap } from './englishSpeakingRoadmap';
import { hindiRoadmap } from './skillsRoadmaps';

export * from './types';
export { systemDesignRoadmap } from './systemDesignRoadmap';
export { reactRoadmap } from './reactRoadmap';
export { algorithmsRoadmap } from './algorithmsRoadmap';
export { aptitudeRoadmap } from './aptitudeRoadmap';
export { reasoningRoadmap } from './reasoningRoadmap';
export { verbalEnglishRoadmap } from './verbalEnglishRoadmap';
export { englishSpeakingRoadmap } from './englishSpeakingRoadmap';

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
  reasoningRoadmap,
  verbalEnglishRoadmap,
  englishSpeakingRoadmap,
  hindiRoadmap,
  htmlRoadmap,
  cssRoadmap,
  javascriptRoadmap,
  systemDesignRoadmap,
  reactRoadmap,
  algorithmsRoadmap,
];
