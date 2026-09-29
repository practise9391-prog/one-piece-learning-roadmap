/**
 * Algorithm Pattern Detector Service
 * Analyzes problem descriptions and constraints to suggest applicable algorithm patterns,
 * trigger clues, recommended data structures, and asymptotic complexity boundaries.
 * Designed to connect to real AI assistant provider.
 */

export interface PatternMatchResult {
  patternName: string;
  confidence: 'HIGH' | 'MEDIUM' | 'POTENTIAL';
  cluesDetected: string[];
  whyItApplies: string;
  recommendedDataStructures: string[];
  expectedComplexity: {
    time: string;
    space: string;
  };
  sampleTemplateSnippet?: string;
}

export interface PatternRule {
  name: string;
  keywords: string[];
  constraintHints?: (n: number) => boolean;
  whyItApplies: string;
  recommendedDataStructures: string[];
  expectedTime: string;
  expectedSpace: string;
  sampleTemplate: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    name: 'Sliding Window',
    keywords: ['contiguous', 'subarray', 'substring', 'window', 'consecutive', 'at most k', 'longest substring', 'minimum size subarray'],
    whyItApplies: 'The problem asks for an optimal or valid contiguous range in an array or string. Maintaining running state as boundaries slide avoids O(n²) nested iteration.',
    recommendedDataStructures: ['Two indices (left, right)', 'Hash Map / Frequency Array', 'Deque'],
    expectedTime: 'O(n)',
    expectedSpace: 'O(k) or O(1)',
    sampleTemplate: 'let left = 0;\nfor (let right = 0; right < arr.length; right++) {\n  expandWindow(arr[right]);\n  while (windowConditionViolated) {\n    shrinkWindow(arr[left++]);\n  }\n  updateResult();\n}',
  },
  {
    name: 'Two Pointers (Opposite / Fast-Slow)',
    keywords: ['sorted array', 'pair with target sum', 'reverse', 'palindrome', 'two sum ii', 'cycle in', 'linked list cycle', 'middle of'],
    whyItApplies: 'Sorted data enables directional inward convergence based on comparisons; fast & slow pointers detect cycles or midpoints in a single pass.',
    recommendedDataStructures: ['Two pointers / indices'],
    expectedTime: 'O(n) or O(n log n) if sorting needed',
    expectedSpace: 'O(1)',
    sampleTemplate: 'let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return [left, right];\n  else if (sum < target) left++;\n  else right--;\n}',
  },
  {
    name: 'Prefix Sum & Difference Array',
    keywords: ['range sum', 'query', 'subarrays sum to k', 'sum of elements between', 'prefix', 'cumulative sum', 'difference array'],
    whyItApplies: 'Precomputing running totals allows answering arbitrary range sum queries in O(1) time and detecting subarray sums with hash maps in O(n).',
    recommendedDataStructures: ['Prefix array', 'Running sum Hash Map'],
    expectedTime: 'O(n) preprocessing, O(1) per query',
    expectedSpace: 'O(n)',
    sampleTemplate: 'const prefix = new Array(n + 1).fill(0);\nfor (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + arr[i];\n// sum(i..j) = prefix[j + 1] - prefix[i]',
  },
  {
    name: 'Binary Search on Answer / Parametric Search',
    keywords: ['minimum possible maximum', 'maximum possible minimum', 'k-th smallest', 'capacity to ship', 'split array largest sum', 'monotonic', 'sorted'],
    whyItApplies: 'When a feasibility check function can answer "can we achieve X?" monotonically (True then False, or vice versa), binary searching the answer domain yields O(log(range) * checkCost).',
    recommendedDataStructures: ['Low/High domain integers', 'Feasibility check function'],
    expectedTime: 'O(checkCost * log(range))',
    expectedSpace: 'O(1)',
    sampleTemplate: 'let low = minPossible, high = maxPossible;\nwhile (low <= high) {\n  const mid = Math.floor(low + (high - low) / 2);\n  if (canAchieve(mid)) { ans = mid; high = mid - 1; }\n  else { low = mid + 1; }\n}',
  },
  {
    name: 'Monotonic Stack / Queue',
    keywords: ['next greater element', 'daily temperatures', 'largest rectangle', 'histogram', 'sliding window maximum', 'previous smaller'],
    whyItApplies: 'Maintains elements in monotonic order to resolve next/previous boundary problems in linear total time because each element is pushed and popped at most once.',
    recommendedDataStructures: ['Stack / Deque (indices)'],
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    sampleTemplate: 'const stack = []; // stores indices\nfor (let i = 0; i < arr.length; i++) {\n  while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {\n    const prevIdx = stack.pop();\n    res[prevIdx] = arr[i];\n  }\n  stack.push(i);\n}',
  },
  {
    name: 'Dynamic Programming (Memoization / Tabulation)',
    keywords: ['maximum profit', 'minimum cost', 'number of ways', 'longest subsequence', 'coin change', 'knapsack', 'partition into equal'],
    whyItApplies: 'Optimal substructure and overlapping subproblems allow solving smaller states once and storing their results in a table, transforming exponential recursion into polynomial runtime.',
    recommendedDataStructures: ['1D or 2D Array / Memoization Map'],
    expectedTime: 'O(number_of_states * transitions)',
    expectedSpace: 'O(states)',
    sampleTemplate: 'const dp = new Array(W + 1).fill(0);\nfor (let i = 0; i < items.length; i++) {\n  for (let w = W; w >= items[i].weight; w--) {\n    dp[w] = Math.max(dp[w], dp[w - items[i].weight] + items[i].val);\n  }\n}',
  },
  {
    name: 'Graph Traversal (BFS / Shortest Path)',
    keywords: ['shortest path', 'unweighted', 'minimum steps', 'levels', 'connected components', 'flood fill', 'grid reachability', 'multi-source'],
    whyItApplies: 'BFS explores nodes layer by layer, guaranteeing the minimum distance / fewest operations in unweighted graphs or uniform step grids.',
    recommendedDataStructures: ['Queue (FIFO)', 'Visited Set / 2D boolean array'],
    expectedTime: 'O(V + E)',
    expectedSpace: 'O(V)',
    sampleTemplate: 'const queue = [[start, 0]];\nconst visited = new Set([start]);\nwhile (queue.length > 0) {\n  const [curr, dist] = queue.shift();\n  if (curr === target) return dist;\n  for (const next of adj[curr]) {\n    if (!visited.has(next)) { visited.add(next); queue.push([next, dist + 1]); }\n  }\n}',
  },
  {
    name: 'Backtracking (Choose → Explore → Undo)',
    keywords: ['generate all', 'permutations', 'subsets', 'n-queens', 'sudoku', 'combinations', 'word search'],
    whyItApplies: 'Explores all valid configurations through DFS with state modification and rollback, pruning invalid partial states early.',
    recommendedDataStructures: ['Recursion stack', 'Current path array', 'Used set / boolean flags'],
    expectedTime: 'O(k^n) or O(n!)',
    expectedSpace: 'O(recursion depth)',
    sampleTemplate: 'function backtrack(currState) {\n  if (isGoal(currState)) { res.push([...currState]); return; }\n  for (const choice of choices) {\n    if (!isValid(choice)) continue;\n    makeChoice(choice);\n    backtrack(currState);\n    undoChoice(choice);\n  }\n}',
  },
];

export class AlgorithmPatternDetectorService {
  /**
   * Analyzes problem statement and constraints to identify relevant algorithmic patterns.
   */
  public detectPatterns(problemStatement: string, constraints?: string): PatternMatchResult[] {
    const text = (problemStatement + ' ' + (constraints || '')).toLowerCase();
    const results: PatternMatchResult[] = [];

    for (const rule of PATTERN_RULES) {
      const matchedKeywords: string[] = [];
      for (const kw of rule.keywords) {
        if (text.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        }
      }

      if (matchedKeywords.length > 0) {
        const confidence: PatternMatchResult['confidence'] =
          matchedKeywords.length >= 3 ? 'HIGH' : matchedKeywords.length === 2 ? 'MEDIUM' : 'POTENTIAL';

        results.push({
          patternName: rule.name,
          confidence,
          cluesDetected: matchedKeywords,
          whyItApplies: rule.whyItApplies,
          recommendedDataStructures: rule.recommendedDataStructures,
          expectedComplexity: {
            time: rule.expectedTime,
            space: rule.expectedSpace,
          },
          sampleTemplateSnippet: rule.sampleTemplate,
        });
      }
    }

    // Sort by confidence: HIGH first, then MEDIUM, then POTENTIAL
    const order: Record<PatternMatchResult['confidence'], number> = { HIGH: 0, MEDIUM: 1, POTENTIAL: 2 };
    results.sort((a, b) => order[a.confidence] - order[b.confidence]);

    // If no pattern matched, provide foundational fallback recommendations
    if (results.length === 0) {
      results.push({
        patternName: 'Brute Force & Hash Map Enumeration',
        confidence: 'POTENTIAL',
        cluesDetected: ['general problem formulation'],
        whyItApplies: 'Start by enumerating all possibilities to confirm correctness, then use a Hash Map or Frequency Table to eliminate redundant nested passes.',
        recommendedDataStructures: ['Hash Map / Set', 'Array'],
        expectedComplexity: {
          time: 'O(n) to O(n²)',
          space: 'O(n)',
        },
        sampleTemplateSnippet: '// 1. Identify brute force nested loop\n// 2. Identify repeating sub-computations\n// 3. Trade space for time using Hash Map',
      });
    }

    return results;
  }
}

export const algorithmPatternDetectorService = new AlgorithmPatternDetectorService();
