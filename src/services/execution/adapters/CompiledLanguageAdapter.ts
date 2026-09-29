import { LanguageAdapter } from './BaseLanguageAdapter';
import { ExecutionResult } from '../../../models/PracticeTask';
import { ExecutionTrace, FlowchartNode } from '../../../models/Debugger';
import { RemoteExecutionProvider } from '../RemoteExecutionProvider';

export abstract class CompiledLanguageAdapter implements LanguageAdapter {
  abstract readonly language: string;
  abstract readonly displayName: string;
  abstract readonly isExecutable: boolean;
  readonly executionEnvironment = 'REMOTE_CONTAINER' as const;

  protected remoteProvider = new RemoteExecutionProvider();

  async execute(
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    const isAvailable = await this.remoteProvider.isAvailable();
    if (isAvailable) {
      return this.remoteProvider.execute(this.language, sourceCode, input, timeLimitMs);
    }

    return {
      status: 'UNSUPPORTED_LANGUAGE',
      stdout: '',
      stderr: `[${this.displayName}]: Editing is fully supported. Compiled bytecode/native execution requires an active remote runner connection.`,
      exitCode: 1,
      executionTime: 0,
      memoryUsed: 0,
      errorMessage: `Execution for ${this.displayName} requires a remote sandbox runner.`,
    };
  }

  async debug(sourceCode: string, input: string = ''): Promise<ExecutionTrace> {
    const lines = sourceCode.split('\n');
    const flowchartNodes: FlowchartNode[] = [
      { id: 'fc_start', label: 'START', type: 'START', line: 1 },
    ];

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
      if (trimmed.includes('class ') || trimmed.includes('main(')) {
        flowchartNodes.push({ id: `fc_${lineNum}`, label: trimmed, type: 'STATEMENT', line: lineNum });
      }
    });

    flowchartNodes.push({ id: 'fc_end', label: 'END', type: 'END', line: lines.length });

    return {
      steps: [
        {
          stepNumber: 1,
          sourceLine: 1,
          operation: 'SYNTAX_PARSED',
          explanation: `${this.displayName} source code loaded. Code editor and syntax inspection active.`,
          variables: {},
          memory: {},
          callStack: [],
          stdout: '',
          events: [],
        },
      ],
      totalSteps: 1,
      output: `[${this.displayName}] Editing Available. Connect remote runner for live native execution.`,
      status: 'UNSUPPORTED_LANGUAGE',
      executionTimeMs: 10,
      flowchartNodes,
      phases: [],
    };
  }
}

export class JavaAdapter extends CompiledLanguageAdapter {
  readonly language = 'java';
  readonly displayName = 'Java 17 (OpenJDK)';
  readonly isExecutable = false;
}

export class CAdapter extends CompiledLanguageAdapter {
  readonly language = 'c';
  readonly displayName = 'C (GCC)';
  readonly isExecutable = false;
}

export class CppAdapter extends CompiledLanguageAdapter {
  readonly language = 'cpp';
  readonly displayName = 'C++ (G++ 17)';
  readonly isExecutable = false;
}
