import { SQLiteDatabase } from 'expo-sqlite';
import { reactRoadmap } from '../seeds/roadmapData/reactRoadmap';
import { algorithmsRoadmap } from '../seeds/roadmapData/algorithmsRoadmap';

/**
 * Migration v25: React & Algorithms Major Courses
 * - React: Level 0 Prerequisites + Exact 60 Topics across 10 Modules (Beginner -> Intermediate -> Advanced -> Production)
 * - Algorithms: Modules 0-14, 10 Master Levels, Foundations, Patterns Library, Visual Debugging & Proofs
 * - Practice Task connections with sample & hidden test cases
 */
export const v25_part27_react_and_algorithms_courses = {
  version: 25,
  name: 'v25_part27_react_and_algorithms_courses',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // ==========================================
    // 1. SEED REACT COURSE
    // ==========================================
    await db.runAsync(
      `INSERT OR IGNORE INTO courses (
        id, name, description, icon, theme, order_index,
        total_modules, completed_modules, progress_percentage,
        is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0.0, 0, ?, ?);`,
      [
        'react',
        'React',
        'Component architecture, Hooks, State management, TanStack Query, Next.js, and Full-Stack production apps.',
        'react',
        'react',
        18,
        reactRoadmap.modules.length,
        now,
        now,
      ]
    );

    // Insert React Modules & Topics
    for (let i = 0; i < reactRoadmap.modules.length; i++) {
      const mod = reactRoadmap.modules[i];
      const moduleId = `react_m${i}`;

      await db.runAsync(
        `INSERT OR IGNORE INTO modules (
          id, course_id, title, description, order_index, icon,
          is_completed, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
        [
          moduleId,
          'react',
          mod.title,
          mod.description || '',
          i,
          mod.icon || 'react',
          now,
        ]
      );

      let topicOrder = 1;
      for (const topicItem of mod.topics) {
        const topicTitle = typeof topicItem === 'string' ? topicItem : topicItem.title;
        const topicDesc = typeof topicItem === 'string' ? '' : (topicItem.description || '');
        const topicId = `${moduleId}_t${topicOrder}`;

        await db.runAsync(
          `INSERT OR IGNORE INTO topics (
            id, module_id, title, description, order_index,
            is_completed, completed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?);`,
          [topicId, moduleId, topicTitle, topicDesc, topicOrder, now]
        );

        topicOrder++;
      }
    }

    // ==========================================
    // 2. SEED ALGORITHMS COURSE
    // ==========================================
    await db.runAsync(
      `INSERT OR IGNORE INTO courses (
        id, name, description, icon, theme, order_index,
        total_modules, completed_modules, progress_percentage,
        is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0.0, 0, ?, ?);`,
      [
        'algorithms',
        'Algorithms',
        'Master algorithm patterns, foundations, search/sort, graph flow, DP, competitive programming & visual debugging.',
        'graph-outline',
        'algorithms',
        19,
        algorithmsRoadmap.modules.length,
        now,
        now,
      ]
    );

    // Insert Algorithms Modules & Topics
    for (let i = 0; i < algorithmsRoadmap.modules.length; i++) {
      const mod = algorithmsRoadmap.modules[i];
      const moduleId = `algorithms_m${i}`;

      await db.runAsync(
        `INSERT OR IGNORE INTO modules (
          id, course_id, title, description, order_index, icon,
          is_completed, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
        [
          moduleId,
          'algorithms',
          mod.title,
          mod.description || '',
          i,
          mod.icon || 'graph-outline',
          now,
        ]
      );

      let topicOrder = 1;
      for (const topicItem of mod.topics) {
        const topicTitle = typeof topicItem === 'string' ? topicItem : topicItem.title;
        const topicDesc = typeof topicItem === 'string' ? '' : (topicItem.description || '');
        const topicId = `${moduleId}_t${topicOrder}`;

        await db.runAsync(
          `INSERT OR IGNORE INTO topics (
            id, module_id, title, description, order_index,
            is_completed, completed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?);`,
          [topicId, moduleId, topicTitle, topicDesc, topicOrder, now]
        );

        topicOrder++;
      }
    }

    // ==========================================
    // 3. SEED PRACTICE TASKS & TEST CASES
    // ==========================================
    const practiceTasks = [
      // React Practice Tasks
      {
        id: 'react_task_counter',
        course_id: 'react',
        module_id: 'react_m1',
        topic_id: 'react_m1_t4', // Components
        category_id: 'react_basics',
        title: 'Build a Reusable Counter Component',
        description: 'Create a React functional component named Counter that accepts an initialCount prop and renders increment/decrement buttons.',
        instructions: 'Define function Counter({ initialCount = 0 }). Maintain count state using useState. Render the current count.',
        task_type: 'CODING',
        difficulty: 'EASY',
        language: 'javascript',
        starter_code: `import React, { useState } from 'react';\n\nexport function Counter({ initialCount = 0 }) {\n  // Write your component here\n  return null;\n}`,
        solution: `import React, { useState } from 'react';\n\nexport function Counter({ initialCount = 0 }) {\n  const [count, setCount] = useState(initialCount);\n  return (\n    <div>\n      <span data-testid="count">{count}</span>\n      <button onClick={() => setCount(count + 1)}>+</button>\n      <button onClick={() => setCount(count - 1)}>-</button>\n    </div>\n  );\n}`,
        explanation: 'Components encapsulate logic and state. useState triggers a re-render whenever count is updated.',
        hints: JSON.stringify(['Use const [count, setCount] = useState(initialCount);', 'Return JSX with button click handlers']),
        points: 20,
        xp: 35,
        test_cases: [
          { input: '0', expected_output: '0', is_hidden: 0 },
          { input: '5', expected_output: '5', is_hidden: 1 },
        ]
      },
      {
        id: 'react_task_user_badge',
        course_id: 'react',
        module_id: 'react_m1',
        topic_id: 'react_m1_t5', // Props
        category_id: 'react_props',
        title: 'User Profile Badge with Props',
        description: 'Implement a UserBadge component that receives name, role, and isOnline boolean props.',
        instructions: 'Display the name in bold, role in subtitle, and a green dot indicator if isOnline is true.',
        task_type: 'CODING',
        difficulty: 'EASY',
        language: 'javascript',
        starter_code: `export function UserBadge({ name, role, isOnline }) {\n  // Return user badge markup\n  return null;\n}`,
        solution: `export function UserBadge({ name, role, isOnline }) {\n  return (\n    <div className="user-badge">\n      <h3>{name}</h3>\n      <p>{role}</p>\n      {isOnline && <span className="status-online">Online</span>}\n    </div>\n  );\n}`,
        explanation: 'Props are read-only inputs passed from parent to child. Conditional rendering displays the online status.',
        hints: JSON.stringify(['Destructure props in the function arguments', 'Use short-circuit evaluation for isOnline']),
        points: 20,
        xp: 35,
        test_cases: [
          { input: '{"name":"Luffy","role":"Captain","isOnline":true}', expected_output: 'Luffy Captain Online', is_hidden: 0 }
        ]
      },
      {
        id: 'react_task_custom_hook_debounce',
        course_id: 'react',
        module_id: 'react_m4',
        topic_id: 'react_m4_t4', // Custom Hooks
        category_id: 'react_hooks',
        title: 'Implement useDebounce Custom Hook',
        description: 'Build a custom hook useDebounce(value, delay) that returns the debounced value after delay ms.',
        instructions: 'Use useEffect and setTimeout. Ensure you clear the timeout on cleanup when value or delay changes.',
        task_type: 'CODING',
        difficulty: 'MEDIUM',
        language: 'javascript',
        starter_code: `import { useState, useEffect } from 'react';\n\nexport function useDebounce(value, delay) {\n  // Write hook implementation\n}`,
        solution: `import { useState, useEffect } from 'react';\n\nexport function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}`,
        explanation: 'Custom hooks allow encapsulating side effects. The return function inside useEffect serves as the cleanup phase.',
        hints: JSON.stringify(['Store state in debouncedValue', 'In useEffect return () => clearTimeout(handler);']),
        points: 35,
        xp: 60,
        test_cases: [
          { input: '"hello", 300', expected_output: '"hello"', is_hidden: 0 }
        ]
      },

      // Algorithms Practice Tasks
      {
        id: 'algo_task_binary_search',
        course_id: 'algorithms',
        module_id: 'algorithms_m3',
        topic_id: 'algorithms_m3_t4', // Binary Search
        category_id: 'searching',
        title: 'Binary Search on Sorted Array',
        description: 'Given a sorted array of distinct integers nums and a target integer, return the index of target if found, or -1.',
        instructions: 'Implement binary search in O(log n) time complexity and O(1) space.',
        task_type: 'CODING',
        difficulty: 'EASY',
        language: 'python',
        starter_code: `def binary_search(nums: list[int], target: int) -> int:\n    # Your O(log n) code here\n    pass`,
        solution: `def binary_search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
        explanation: 'Halve the search space at each iteration using mid comparison. Left and right converge in O(log n) steps.',
        hints: JSON.stringify(['Use left + (right - left) // 2 to avoid overflow', 'Shift left = mid + 1 if nums[mid] < target']),
        points: 25,
        xp: 40,
        test_cases: [
          { input: '[-1,0,3,5,9,12], 9', expected_output: '4', is_hidden: 0 },
          { input: '[-1,0,3,5,9,12], 2', expected_output: '-1', is_hidden: 0 },
          { input: '[1,2,3,4,5,6,7,8,9,10], 1', expected_output: '0', is_hidden: 1 },
          { input: '[1,2,3,4,5,6,7,8,9,10], 10', expected_output: '9', is_hidden: 1 },
        ]
      },
      {
        id: 'algo_task_two_sum_two_pointer',
        course_id: 'algorithms',
        module_id: 'algorithms_m5',
        topic_id: 'algorithms_m5_t2', // Opposite Direction Pointers
        category_id: 'two_pointers',
        title: 'Two Sum II — Sorted Array',
        description: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers that add up to a target number.',
        instructions: 'Return the indices [index1, index2] of the two numbers, 1-indexed. Must use O(1) extra space.',
        task_type: 'CODING',
        difficulty: 'EASY',
        language: 'python',
        starter_code: `def two_sum_sorted(numbers: list[int], target: int) -> list[int]:\n    # Your O(n) two-pointer code\n    pass`,
        solution: `def two_sum_sorted(numbers: list[int], target: int) -> list[int]:\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        curr = numbers[left] + numbers[right]\n        if curr == target:\n            return [left + 1, right + 1]\n        elif curr < target:\n            left += 1\n        else:\n            right -= 1\n    return []`,
        explanation: 'Because the array is sorted, if current sum is smaller than target, increment left. If larger, decrement right.',
        hints: JSON.stringify(['Start with left at 0 and right at len - 1', 'Move left inward if sum < target, right inward if sum > target']),
        points: 25,
        xp: 40,
        test_cases: [
          { input: '[2,7,11,15], 9', expected_output: '[1, 2]', is_hidden: 0 },
          { input: '[2,3,4], 6', expected_output: '[1, 3]', is_hidden: 0 },
          { input: '[-1,0], -1', expected_output: '[1, 2]', is_hidden: 1 }
        ]
      },
      {
        id: 'algo_task_sliding_window_max',
        course_id: 'algorithms',
        module_id: 'algorithms_m5',
        topic_id: 'algorithms_m5_t5', // Sliding Window Fixed Size
        category_id: 'sliding_window',
        title: 'Maximum Sum Subarray of Size K',
        description: 'Given an array of integers and a number k, find the maximum sum of any contiguous subarray of size k.',
        instructions: 'Calculate the sum of first k elements, then slide the window by adding the next element and subtracting the element going out.',
        task_type: 'CODING',
        difficulty: 'MEDIUM',
        language: 'python',
        starter_code: `def max_sub_array_of_size_k(k: int, arr: list[int]) -> int:\n    # O(n) sliding window\n    pass`,
        solution: `def max_sub_array_of_size_k(k: int, arr: list[int]) -> int:\n    if not arr or k <= 0 or k > len(arr):\n        return 0\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    for i in range(k, len(arr)):\n        window_sum += arr[i] - arr[i - k]\n        if window_sum > max_sum:\n            max_sum = window_sum\n    return max_sum`,
        explanation: 'Sliding window avoids recomputing the sum of k elements from scratch, reducing time complexity from O(n*k) to O(n).',
        hints: JSON.stringify(['Compute initial sum of first k elements', 'Add next element and subtract leaving element']),
        points: 35,
        xp: 55,
        test_cases: [
          { input: '3, [2, 1, 5, 1, 3, 2]', expected_output: '9', is_hidden: 0 },
          { input: '2, [2, 3, 4, 1, 5]', expected_output: '7', is_hidden: 0 },
          { input: '4, [1, 4, 2, 10, 23, 3, 1, 0, 20]', expected_output: '39', is_hidden: 1 }
        ]
      },
      {
        id: 'algo_task_knapsack',
        course_id: 'algorithms',
        module_id: 'algorithms_m8',
        topic_id: 'algorithms_m8_t5', // 0/1 Knapsack
        category_id: 'dynamic_programming',
        title: '0/1 Knapsack Optimization',
        description: 'Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value.',
        instructions: 'Implement 0/1 Knapsack using 1D or 2D Dynamic Programming in O(n*W) time.',
        task_type: 'CODING',
        difficulty: 'HARD',
        language: 'python',
        starter_code: `def knapsack(weights: list[int], values: list[int], W: int) -> int:\n    # DP implementation\n    pass`,
        solution: `def knapsack(weights: list[int], values: list[int], W: int) -> int:\n    n = len(weights)\n    dp = [0] * (W + 1)\n    for i in range(n):\n        w = weights[i]\n        val = values[i]\n        for cap in range(W, w - 1, -1):\n            dp[cap] = max(dp[cap], dp[cap - w] + val)\n    return dp[W]`,
        explanation: 'Space-optimized 1D DP traverses capacity backwards from W to w to ensure each item is chosen at most once.',
        hints: JSON.stringify(['Iterate capacity backwards to avoid using the same item multiple times', 'dp[w] = max(dp[w], dp[w - weight] + value)']),
        points: 50,
        xp: 80,
        test_cases: [
          { input: '[1, 3, 4, 5], [1, 4, 5, 7], 7', expected_output: '9', is_hidden: 0 },
          { input: '[10, 20, 30], [60, 100, 120], 50', expected_output: '220', is_hidden: 1 }
        ]
      },
      {
        id: 'algo_task_dijkstra',
        course_id: 'algorithms',
        module_id: 'algorithms_m9',
        topic_id: 'algorithms_m9_t8', // Single-Source Shortest Path
        category_id: 'graphs',
        title: "Dijkstra's Single-Source Shortest Path",
        description: 'Given a weighted graph represented as an adjacency list and a source node src, calculate shortest distances to all nodes.',
        instructions: 'Use a min-heap priority queue to extract the node with minimum distance in O((V + E) log V).',
        task_type: 'CODING',
        difficulty: 'HARD',
        language: 'python',
        starter_code: `import heapq\n\ndef dijkstra(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:\n    # adj[u] = [(v, weight), ...]\n    pass`,
        solution: `import heapq\n\ndef dijkstra(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:\n    dist = [float('inf')] * n\n    dist[src] = 0\n    pq = [(0, src)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]:\n            continue\n        for v, weight in adj[u]:\n            if dist[u] + weight < dist[v]:\n                dist[v] = dist[u] + weight\n                heapq.heappush(pq, (dist[v], v))\n    return [int(x) if x != float('inf') else -1 for x in dist]`,
        explanation: 'Greedy choice ensures that when a node is popped from the priority queue with minimum distance, its shortest path is final.',
        hints: JSON.stringify(['Initialize distances to infinity except src which is 0', 'Push (0, src) to heapq', 'Relax edges when dist[u] + weight < dist[v]']),
        points: 50,
        xp: 80,
        test_cases: [
          { input: '4, [[(1, 1), (2, 4)], [(2, 2), (3, 6)], [(3, 3)], []], 0', expected_output: '[0, 1, 3, 6]', is_hidden: 0 }
        ]
      }
    ];

    // Ensure practice_tasks, task_test_cases, and compatibility view exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS practice_tasks (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT,
        task_type TEXT NOT NULL DEFAULT 'CODING',
        difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
        language TEXT NOT NULL DEFAULT 'python',
        starter_code TEXT NOT NULL,
        solution TEXT NOT NULL,
        explanation TEXT,
        hints TEXT,
        time_limit INTEGER DEFAULT 2,
        memory_limit INTEGER DEFAULT 128,
        points INTEGER NOT NULL DEFAULT 10,
        xp INTEGER NOT NULL DEFAULT 20,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_completed INTEGER NOT NULL DEFAULT 0,
        is_bookmarked INTEGER NOT NULL DEFAULT 0,
        user_draft TEXT,
        status TEXT NOT NULL DEFAULT 'NOT_STARTED',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_test_cases (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_hidden INTEGER NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        weight INTEGER NOT NULL DEFAULT 1,
        timeout_ms INTEGER NOT NULL DEFAULT 2000,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES practice_tasks(id) ON DELETE CASCADE
      );

      CREATE VIEW IF NOT EXISTS practice_test_cases AS SELECT * FROM task_test_cases;
    `);

    for (const task of practiceTasks) {
      await db.runAsync(
        `INSERT OR IGNORE INTO practice_tasks (
          id, course_id, module_id, topic_id, category_id,
          title, description, instructions, task_type, difficulty,
          language, starter_code, solution, explanation, hints,
          points, xp, order_index, is_active, is_completed, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, 'NOT_STARTED', ?, ?);`,
        [
          task.id,
          task.course_id,
          task.module_id,
          task.topic_id,
          task.category_id,
          task.title,
          task.description,
          task.instructions,
          task.task_type,
          task.difficulty,
          task.language,
          task.starter_code,
          task.solution,
          task.explanation,
          task.hints,
          task.points,
          task.xp,
          now,
          now,
        ]
      );

      // Insert test cases for task
      for (let tcIdx = 0; tcIdx < task.test_cases.length; tcIdx++) {
        const tc = task.test_cases[tcIdx];
        const tcId = `${task.id}_tc_${tcIdx + 1}`;
        await db.runAsync(
          `INSERT OR IGNORE INTO task_test_cases (
            id, task_id, input, expected_output, is_hidden,
            order_index, weight, timeout_ms, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 10, 2000, ?);`,
          [
            tcId,
            task.id,
            tc.input,
            tc.expected_output,
            tc.is_hidden,
            tcIdx + 1,
            now,
          ]
        );
      }
    }

    // ==========================================
    // 4. RECALCULATE MODULE STATS
    // ==========================================
    await db.execAsync(`
      UPDATE courses
      SET total_modules = (SELECT COUNT(*) FROM modules WHERE modules.course_id = courses.id)
      WHERE id IN ('react', 'algorithms');
    `);
  },
};
