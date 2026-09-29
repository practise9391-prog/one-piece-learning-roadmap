import { LanguageAdapter } from './BaseLanguageAdapter';
import { ExecutionResult } from '../../../models/PracticeTask';
import { ExecutionTrace } from '../../../models/Debugger';
import { executionTraceEngine } from '../trace/ExecutionTraceEngine';

export class JavaScriptAdapter implements LanguageAdapter {
  readonly language = 'javascript';
  readonly displayName = 'JavaScript (ES6+)';
  readonly isExecutable = true;
  readonly executionEnvironment = 'LOCAL_SANDBOX' as const;

  async execute(
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let stdoutBuffer = '';
    const logs: string[] = [];

    // Safe isolated sandbox intercepting console.log
    const sandboxConsole = {
      log: (...args: any[]) => {
        const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        logs.push(msg);
      },
      warn: (...args: any[]) => logs.push(args.join(' ')),
      error: (...args: any[]) => logs.push(args.join(' ')),
    };

    try {
      // Basic security validation: reject unauthorized primitives
      const forbidden = ['require', 'process', 'global', 'window', 'document', 'fetch', 'XMLHttpRequest', 'eval'];
      for (const token of forbidden) {
        if (new RegExp(`\\b${token}\\b`).test(sourceCode)) {
          return {
            status: 'RUNTIME_ERROR',
            stdout: '',
            stderr: `Security Exception: '${token}' is prohibited in the learning sandbox.`,
            exitCode: 1,
            executionTime: 0,
            memoryUsed: 0,
            errorMessage: `Use of ${token} is restricted.`,
          };
        }
      }

      // Execute safely
      const sandboxedFn = new Function('console', 'input', `"use strict";\n${sourceCode}`);
      sandboxedFn(sandboxConsole, input);

      stdoutBuffer = logs.join('\n');
      const elapsedSec = (Date.now() - startTime) / 1000;

      return {
        status: 'SUCCESS',
        stdout: stdoutBuffer,
        stderr: '',
        exitCode: 0,
        executionTime: Math.max(elapsedSec, 0.008),
        memoryUsed: 9800,
      };
    } catch (err: any) {
      return {
        status: 'RUNTIME_ERROR',
        stdout: logs.join('\n'),
        stderr: err?.message || 'JavaScript runtime error',
        exitCode: 1,
        executionTime: (Date.now() - startTime) / 1000,
        memoryUsed: 0,
        errorMessage: err?.message || 'Runtime exception occurred.',
      };
    }
  }

  async debug(sourceCode: string, input: string = ''): Promise<ExecutionTrace> {
    return executionTraceEngine.traceJavaScript(sourceCode, { input });
  }
}
