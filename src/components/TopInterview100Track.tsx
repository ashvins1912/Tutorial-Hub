import { topInterview100Url } from '../data/topInterview100';
import { createCuratedProblemTrack } from './tracks/CuratedProblemTrackView';

export const TopInterview100Track = createCuratedProblemTrack({
  bundleKey: 'top-interview-100',
  accountStateKey: 'top-interview-100-progress',
  title: 'Top Interview 100',
  countSummary: '100 curated questions',
  description:
    'A focused practice path across 15 topic groups. Build pattern recognition, implement independently, and record what you learned from each problem.',
  difficulties: ['Easy', 'Medium', 'Hard'],
  buildExternalUrl: topInterview100Url,
});
