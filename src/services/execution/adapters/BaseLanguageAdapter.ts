import { ExecutionResult } from '../../../models/PracticeTask';
import { ExecutionTrace } from '../../../models/Debugger';

export interface LanguageAdapter {
  readonly language: string;
  readonly displayName: string;
  readonly isExecutable: boolean;
  readonly executionEnvironment: 'LOCAL_SANDBOX' | 'SQLITE_SANDBOX' | 'REMOTE_CONTAINER';

  execute(sourceCode: string, input?: string, timeLimitMs?: number): Promise<ExecutionResult>;
  debug(sourceCode: string, input?: string): Promise<ExecutionTrace>;
}
