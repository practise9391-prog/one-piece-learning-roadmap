import { ExecutionResult } from '../../models/PracticeTask';
import { ExecutionProvider } from './types';

/**
 * RemoteExecutionProvider: Connects to a secure, isolated remote code runner
 * (e.g. Judge0 or custom sandboxed runner). Never exposes credentials in client.
 */
export class RemoteExecutionProvider implements ExecutionProvider {
  name = 'RemoteExecutionProvider';
  private endpoint: string | null = null;

  constructor(endpoint?: string) {
    if (endpoint) {
      this.endpoint = endpoint;
    }
  }

  setEndpoint(url: string | null) {
    this.endpoint = url;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.endpoint) return false;
    try {
      const response = await fetch(`${this.endpoint}/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async execute(
    language: string,
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    if (!this.endpoint) {
      return {
        status: 'UNSUPPORTED_LANGUAGE',
        stdout: '',
        stderr: '',
        exitCode: 1,
        executionTime: 0,
        memoryUsed: 0,
        errorMessage: 'Code execution is currently unavailable. Please connect to the execution service.',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeLimitMs + 1000);

      const response = await fetch(`${this.endpoint}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          source_code: sourceCode,
          stdin: input,
          time_limit_ms: timeLimitMs,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'SYSTEM_ERROR',
          stdout: '',
          stderr: `Server error HTTP ${response.status}`,
          exitCode: response.status,
          executionTime: 0,
          memoryUsed: 0,
          errorMessage: `Remote execution failed: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        status: data.status || 'SUCCESS',
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: data.exit_code ?? 0,
        executionTime: data.execution_time ?? 0,
        memoryUsed: data.memory_used ?? 0,
        errorMessage: data.error_message,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          status: 'TIME_LIMIT',
          stdout: '',
          stderr: 'Execution timed out',
          exitCode: 124,
          executionTime: timeLimitMs / 1000,
          memoryUsed: 0,
          errorMessage: 'Time limit exceeded.',
        };
      }
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: err.message || 'Network connection error',
        exitCode: 1,
        executionTime: 0,
        memoryUsed: 0,
        errorMessage: 'Unable to reach remote execution server.',
      };
    }
  }
}
