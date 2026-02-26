/**
 * lib/scoring.ts
 * // speed-based scoring formula
 * score = basePoints + timeBonus
 * timeBonus = floor(basePoints * max(0, 1 - hoursElapsed/24))
 */

export const BASE_POINTS = {
  easy: 100,
  hard: 300,
  sponsored: 200,
} as const;

export type ChallengeType = keyof typeof BASE_POINTS;

/**
 * Calculate points awarded for a correct submission.
 * @param type       - challenge type
 * @param unlocksAt  - when the challenge became available
 * @param submittedAt - when the user submitted
 */
export function calculatePoints(
  type: ChallengeType,
  unlocksAt: Date,
  submittedAt: Date
): number {
  const base = BASE_POINTS[type];
  const msElapsed = submittedAt.getTime() - unlocksAt.getTime();
  const hoursElapsed = Math.max(0, msElapsed / (1000 * 60 * 60));
  const timeFactor = Math.max(0, 1 - hoursElapsed / 24);
  const timeBonus = Math.floor(base * timeFactor);
  return base + timeBonus;
}
