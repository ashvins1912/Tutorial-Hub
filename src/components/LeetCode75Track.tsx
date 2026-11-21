import { leetCode75Url } from '../data/leetcode75';
import { createCuratedProblemTrack } from './tracks/CuratedProblemTrackView';

export const LeetCode75Track = createCuratedProblemTrack({
  bundleKey: 'leetcode-75',
  accountStateKey: 'leetcode75-progress',
  title: 'LeetCode 75',
  countSummary: '75 curated questions',
  description:
    'A focused practice path across 22 topic groups. Build pattern recognition, implement independently, and record what you learned from each problem.',
  difficulties: ['Easy', 'Medium', 'Hard'],
  buildExternalUrl: leetCode75Url,
});
