import { CourseRoadmapSeed } from './types';

export const reasoningRoadmap: CourseRoadmapSeed = {
  courseId: 'reasoning',
  modules: [
    // --- STAGE 1: BASICS & SERIES ---
    {
      title: 'Reasoning Fundamentals',
      description: 'Deductive vs inductive reasoning, premises, and diagrammatic logic.',
      icon: 'bulb-outline',
      topics: [
        'Deductive vs Inductive Reasoning Principles',
        'Structure of Logical Arguments: Premise, Assumption, and Conclusion',
        'Visual and Diagrammatic Problem-Solving Frameworks',
        'Systematic Option Elimination Strategies in Logical Reasoning',
      ],
    },
    {
      title: 'Number Series',
      description: 'Arithmetic difference, geometric, square/cube, and alternating series.',
      icon: 'infinite-outline',
      topics: [
        'Arithmetic Progression & Constant Difference Series',
        'Double-Difference and Tri-Difference Triangular Patterns',
        'Geometric Series and Fractional Ratio Multipliers',
        'Square, Cube, and Power-Based Alternating Series',
        'Fibonacci Series and Cumulative Preceding Sum Patterns',
        'Mixed Operator Series (×2 + 1, ×3 - 2 Patterns)',
        'Wrong Number Identification in Complex Series',
      ],
    },
    {
      title: 'Alphabet & Alphanumeric Series',
      description: 'Alphabet positions, letter clusters, continuous patterns, and symbols.',
      icon: 'text-outline',
      topics: [
        'Alphabet Positions: Forward Order (1-26) and EJOTY Shortcut',
        'Reverse Alphabet Positions (Z=1 to A=26) and Opposites (A-Z, B-Y, C-X)',
        'Letter Skipping and Fixed Interval Series',
        'Letter Cluster Series: Three and Four Letter Shifting Groups',
        'Continuous Pattern Series: Filling Blanks in Repeating Substrings',
        'Alphanumeric Series: Blending Letters, Numbers, and Special Symbols',
      ],
    },
    {
      title: 'Coding and Decoding',
      description: 'Letter shifting, reverse substitution, number coding, and deciphering.',
      icon: 'lock-closed-outline',
      topics: [
        'Letter Shifting Ciphers (Forward and Backward Shifts)',
        'Reverse Alphabet Position Substitution Coding',
        'Direct Letter-to-Number and Position Sum Coding',
        'Fictitious Language / Chinese Coding Deciphering',
        'Conditional Coding and Matrix Based Coding Tables',
        'Substitution Ciphers: Color/Object Redefinition Puzzles',
      ],
    },
    {
      title: 'Analogy',
      description: 'Number, letter, semantic, and functional relationship analogies.',
      icon: 'git-compare-outline',
      topics: [
        'Number Analogies: Squares, Cubes, Primes, and Digits Sum',
        'Letter and Alphabetical Group Analogies',
        'Word and Semantic Meaning Relationships (Tool-Worker, Cause-Effect)',
        'Synonym and Antonym Semantic Analogies',
        'Country-Capital, Unit-Quantity, and Scientific Analogies',
      ],
    },
    {
      title: 'Classification & Odd One Out',
      description: 'Grouping by mathematical, semantic, and symbolic properties.',
      icon: 'funnel-outline',
      topics: [
        'Word Classification: Spotting the Semantic Outlier',
        'Number Classification: Prime vs Composite, Divisibility Rules, Powers',
        'Letter Group Classification: Difference in Position Values',
        'Figure and Non-Verbal Odd One Out Patterns',
      ],
    },

    // --- STAGE 2: RELATIONAL & SPATIAL REASONING ---
    {
      title: 'Blood Relations',
      description: 'Family tree diagrams, generational hierarchy, coded links, and statements.',
      icon: 'people-outline',
      topics: [
        'Family Relationships Fundamentals: Maternal vs Paternal Hierarchy',
        'Generation Levels, Marital Links, and Gender Marker Conventions',
        'Standard Family Tree Drawing Rules and Structural Diagrams',
        'Single-Person / Direct Blood Relations (Pointing to Photograph and Dialogue Riddles)',
        'Puzzle / Multi-Person Family Relationship Networks and Deduction',
        'Coded Blood Relations (A + B means Father, A - B means Sister)',
        'Complex Multi-Generational Family Relationship Networks',
        'Mixed Blood Relation Problems with Occupations and Attributes',
      ],
    },
    {
      title: 'Direction Sense',
      description: 'Cardinal/ordinal directions, angle turns, displacement, and shadows.',
      icon: 'compass-outline',
      topics: [
        'The 8 Cardinal and Ordinal Directions: N, S, E, W, NE, NW, SE, SW',
        'Clockwise and Anti-Clockwise Angle Turns (45°, 90°, 135°, 180°)',
        'Shortest Distance Calculation Using Pythagoras Theorem (a² + b² = c²)',
        'Shadow Direction Problems: Morning (Sunrise) vs Evening (Sunset)',
        'Coded Direction Sense Puzzles (P # Q means North, P @ Q means South)',
        'Multi-Point Waypoint Tracking and Final Position Determination',
      ],
    },
    {
      title: 'Ranking and Order',
      description: 'Total counts from ranks, overlapping positions, and attribute ranking.',
      icon: 'podium-outline',
      topics: [
        'Total Persons Formula from Left and Right Ranks: Total = L + R - 1',
        'Finding Rank from Opposite End When Total Count is Known',
        'Overlapping vs Non-Overlapping Position Scenarios and Minimum Persons',
        'Position Swapping Problems: Determining Total and New Ranks',
        'Comparison-Based Attribute Ranking (Heights, Marks, Speeds, Weights)',
      ],
    },
    {
      title: 'Syllogisms',
      description: 'Venn diagrams, premise rules, either-or pairs, and possibility cases.',
      icon: 'git-network-outline',
      topics: [
        'Standard Venn Diagram Representation of Categorical Propositions',
        'The 4 Universal Statements: All A are B, Some A are B, No A is B, Some A are not B',
        'Definite Conclusions vs Invalid Deductions',
        'Either-Or Complementary Pairs (All + Some Not, Some + No)',
        'Possibility and Can-Be Cases in Syllogistic Deductions',
        'Negative Conclusions and Reverse Syllogism Strategies',
      ],
    },
    {
      title: 'Inequalities',
      description: 'Mathematical inequality chains, either-or, and coded inequality symbols.',
      icon: 'code-outline',
      topics: [
        'Direct Inequality Chains and Precedence Rules (>, ≥, =)',
        'Combining Multiple Fragmented Inequality Statements',
        'Determining Definitely True, Definitely False, and Undetermined',
        'Either-Or and Neither-Nor Cases in Comparative Inequalities',
        'Coded Inequalities: Decoding Symbol Tables into Mathematical Operators',
      ],
    },

    // --- STAGE 3: ARRANGEMENTS & PUZZLES ---
    {
      title: 'Seating Arrangement: Linear',
      description: 'Single/parallel rows, North/South facing, and attribute binding.',
      icon: 'reorder-four-outline',
      topics: [
        'Linear Row Seating with All Individuals Facing Single Direction (North/South)',
        'Linear Row Seating with People Facing Opposite Directions (North and South)',
        'Parallel and Multi-Row Seating: Two Opposite Rows Facing Each Other',
        'Linear Seating Combined with Extra Attributes (Colors, Cities, Vehicles)',
        'Unknown Number of Persons in a Single Linear Row',
      ],
    },
    {
      title: 'Seating Arrangement: Circular & Polygon',
      description: 'Circular inward/outward facing, rectangular, and square tables.',
      icon: 'disc-outline',
      topics: [
        'Circular Table Seating with All Facing Inward (Towards Center)',
        'Circular Table Seating with All Facing Outward (Away from Center)',
        'Circular Table Seating with Mixed Facing (Some Inward, Some Outward)',
        'Square and Rectangular Table Seating: Corners vs Middle of Sides',
        'Triangular and Hexagonal Seating Configuration Puzzles',
        'Circular Seating Combined with Blood Relations and Occupations',
      ],
    },
    {
      title: 'Puzzles: Scheduling and Stacking',
      description: 'Floor and flat buildings, day/month calendars, and box ordering.',
      icon: 'calendar-outline',
      topics: [
        'Floor-Based Building Puzzles: Even/Odd Floors and Between Constraints',
        'Floor and Flat (2 Flats per Floor) Multi-Coordinate Puzzles',
        'Day and Month Scheduling Puzzles: Events on Specific Dates',
        'Box Stacking Sequence: Ordering Stacked Boxes by Constraints',
        'Age and Year of Birth Calculation Puzzles with Reference Base Years',
      ],
    },
    {
      title: 'Puzzles: Multi-Variable Matrix',
      description: 'Cross-attribute elimination grids for people, professions, and cities.',
      icon: 'grid-outline',
      topics: [
        'Matrix Elimination Grids for Three-Attribute Matching',
        'Matching People with Professions, Cities, and Favorite Subjects',
        'Puzzles with Conditional If-Then and Exclusion Rules',
        'Complex Synthesized Puzzles Blending Blood Relations, Colors, and Cars',
      ],
    },
    {
      title: 'Input-Output (Machine Rearrangement)',
      description: 'Step-by-step word and number shifting, alphabetical, and numerical rules.',
      icon: 'hardware-chip-outline',
      topics: [
        'Step-by-Step Word and Number Machine Rearrangement Mechanisms',
        'Single-End Shifting: Alphabetical Sorting and Ascending/Descending Numbers',
        'Double-End Shifting: Alternating Left and Right Manipulations',
        'Mathematical Operations on Digits at Each Processing Step',
        'Determining Number of Steps and Step N Contents from Initial Input',
      ],
    },
    {
      title: 'Logical Data Sufficiency',
      description: 'Evaluating sufficiency of premises for unique logical conclusions.',
      icon: 'help-circle-outline',
      topics: [
        'Evaluating Logical Premises: Independent vs Combined Sufficiency',
        'Blood Relations and Family Hierarchy Data Sufficiency',
        'Direction, Distance, and Spatial Position Data Sufficiency',
        'Seating Arrangement and Linear Order Data Sufficiency',
        'Avoiding Solving Fully: Identifying Redundant Information Quickly',
      ],
    },

    // --- STAGE 4: VERBAL & CRITICAL REASONING ---
    {
      title: 'Statement and Assumptions',
      description: 'Implicit vs explicit premises, valid assumptions, and common fallacies.',
      icon: 'cloud-outline',
      topics: [
        'Implicit vs Explicit Assumptions in Verbal Statements',
        'Valid Assumptions: Identifying Necessary Preconditions',
        'Avoiding Assumption Fallacies: Extreme Words (All, Only, Never)',
        'Advertisements, Public Notices, and Governmental Appeals Assumptions',
      ],
    },
    {
      title: 'Statement and Conclusions',
      description: 'Direct factual deductions, truth conditions, and avoiding bias.',
      icon: 'checkmark-circle-outline',
      topics: [
        'Direct Factual Deductions vs Unsubstantiated Guesses',
        'Truth Conditions: Deriving Only What is Strictly Guaranteed by the Text',
        'Distinguishing Between Probable Consequences and Definite Conclusions',
        'Avoiding Over-Generalization and Personal Knowledge Bias',
      ],
    },
    {
      title: 'Statement and Arguments',
      description: 'Strong vs weak arguments, objective facts, and logical fallacies.',
      icon: 'chatbubbles-outline',
      topics: [
        'Strong Arguments: Logical Cohesion, Evidence, and Real-World Impact',
        'Weak Arguments: Superfluous, Emotional, or Irrelevant Justifications',
        'Analyzing Public Policy, Economic, and Social Debate Questions',
        'Spotting Circular Arguments and Begging the Question Fallacies',
      ],
    },
    {
      title: 'Course of Action & Decision Making',
      description: 'Evaluating feasible remedies, root cause analysis, and selection grids.',
      icon: 'shield-outline',
      topics: [
        'Course of Action: Feasibility, Proportionality, and Timeliness',
        'Addressing Root Causes Without Creating Adverse Secondary Problems',
        'Decision Making: Evaluating Eligibility Criteria and Concession Rules',
        'Recruitment and Scholarship Candidate Selection Decision Flowcharts',
      ],
    },
    {
      title: 'Cause and Effect',
      description: 'Immediate vs principal causes, independent effects, and common roots.',
      icon: 'git-branch-outline',
      topics: [
        'Identifying Direct Cause and Direct Effect Relationships',
        'Differentiating Immediate Causes from Long-Term Principal Causes',
        'Common Cause Behind Multiple Independent Observable Effects',
        'Independent Causes vs Interlinked Sequential Effects',
      ],
    },
    {
      title: 'Non-Verbal & Visual Reasoning',
      description: 'Pattern completion, mirror images, paper folding, and dice folding.',
      icon: 'cube-outline',
      topics: [
        'Figure Pattern Completion and Matrix Grid Reasoning',
        'Mirror Images and Water Inversions of Letters, Numbers, and Shapes',
        'Paper Folding, Punching, and Unfolding Visualizations',
        'Embedded and Hidden Figures Identification in Complex Geometry',
        'Cube and Dice Unfolded Nets: Determining Opposite Faces',
      ],
    },
    {
      title: 'Logical Connectives & Critical Reasoning',
      description: 'Conditionals, truth-tellers and liars, and argument evaluation.',
      icon: 'prism-outline',
      topics: [
        'If-Then Conditionals, Converses, Inverses, and Contrapositive Rules',
        'Either-Or, Neither-Nor, and Bi-Conditional Logical Operators',
        'Knights and Knaves: Truth-Tellers, Liars, and Alternators Puzzles',
        'Strengthening and Weakening Arguments in Short Passages',
      ],
    },

    // --- STAGE 5: COMBINED REASONING PRACTICE (SECTION 5 OF SPEC) ---
    {
      title: 'Combined: Series, Coding & Relations',
      description: 'Synthesizing series, coding, blood relations, and directions.',
      icon: 'layers-outline',
      topics: [
        'Number Series + Alphabet Series Unified Pattern Tests',
        'Alphabet + Coding-Decoding Synthesized Puzzles',
        'Blood Relations + Directions Spatial Relationship Challenges',
        'Ranking + Seating Arrangement Hybrid Scenarios',
        'Seating + Direction Sense Combined Floor Maps',
        'Seating + Ranking + Blood Relations Comprehensive Grid',
      ],
    },
    {
      title: 'Combined: Logic, Deduction & Selection',
      description: 'Integrating syllogisms, assumptions, arguments, and matching.',
      icon: 'library-outline',
      topics: [
        'Syllogism + Venn Diagram Complex Propositions',
        'Statement + Assumption + Conclusion Critical Synthesis',
        'Statement + Argument + Critical Reasoning Paragraphs',
        'Scheduling + Selection Multi-Stage Decision Making',
        'Grouping + Matching Elimination Systems',
        'Constraint + Logical Deduction Advanced Puzzles',
      ],
    },
    {
      title: 'Combined: Analytical Synthesis',
      description: 'Multi-topic reasoning, input-output, and connectives integration.',
      icon: 'analytics-outline',
      topics: [
        'Puzzle + Seating + Ranking Multi-Tiered Challenges',
        'Input-Output + Series + Pattern Recognition Synergies',
        'Mathematical Reasoning + Logical Connectives Integration',
        'Multiple Analytical Reasoning Topics Combined Cases',
      ],
    },

    // --- STAGE 6: COMPANY-LEVEL REASONING PROGRESSION ---
    {
      title: 'Company-Level Reasoning: Levels 1 to 7',
      description: 'Progressive reasoning challenges up to full company-style tests.',
      icon: 'trophy-outline',
      topics: [
        'Level 1: Single-Topic Logical Precision Drills',
        'Level 2: Subtopic Blended Deductions',
        'Level 3: Two-Topic Combination Scenarios',
        'Level 4: Three-Topic Complex Cases',
        'Level 5: Multi-Topic Synthesis Caselets',
        'Level 6: Blind Unlabeled Logic Drills',
        'Level 7: Full Company-Style Speed Test (TCS NQT, Infosys, Cognizant, Wipro)',
      ],
    },
    {
      title: 'Full Mixed Reasoning',
      description: 'Comprehensive unlabeled reasoning tests with no chapter clues.',
      icon: 'ribbon-outline',
      topics: [
        'Full Mixed Reasoning: Set 1 (Blind Mixed Practice - No Topic Hints)',
        'Full Mixed Reasoning: Set 2 (Time-Pressured 45-Second Speed Drills)',
        'Full Mixed Reasoning: Set 3 (Corporate Technical Placement Assessment)',
        'Full Mixed Reasoning: Set 4 (Advanced Product Company Logic Puzzles)',
      ],
    },
  ],
};
