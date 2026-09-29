import { LanguageAdapter } from './BaseLanguageAdapter';
import { ExecutionResult } from '../../../models/PracticeTask';
import { ExecutionTrace } from '../../../models/Debugger';
import { executionTraceEngine } from '../trace/ExecutionTraceEngine';

export class PythonAdapter implements LanguageAdapter {
  readonly language = 'python';
  readonly displayName = 'Python 3';
  readonly isExecutable = true;
  readonly executionEnvironment = 'LOCAL_SANDBOX' as const;

  async execute(
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      const trace = executionTraceEngine.tracePython(sourceCode, {
        timeLimitMs,
        input,
      });

      const elapsedSec = (Date.now() - startTime) / 1000;
      return {
        status: trace.status === 'SUCCESS' ? 'SUCCESS' : 'RUNTIME_ERROR',
        stdout: trace.output,
        stderr: trace.error || '',
        exitCode: trace.status === 'SUCCESS' ? 0 : 1,
        executionTime: Math.max(elapsedSec, 0.012),
        memoryUsed: 12400,
        errorMessage: trace.error,
      };
    } catch (err: any) {
      return {
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: err?.message || 'Execution error',
        exitCode: 1,
        executionTime: (Date.now() - startTime) / 1000,
        memoryUsed: 0,
        errorMessage: err?.message || 'Failed to execute Python program.',
      };
    }
  }

  async debug(sourceCode: string, input: string = ''): Promise<ExecutionTrace> {
    return executionTraceEngine.tracePython(sourceCode, { input });
  }
}
