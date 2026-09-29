import { ExecutionResult } from '../../models/PracticeTask';

export interface ExecutionProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  execute(
    language: string,
    sourceCode: string,
    input?: string,
    timeLimitMs?: number
  ): Promise<ExecutionResult>;
}
