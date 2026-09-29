import { ExecutionResult } from '../../models/PracticeTask';
import { ExecutionProvider } from './types';

/**
 * MockExecutionProvider: Test-only provider to simulate execution during automated testing.
 * Never used in production to pretend a compiler exists.
 */
export class MockExecutionProvider implements ExecutionProvider {
  name = 'MockExecutionProvider';
  private simulatedMode: 'AUTO' | 'SUCCESS' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT' = 'AUTO';

  setSimulatedMode(mode: 'AUTO' | 'SUCCESS' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT') {
    this.simulatedMode = mode;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async execute(
    language: string,
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    if (this.simulatedMode === 'TIME_LIMIT') {
      return {
        status: 'TIME_LIMIT',
        stdout: '',
        stderr: 'Time Limit Exceeded (> 2.0s)',
        exitCode: 124,
        executionTime: 2.01,
        memoryUsed: 14200,
        errorMessage: 'Execution timed out.',
      };
    }

    if (this.simulatedMode === 'RUNTIME_ERROR') {
      return {
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: 'IndexError: list index out of range\n  at line 4 in <module>',
        exitCode: 1,
        executionTime: 0.05,
        memoryUsed: 8400,
        errorMessage: 'IndexError: list index out of range',
      };
    }

    if (this.simulatedMode === 'WRONG_ANSWER') {
      return {
        status: 'SUCCESS',
        stdout: 'WRONG_OUTPUT_TEST',
        stderr: '',
        exitCode: 0,
        executionTime: 0.08,
        memoryUsed: 9200,
      };
    }

    if (this.simulatedMode === 'SUCCESS') {
      return {
        status: 'SUCCESS',
        stdout: input.trim(),
        stderr: '',
        exitCode: 0,
        executionTime: 0.12,
        memoryUsed: 10400,
      };
    }

    // AUTO Mode: Deterministic emulation for standard test problems
    const cleanInput = input.trim();
    let simulatedOutput = '';

    if (sourceCode.includes('reverse') || sourceCode.includes('[::-1]')) {
      simulatedOutput = cleanInput.split('').reverse().join('');
    } else if (sourceCode.includes('len(') || sourceCode.includes('.length')) {
      simulatedOutput = cleanInput.length.toString();
    } else if (sourceCode.includes('upper(') || sourceCode.includes('.toUpperCase()')) {
      simulatedOutput = cleanInput.toUpperCase();
    } else if (sourceCode.includes('lower(') || sourceCode.includes('.toLowerCase()')) {
      simulatedOutput = cleanInput.toLowerCase();
    } else if (cleanInput.includes(' ') && !isNaN(Number(cleanInput.split(' ')[0]))) {
      // Sum of numbers
      const parts = cleanInput.split(/\s+/).map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        simulatedOutput = (parts[0] + parts[1]).toString();
      } else {
        simulatedOutput = cleanInput;
      }
    } else {
      simulatedOutput = cleanInput;
    }

    return {
      status: 'SUCCESS',
      stdout: simulatedOutput,
      stderr: '',
      exitCode: 0,
      executionTime: 0.15,
      memoryUsed: 11200,
    };
  }
}
