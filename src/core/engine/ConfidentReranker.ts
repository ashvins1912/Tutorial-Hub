import type {
  CandidateMatch,
  DeconstructionResult,
  RankedRecommendation,
  SocraticBlueprintStep,
} from '../knowledge-base/types';

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * Lightweight bounded Damerau-Levenshtein similarity for typo-resilient clue hits
 * (catches typos like "subtring", "iphne", "levenshtien", "pigeonhle").
 */
function tokenFuzzyMatch(needle: string, haystackTokens: string[]): boolean {
  const n = needle.toLowerCase();
  if (n.length <= 3) return haystackTokens.includes(n);

  for (const tok of haystackTokens) {
    if (tok === n || tok.includes(n) || n.includes(tok)) return true;
    if (Math.abs(tok.length - n.length) > 2) continue;

    const a = n;
    const b = tok;
    const m = a.length;
    const k = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(k + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= k; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= k; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
        }
      }
    }
    const maxDist = n.length >= 7 ? 2 : 1;
    if (dp[m][k] <= maxDist) return true;
  }
  return false;
}

/**
 * Stage 3: High-Precision Confident Reranker & 4-Phase Socratic Blueprint Generator.
 *
 * Calibrated formula:
 *   confidence = clamp01(
 *     0.35 * domainAlignment +
 *     0.40 * exactClueScore +
 *     0.25 * ngramOverlap -
 *     0.35 * penaltyScore
 *   )
 */
export function rerankCandidates(
  deconstruction: DeconstructionResult,
  candidates: CandidateMatch[],
): { recommendations: RankedRecommendation[]; blueprint: SocraticBlueprintStep[] } {
  const norm = deconstruction.normalizedText;
  const tokens = norm.split(' ').filter((t) => t.length >= 2);
  const domainMap = new Map(deconstruction.domainScores.map((d) => [d.domain, d.score]));

  const ranked: RankedRecommendation[] = candidates.map((cand) => {
    const s = cand.strategy;

    // 1. Domain Alignment [0..1] (weight 0.35)
    let domainAlignment = 0.15;
    if (s.domains.includes(deconstruction.primaryDomain)) {
      const primaryStrength = domainMap.get(deconstruction.primaryDomain) ?? 0.8;
      domainAlignment = Math.min(1, 0.75 + primaryStrength * 0.25);
    } else {
      const bestSecondary = Math.max(...s.domains.map((d) => domainMap.get(d) ?? 0), 0);
      domainAlignment = bestSecondary * 0.7;
    }

    // 2. Exact & Typo-Resilient Structural Clue Hits [0..1] (weight 0.40)
    const matchedClues: string[] = [];
    let cluePoints = 0;

    for (const clue of s.structuralClues) {
      const cNorm = clue.toLowerCase();
      if (norm.includes(cNorm)) {
        matchedClues.push(clue);
        cluePoints += 1.0;
      } else if (!cNorm.includes(' ') && tokenFuzzyMatch(cNorm, tokens)) {
        matchedClues.push(`${clue} (fuzzy)`);
        cluePoints += 0.8;
      }
    }

    for (const kw of s.triggerKeywords) {
      const kNorm = kw.toLowerCase();
      if (norm.includes(kNorm)) {
        if (!matchedClues.includes(kw)) matchedClues.push(kw);
        cluePoints += 0.55;
      } else if (!kNorm.includes(' ') && tokenFuzzyMatch(kNorm, tokens)) {
        if (!matchedClues.some((m) => m.startsWith(kw))) matchedClues.push(`${kw} (fuzzy)`);
        cluePoints += 0.4;
      }
    }

    // Saturating curve: 2.8+ clue points achieves near 1.0 clue confidence
    const exactClueScore = clamp01(1 - Math.exp(-cluePoints * 0.52));

    // 3. N-Gram Jaccard & Recall Blend [0..1] (weight 0.25)
    const ngramOverlap = clamp01(cand.recallScore * 0.72 + cand.jaccardScore * 1.4);

    // 4. Anti-Pattern & TLE Constraint Penalties [0..1] (weight -0.35)
    let penaltyRaw = 0;
    const pitfallWarnings: string[] = [...s.pitfalls];
    let tleWarning: string | undefined;

    for (const anti of s.antiPatterns) {
      const antiTokens = anti.toLowerCase().split(' ').filter((w) => w.length > 2);
      const hits = antiTokens.filter((t) => norm.includes(t)).length;
      if (antiTokens.length > 0 && hits >= Math.ceil(antiTokens.length * 0.66)) {
        penaltyRaw += 0.55;
        pitfallWarnings.unshift(`Anti-pattern detected ("${anti}"): verify assumptions before applying ${s.name}.`);
      }
    }

    // Hard TLE penalty when strategy complexity exceeds extracted constraint ceiling
    if (
      deconstruction.constraints.length > 0 &&
      s.complexityRank > deconstruction.hardestCeilingRank
    ) {
      const gap = s.complexityRank - deconstruction.hardestCeilingRank;
      penaltyRaw += Math.min(1.0, 0.45 * gap);
      tleWarning = `TLE Risk: ${s.name} runs in ${s.optimalTime}, exceeding extracted ceiling ${deconstruction.hardestCeiling}.`;
      pitfallWarnings.unshift(tleWarning);
    }

    // Space constraint penalty (O(1) space requested vs O(N) hash/DP)
    const wantsConstSpace = deconstruction.constraints.some((c) => c.spaceConstraint === 'O(1)');
    if (wantsConstSpace && !s.optimalSpace.includes('O(1)')) {
      penaltyRaw += 0.35;
      pitfallWarnings.unshift(`Space Budget Alert: Problem requests O(1) space, while ${s.name} typically uses ${s.optimalSpace}.`);
    }

    const penaltyScore = clamp01(penaltyRaw);

    const finalScore = Number(
      clamp01(
        0.35 * domainAlignment +
          0.4 * exactClueScore +
          0.25 * ngramOverlap -
          0.35 * penaltyScore
      ).toFixed(3)
    );

    const reasoningTrace: string[] = [
      `Domain alignment (${Math.round(domainAlignment * 100)}%): maps to ${s.domains.join(', ')} (detected primary: ${deconstruction.primaryDomain}).`,
      matchedClues.length > 0
        ? `Structural clue hits (${Math.round(exactClueScore * 100)}%): matched ${matchedClues.slice(0, 5).join(', ')}.`
        : `Structural clues: weak exact phrase overlap; relying on trigram semantic similarity.`,
      `Padded trigram overlap (${Math.round(ngramOverlap * 100)}%): ${cand.matchedTrigrams} shared trigrams (Recall ${(cand.recallScore * 100).toFixed(0)}%, Jaccard ${(cand.jaccardScore * 100).toFixed(0)}%).`,
      tleWarning
        ? tleWarning
        : `Complexity feasibility: ${s.optimalTime} time / ${s.optimalSpace} space fits within ceiling ${deconstruction.hardestCeiling}.`,
    ];

    return {
      strategy: s,
      confidence: finalScore,
      breakdown: {
        domainAlignment: Number(domainAlignment.toFixed(3)),
        exactClueScore: Number(exactClueScore.toFixed(3)),
        ngramOverlap: Number(ngramOverlap.toFixed(3)),
        penaltyDeduction: Number((0.35 * penaltyScore).toFixed(3)),
        finalScore,
      },
      matchedClues: matchedClues.slice(0, 8),
      reasoningTrace,
      pitfallWarnings: Array.from(new Set(pitfallWarnings)).slice(0, 5),
      tleWarning,
    };
  });

  ranked.sort((a, b) => b.confidence - a.confidence);
  const top = ranked[0];

  const blueprint: SocraticBlueprintStep[] = top
    ? [
        {
          phase: 'DECONSTRUCT',
          label: '1. Deconstruct Constraints & Domain',
          objective: `Lock in domain (${deconstruction.primaryDomain}) and complexity ceiling (${deconstruction.hardestCeiling}).`,
          guidingPrompt: top.strategy.socraticPrompts.DECONSTRUCT,
          checkpointCriteria: 'Identify input scale, invariant constraints, and disqualified brute-force classes.',
        },
        {
          phase: 'HYPOTHESIZE',
          label: '2. Hypothesize Core Mental Model',
          objective: `Validate ${top.strategy.name} (${top.strategy.optimalTime} · ${top.strategy.optimalSpace}).`,
          guidingPrompt: top.strategy.socraticPrompts.HYPOTHESIZE,
          checkpointCriteria: 'State why the chosen invariant or data structure eliminates redundant work.',
        },
        {
          phase: 'ELIMINATE_OR_BUILD',
          label: '3. Eliminate Dead Branches or Build Step-by-Step',
          objective: 'Assemble state transitions, loop guards, or deduction eliminations in pieces.',
          guidingPrompt: top.strategy.socraticPrompts.ELIMINATE_OR_BUILD,
          checkpointCriteria: 'Verify every transition preserves the loop/state invariant without off-by-one drift.',
        },
        {
          phase: 'VERIFY_EDGE_CASES',
          label: '4. Verify Edge Cases & Adversarial Inputs',
          objective: 'Stress-test boundaries, empty/singular inputs, ties, and worst-case triggers.',
          guidingPrompt: top.strategy.socraticPrompts.VERIFY_EDGE_CASES,
          checkpointCriteria: `Guard against: ${top.pitfallWarnings[0] ?? 'boundary overflow and degenerate inputs'}.`,
        },
      ]
    : [];

  return { recommendations: ranked.slice(0, 5), blueprint };
}
