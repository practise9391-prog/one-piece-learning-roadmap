import {
  ExecutionResult,
  TaskTestCase,
  TestRunResult,
  SubmissionEvaluationResult,
  TaskSubmission,
} from '../../models/PracticeTask';
import { ExecutionProvider } from './types';
import { RemoteExecutionProvider } from './RemoteExecutionProvider';
import { IsolatedSqlExecutionProvider } from './IsolatedSqlExecutionProvider';
import { MockExecutionProvider } from './MockExecutionProvider';
import { generateId } from '../../utils/idGenerator';
import { getCurrentTimestamp } from '../../utils/dateUtils';

import { adapterRegistry } from './adapters';
import { ExecutionTrace } from '../../models/Debugger';

export class CodeExecutionService {
  private static instance: CodeExecutionService;
  private remoteProvider: RemoteExecutionProvider;
  private sqlProvider: IsolatedSqlExecutionProvider;
  private mockProvider: MockExecutionProvider;
  private useMock: boolean = false;

  private constructor() {
    this.remoteProvider = new RemoteExecutionProvider();
    this.sqlProvider = new IsolatedSqlExecutionProvider();
    this.mockProvider = new MockExecutionProvider();
  }

  static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService();
    }
    return CodeExecutionService.instance;
  }

  setUseMock(enabled: boolean) {
    this.useMock = enabled;
  }

  getMockProvider(): MockExecutionProvider {
    return this.mockProvider;
  }

  setRemoteEndpoint(url: string | null) {
    this.remoteProvider.setEndpoint(url);
  }

  getProvider(language: string): ExecutionProvider {
    if (this.useMock) {
      return this.mockProvider;
    }
    const cleanLang = language.toLowerCase();
    if (cleanLang === 'sql' || cleanLang === 'sqlite') {
      return this.sqlProvider;
    }
    return this.remoteProvider;
  }

  /**
   * Generates a step-by-step ExecutionTrace for visual debugging.
   */
  async debug(
    language: string,
    sourceCode: string,
    input: string = ''
  ): Promise<ExecutionTrace> {
    const adapter = adapterRegistry.getAdapter(language);
    return adapter.debug(sourceCode, input);
  }

  /**
   * Executes source code with custom input.
   */
  async execute(
    language: string,
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    if (!sourceCode || sourceCode.trim().length === 0) {
      return {
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: 'Source code cannot be empty.',
        exitCode: 1,
        executionTime: 0,
        memoryUsed: 0,
        errorMessage: 'Please enter code before running.',
      };
    }

    if (this.useMock) {
      return this.mockProvider.execute(language, sourceCode, input, timeLimitMs);
    }

    const adapter = adapterRegistry.getAdapter(language);

    // Timeout safety wrapper
    const timeoutPromise = new Promise<ExecutionResult>((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'TIME_LIMIT',
          stdout: '',
          stderr: `Time Limit Exceeded (${(timeLimitMs / 1000).toFixed(1)}s)`,
          exitCode: 124,
          executionTime: timeLimitMs / 1000,
          memoryUsed: 0,
          errorMessage: 'Execution timed out. Check for infinite loops.',
        });
      }, timeLimitMs + 500);
    });

    return Promise.race([adapter.execute(sourceCode, input, timeLimitMs), timeoutPromise]);
  }

  /**
   * Normalizes output strings for fair comparison (trims trailing whitespace/newlines).
   */
  normalizeOutput(output: string): string {
    return output
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim();
  }

  /**
   * Runs the code against a list of test cases (visible or hidden).
   */
  async runTestCases(
    language: string,
    sourceCode: string,
    testCases: TaskTestCase[]
  ): Promise<TestRunResult[]> {
    const results: TestRunResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execResult = await this.execute(language, sourceCode, tc.input, tc.timeout_ms || 2000);

      const normalizedActual = this.normalizeOutput(execResult.stdout);
      const normalizedExpected = this.normalizeOutput(tc.expected_output);

      const passed =
        execResult.status === 'SUCCESS' && normalizedActual === normalizedExpected;

      results.push({
        testCaseId: tc.id,
        index: i + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: execResult.stdout,
        passed,
        isHidden: tc.is_hidden,
        executionTimeMs: Math.round(execResult.executionTime * 1000),
        errorMessage: execResult.status !== 'SUCCESS' ? execResult.stderr || execResult.errorMessage : undefined,
      });

      // If critical compile or system error, stop executing subsequent tests early
      if (execResult.status === 'COMPILE_ERROR' || execResult.status === 'SYSTEM_ERROR') {
        break;
      }
    }

    return results;
  }

  /**
   * Submits a coding solution: runs all visible + hidden test cases,
   * calculates score, and constructs the submission record.
   */
  async evaluateSubmission(
    taskId: string,
    language: string,
    sourceCode: string,
    testCases: TaskTestCase[]
  ): Promise<SubmissionEvaluationResult> {
    const results = await this.runTestCases(language, sourceCode, testCases);
    const passedTests = results.filter((r) => r.passed).length;
    const totalTests = testCases.length;
    const allPassed = passedTests === totalTests && totalTests > 0;

    let status: TaskSubmission['status'] = 'WRONG_ANSWER';
    let failedIndex: number | null = null;
    let errorMessage: string | null = null;

    if (allPassed) {
      status = 'ACCEPTED';
    } else {
      const failedResult = results.find((r) => !r.passed);
      if (failedResult) {
        failedIndex = failedResult.index;
        errorMessage = failedResult.errorMessage || null;
        if (failedResult.errorMessage?.toLowerCase().includes('time limit')) {
          status = 'TIME_LIMIT_EXCEEDED';
        } else if (failedResult.errorMessage?.toLowerCase().includes('syntax') || failedResult.errorMessage?.toLowerCase().includes('compile')) {
          status = 'COMPILE_ERROR';
        } else if (failedResult.errorMessage?.toLowerCase().includes('error')) {
          status = 'RUNTIME_ERROR';
        } else {
          status = 'WRONG_ANSWER';
        }
      }
    }

    const totalTimeMs = results.reduce((sum, r) => sum + r.executionTimeMs, 0);
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    const submission: TaskSubmission = {
      id: generateId('sub'),
      task_id: taskId,
      user_id: 'default_user',
      language,
      source_code: sourceCode,
      status,
      passed_tests: passedTests,
      total_tests: totalTests,
      score,
      execution_time_ms: totalTimeMs,
      memory_used_kb: 10240,
      failed_test_index: failedIndex,
      revealed_failed_test: false,
      error_message: errorMessage,
      submitted_at: getCurrentTimestamp(),
    };

    return {
      submission,
      results,
      allPassed,
    };
  }
}

export const codeExecutionService = CodeExecutionService.getInstance();
