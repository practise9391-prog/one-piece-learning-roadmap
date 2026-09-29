/**
 * Part 6 — Personal Code Compiler, Visual Debugger & Execution Engine
 * Core Data Models & Types
 */

export type StandardVisualizationEventType =
  | 'VARIABLE_CREATED'
  | 'VARIABLE_UPDATED'
  | 'VARIABLE_READ'
  | 'VARIABLE_DELETED'
  | 'ARRAY_CREATED'
  | 'ARRAY_ELEMENT_READ'
  | 'ARRAY_ELEMENT_UPDATED'
  | 'FUNCTION_CALLED'
  | 'FUNCTION_RETURNED'
  | 'CONDITION_CHECKED'
  | 'BRANCH_ENTERED'
  | 'LOOP_STARTED'
  | 'LOOP_ITERATION'
  | 'LOOP_ENDED'
  | 'EXPRESSION_STARTED'
  | 'OPERATION_EXECUTED'
  | 'RESULT_CREATED'
  | 'OUTPUT_PRINTED'
  | 'ERROR_OCCURRED';

export interface StandardVisualizationEvent {
  type: StandardVisualizationEventType;
  line: number;
  name?: string;
  value?: any;
  previousValue?: any;
  valueType?: string;
  expression?: string;
  result?: any;
  condition?: string;
  branch?: 'TRUE' | 'FALSE';
  iteration?: number;
  functionName?: string;
  args?: Record<string, any>;
  arrayIndex?: number;
  message?: string;
}

export interface VariableSnapshot {
  name: string;
  value: any;
  type: string;
  isUpdated?: boolean;
  isCreated?: boolean;
  previousValue?: any;
}

export interface CallStackFrame {
  id: string;
  functionName: string;
  line: number;
  arguments: Record<string, any>;
  localVariables: Record<string, any>;
  returnValue?: any;
}

export interface RecursionNode {
  id: string;
  functionName: string;
  args: Record<string, any>;
  depth: number;
  returnValue?: any;
  children: RecursionNode[];
  isCurrent?: boolean;
  isBaseCase?: boolean;
}

export interface FlowchartNode {
  id: string;
  label: string;
  type: 'START' | 'STATEMENT' | 'DECISION' | 'LOOP' | 'CALL' | 'OUTPUT' | 'END';
  line: number;
  active?: boolean;
  next?: string;
  falseNext?: string;
}

export interface ExecutionPhase {
  id: string;
  title: string;
  startStep: number;
  endStep: number;
  type: 'INPUT' | 'INIT' | 'MAIN' | 'LOOP' | 'CONDITION' | 'FUNCTION' | 'RESULT';
}

export interface DataStructureState {
  kind: 'ARRAY' | 'STACK' | 'QUEUE' | 'BINARY_SEARCH' | 'DICT' | 'LINKED_LIST';
  name: string;
  items: any[];
  pointers?: Record<string, number>; // e.g. { low: 0, mid: 2, high: 5 }
  activeIndices?: number[];
  swappedIndices?: [number, number];
}

export interface ExecutionStep {
  stepNumber: number;
  sourceLine: number;
  operation: string;
  explanation: string;
  variables: Record<string, VariableSnapshot>;
  memory: Record<string, any>;
  callStack: CallStackFrame[];
  recursionTree?: RecursionNode;
  activeBranch?: 'TRUE' | 'FALSE' | null;
  loopState?: {
    loopVariable: string;
    iteration: number;
    condition: string;
    isFinished?: boolean;
  };
  expressionEvaluation?: {
    expression: string;
    operands: { name: string; value: any }[];
    calculation: string;
    result: any;
    targetVariable?: string;
  };
  dataStructureState?: DataStructureState;
  flowchartNodeId?: string;
  stdout: string;
  events: StandardVisualizationEvent[];
}

export interface ExecutionTrace {
  steps: ExecutionStep[];
  totalSteps: number;
  output: string;
  error?: string;
  errorLine?: number;
  errorDetails?: {
    type: string;
    message: string;
    whatHappened: string;
    whyItHappened: string;
    investigationHint: string;
  };
  status: 'SUCCESS' | 'RUNTIME_ERROR' | 'TIME_LIMIT' | 'MEMORY_LIMIT' | 'UNSUPPORTED_LANGUAGE';
  executionTimeMs: number;
  flowchartNodes: FlowchartNode[];
  phases: ExecutionPhase[];
}

export type LearningMode = 'NORMAL' | 'LEARNING' | 'DEBUG' | 'INTERVIEW';

export interface SavedCodeSnippet {
  id: string;
  title: string;
  user_id: string;
  course_id?: string;
  topic_id?: string;
  task_id?: string;
  language: string;
  code: string;
  learning_mode: LearningMode;
  created_at: string;
  updated_at: string;
}

export interface PersistentDebugSession {
  id: string;
  user_id: string;
  task_id?: string;
  topic_id?: string;
  course_id?: string;
  language: string;
  code: string;
  current_step: number;
  total_steps: number;
  trace_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface AIStructuredCommand {
  command:
    | 'EXPLAIN'
    | 'DEBUG'
    | 'HIGHLIGHT_LINE'
    | 'CREATE_VARIABLE'
    | 'UPDATE_VARIABLE'
    | 'SHOW_MEMORY'
    | 'SHOW_CALCULATION'
    | 'SHOW_FLOW'
    | 'SHOW_OUTPUT'
    | 'SHOW_ERROR'
    | 'SHOW_APPROACH';
  line?: number;
  variable?: string;
  value?: any;
  explanation?: string;
  approach?: string;
}
