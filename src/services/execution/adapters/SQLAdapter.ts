import { LanguageAdapter } from './BaseLanguageAdapter';
import { ExecutionResult } from '../../../models/PracticeTask';
import { ExecutionTrace, FlowchartNode, ExecutionStep } from '../../../models/Debugger';
import { IsolatedSqlExecutionProvider } from '../IsolatedSqlExecutionProvider';

export class SQLAdapter implements LanguageAdapter {
  readonly language = 'sql';
  readonly displayName = 'SQL (SQLite)';
  readonly isExecutable = true;
  readonly executionEnvironment = 'SQLITE_SANDBOX' as const;

  private sqlProvider = new IsolatedSqlExecutionProvider();

  async execute(
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    return this.sqlProvider.execute('sql', sourceCode, input, timeLimitMs);
  }

  async debug(sourceCode: string, input: string = ''): Promise<ExecutionTrace> {
    const startTime = Date.now();
    const result = await this.execute(sourceCode, input);

    const flowchartNodes: FlowchartNode[] = [
      { id: 'fc_start', label: 'START QUERY', type: 'START', line: 1 },
      { id: 'fc_parse', label: 'PARSE SQL CLAUSES', type: 'STATEMENT', line: 1 },
      { id: 'fc_from', label: 'IDENTIFY FROM TABLE', type: 'STATEMENT', line: 1 },
      { id: 'fc_exec', label: 'EXECUTE DB SCAN', type: 'CALL', line: 1 },
      { id: 'fc_out', label: 'PROJECT RESULT ROWS', type: 'OUTPUT', line: 1 },
      { id: 'fc_end', label: 'END', type: 'END', line: 1 },
    ];

    const steps: ExecutionStep[] = [
      {
        stepNumber: 1,
        sourceLine: 1,
        operation: 'SQL_PARSED',
        explanation: `Query parsed: ${sourceCode.trim().slice(0, 60)}...`,
        variables: {},
        memory: {},
        callStack: [{ id: 'frame_sql', functionName: 'SQL Engine', line: 1, arguments: {}, localVariables: {} }],
        stdout: '',
        flowchartNodeId: 'fc_parse',
        events: [{ type: 'OPERATION_EXECUTED' as const, line: 1, message: 'SQL Parsing' }],
      },
      {
        stepNumber: 2,
        sourceLine: 1,
        operation: 'SQL_EXECUTED',
        explanation: result.status === 'SUCCESS' ? 'Query executed successfully against sandboxed SQLite vault.' : 'Query encountered syntax or constraint error.',
        variables: {
          status: { name: 'Status', value: result.status, type: 'string' },
          rowsCount: { name: 'RowsReturned', value: result.stdout.split('\n').filter(Boolean).length, type: 'number' },
        },
        memory: {
          lastQuery: sourceCode.trim(),
        },
        callStack: [],
        stdout: result.stdout,
        flowchartNodeId: 'fc_out',
        events: [{ type: 'OUTPUT_PRINTED' as const, line: 1, value: result.stdout }],
      },
    ];

    return {
      steps,
      totalSteps: steps.length,
      output: result.stdout,
      error: result.stderr || result.errorMessage,
      status: result.status === 'SUCCESS' ? 'SUCCESS' : 'RUNTIME_ERROR',
      executionTimeMs: Math.max(Date.now() - startTime, 15),
      flowchartNodes,
      phases: [
        { id: 'phase_query', title: 'Query Execution', startStep: 1, endStep: 2, type: 'MAIN' },
      ],
    };
  }
}
