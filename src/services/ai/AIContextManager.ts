import { AIContextPayload } from '../../models/AIAssistant';

/**
 * Part 7 — Global AI Context Manager
 * Central service that tracks where the learner is across:
 * Courses, Topics, Compiler, Visual Debugger, Practice, Algorithm Labs,
 * React modules, and System Design architecture.
 *
 * Ensures AI receives accurate, contextual state WITHOUT requiring the learner
 * to copy-paste context or sending the entire app state over the wire.
 */
export class AIContextManager {
  private static instance: AIContextManager | null = null;
  private currentContext: AIContextPayload = {
    source: 'TOPIC',
  };

  private constructor() {}

  public static getInstance(): AIContextManager {
    if (!AIContextManager.instance) {
      AIContextManager.instance = new AIContextManager();
    }
    return AIContextManager.instance;
  }

  public setContext(context: Partial<AIContextPayload>): void {
    this.currentContext = {
      ...this.currentContext,
      ...context,
    };
  }

  public updateContext(updates: Partial<AIContextPayload>): void {
    this.currentContext = {
      ...this.currentContext,
      ...updates,
    };
  }

  public getContext(): AIContextPayload {
    return { ...this.currentContext };
  }

  public clearContext(): void {
    this.currentContext = {
      source: 'TOPIC',
    };
  }

  // --- Convenience Subsystem Binders ---

  public setTopicContext(params: {
    courseId?: string;
    moduleId?: string;
    topicId?: string;
    topicTitle: string;
    currentSection?: string;
    explanationText?: string;
    exampleCode?: string;
  }): void {
    this.currentContext = {
      source: 'TOPIC',
      courseId: params.courseId,
      moduleId: params.moduleId,
      topicId: params.topicId,
      topicTitle: params.topicTitle,
      currentSection: params.currentSection,
      explanationText: params.explanationText?.slice(0, 300), // minimal excerpt
      exampleCode: params.exampleCode,
    };
  }

  public setCompilerContext(params: {
    language: string;
    code: string;
    output?: string;
    error?: string;
    executionStatus?: string;
    activeLineNumber?: number;
    topicTitle?: string;
  }): void {
    this.currentContext = {
      ...this.currentContext,
      source: 'COMPILER',
      language: params.language,
      code: params.code,
      output: params.output,
      error: params.error,
      executionStatus: params.executionStatus,
      activeLineNumber: params.activeLineNumber,
      topicTitle: params.topicTitle || this.currentContext.topicTitle,
    };
  }

  public setDebuggerContext(params: {
    language: string;
    code: string;
    activeLineNumber: number;
    currentStepIndex: number;
    totalSteps: number;
    currentStepOperation?: string;
    variables?: Record<string, any>;
    callStack?: string[];
    loopState?: { variable: string; iteration: number; condition: string };
    conditionState?: { condition: string; result: boolean; branchTaken: string };
    output?: string;
    error?: string;
    topicTitle?: string;
  }): void {
    this.currentContext = {
      ...this.currentContext,
      source: 'DEBUGGER',
      language: params.language,
      code: params.code,
      activeLineNumber: params.activeLineNumber,
      currentStepIndex: params.currentStepIndex,
      totalSteps: params.totalSteps,
      currentStepOperation: params.currentStepOperation,
      variables: params.variables,
      callStack: params.callStack,
      loopState: params.loopState,
      conditionState: params.conditionState,
      output: params.output,
      error: params.error,
      topicTitle: params.topicTitle || this.currentContext.topicTitle,
    };
  }

  public setPracticeContext(params: {
    questionTitle: string;
    questionDescription: string;
    userCode: string;
    language: string;
    failedTestCase?: { input: string; expected: string; actual: string };
    hintsGiven?: string[];
  }): void {
    this.currentContext = {
      ...this.currentContext,
      source: 'PRACTICE',
      questionTitle: params.questionTitle,
      questionDescription: params.questionDescription,
      code: params.userCode,
      language: params.language,
      failedTestCase: params.failedTestCase,
      hintsGiven: params.hintsGiven,
    };
  }

  public setAlgorithmContext(params: {
    algorithmName: string;
    pointers?: Record<string, any>;
    complexityBest?: string;
    complexityWorst?: string;
    code?: string;
  }): void {
    this.currentContext = {
      ...this.currentContext,
      source: 'ALGORITHM',
      algorithmName: params.algorithmName,
      algorithmPointers: params.pointers,
      complexityBest: params.complexityBest,
      complexityWorst: params.complexityWorst,
      code: params.code,
    };
  }

  public setReactContext(params: {
    reactComponent: string;
    reactHook?: string;
    code?: string;
    error?: string;
  }): void {
    this.currentContext = {
      ...this.currentContext,
      source: 'REACT',
      reactComponent: params.reactComponent,
      reactHook: params.reactHook,
      code: params.code,
      error: params.error,
    };
  }

  public setSystemDesignContext(params: {
    topicTitle: string;
    components?: string[];
    tradeOffs?: string;
  }): void {
    this.currentContext = {
      ...this.currentContext,
      source: 'SYSTEM_DESIGN',
      topicTitle: params.topicTitle,
      systemArchitectureComponents: params.components,
      systemTradeOffs: params.tradeOffs,
    };
  }

  /**
   * Builds a concise, structured prompt prefix describing the active context
   * according to user privacy settings.
   */
  public formatPromptWithContext(
    userQuestion: string,
    privacySettings: { sendCodeToAI: boolean; shareCourseContext: boolean }
  ): string {
    const ctx = this.currentContext;
    const parts: string[] = [];

    parts.push(`User Query: "${userQuestion}"\n`);
    parts.push(`[Active Learning Environment Context]`);
    parts.push(`Source: ${ctx.source}`);

    if (privacySettings.shareCourseContext) {
      if (ctx.topicTitle) parts.push(`Topic: ${ctx.topicTitle}`);
      if (ctx.courseId) parts.push(`Course: ${ctx.courseId}`);
      if (ctx.currentSection) parts.push(`Current Section: ${ctx.currentSection}`);
    }

    if (ctx.source === 'DEBUGGER') {
      parts.push(`Current Line: ${ctx.activeLineNumber || 1}`);
      parts.push(`Step: ${(ctx.currentStepIndex ?? 0) + 1} of ${ctx.totalSteps ?? 1}`);
      if (ctx.currentStepOperation) parts.push(`Operation: ${ctx.currentStepOperation}`);
      if (ctx.variables) parts.push(`Real Scope Variables: ${JSON.stringify(ctx.variables)}`);
      if (ctx.callStack && ctx.callStack.length > 0) parts.push(`Call Stack: ${ctx.callStack.join(' -> ')}`);
      if (ctx.loopState) parts.push(`Loop State: ${ctx.loopState.variable} iteration ${ctx.loopState.iteration}`);
      if (ctx.conditionState) parts.push(`Condition Evaluated: "${ctx.conditionState.condition}" = ${ctx.conditionState.result ? 'TRUE' : 'FALSE'}`);
    }

    if (ctx.source === 'PRACTICE' && ctx.failedTestCase) {
      parts.push(`Failed Test Case Input: ${ctx.failedTestCase.input}`);
      parts.push(`Expected Output: ${ctx.failedTestCase.expected}`);
      parts.push(`Actual Output: ${ctx.failedTestCase.actual}`);
    }

    if (ctx.source === 'ALGORITHM' && ctx.algorithmName) {
      parts.push(`Algorithm: ${ctx.algorithmName}`);
      if (ctx.algorithmPointers) parts.push(`Live Pointers: ${JSON.stringify(ctx.algorithmPointers)}`);
    }

    if (ctx.source === 'REACT') {
      if (ctx.reactComponent) parts.push(`React Component: ${ctx.reactComponent}`);
      if (ctx.reactHook) parts.push(`React Hook: ${ctx.reactHook}`);
    }

    if (ctx.source === 'SYSTEM_DESIGN') {
      if (ctx.systemArchitectureComponents) {
        parts.push(`Architecture Nodes: ${ctx.systemArchitectureComponents.join(', ')}`);
      }
      if (ctx.systemTradeOffs) parts.push(`Trade-Off Focus: ${ctx.systemTradeOffs}`);
    }

    if (privacySettings.sendCodeToAI && ctx.code) {
      parts.push(`\n[Code (${ctx.language || 'code'})]:\n${ctx.code.slice(0, 1500)}`);
      if (ctx.output) parts.push(`\n[Execution Output]:\n${ctx.output.slice(0, 500)}`);
      if (ctx.error) parts.push(`\n[Runtime Error]:\n${ctx.error}`);
    } else if (!privacySettings.sendCodeToAI) {
      parts.push(`[Note: Code Sharing is disabled by learner in Privacy Settings. Analyze conceptually without raw code.]`);
    }

    return parts.join('\n');
  }
}

export const aiContextManager = AIContextManager.getInstance();
