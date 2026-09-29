/**
 * ExecutionTraceEngine: Universal deterministic execution trace engine
 * for educational visual debugging.
 *
 * Simulates code execution step-by-step, generating structured ExecutionStep objects
 * with line highlights, variable mutations, memory/heap states, call stack frames,
 * condition evaluations, loop iterations, recursion trees, and flowchart nodes.
 */

import {
  ExecutionStep,
  ExecutionTrace,
  FlowchartNode,
  ExecutionPhase,
  StandardVisualizationEvent,
  VariableSnapshot,
  CallStackFrame,
  RecursionNode,
  DataStructureState,
} from '../../../models/Debugger';

export interface TracerOptions {
  maxSteps?: number;
  timeLimitMs?: number;
  input?: string;
}

export class ExecutionTraceEngine {
  private static instance: ExecutionTraceEngine;

  public static getInstance(): ExecutionTraceEngine {
    if (!ExecutionTraceEngine.instance) {
      ExecutionTraceEngine.instance = new ExecutionTraceEngine();
    }
    return ExecutionTraceEngine.instance;
  }

  /**
   * Generates a complete execution trace for Python code.
   */
  public tracePython(code: string, options: TracerOptions = {}): ExecutionTrace {
    const startTime = Date.now();
    const maxSteps = options.maxSteps || 500;
    const lines = code.split('\n');

    const steps: ExecutionStep[] = [];
    const flowchartNodes: FlowchartNode[] = [];
    let stdoutBuffer = '';
    const globalVariables: Record<string, VariableSnapshot> = {};
    const memoryHeap: Record<string, any> = {};
    const callStack: CallStackFrame[] = [
      {
        id: 'frame_main',
        functionName: '<main>',
        line: 1,
        arguments: {},
        localVariables: {},
      },
    ];

    // Build static flowchart nodes first
    flowchartNodes.push({ id: 'fc_start', label: 'START', type: 'START', line: 1 });
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      if (trimmed.startsWith('def ')) {
        flowchartNodes.push({
          id: `fc_${lineNum}`,
          label: trimmed.split(':')[0],
          type: 'CALL',
          line: lineNum,
        });
      } else if (trimmed.startsWith('if ') || trimmed.startsWith('elif ')) {
        flowchartNodes.push({
          id: `fc_${lineNum}`,
          label: trimmed.replace(/:$/, ''),
          type: 'DECISION',
          line: lineNum,
        });
      } else if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
        flowchartNodes.push({
          id: `fc_${lineNum}`,
          label: trimmed.replace(/:$/, ''),
          type: 'LOOP',
          line: lineNum,
        });
      } else if (trimmed.startsWith('print(')) {
        flowchartNodes.push({
          id: `fc_${lineNum}`,
          label: trimmed,
          type: 'OUTPUT',
          line: lineNum,
        });
      } else {
        flowchartNodes.push({
          id: `fc_${lineNum}`,
          label: trimmed,
          type: 'STATEMENT',
          line: lineNum,
        });
      }
    });
    flowchartNodes.push({ id: 'fc_end', label: 'END', type: 'END', line: lines.length });

    // Recursion tracking tree
    let recursionTreeRoot: RecursionNode | undefined;
    const functionRegistry: Record<string, { params: string[]; bodyLines: { lineNum: number; text: string }[] }> = {};

    // 1. Scan function definitions
    let inFunction: string | null = null;
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (trimmed.startsWith('def ')) {
        const match = trimmed.match(/def\s+([a-zA-Z_0-9]+)\s*\(([^)]*)\):/);
        if (match) {
          const fnName = match[1];
          const params = match[2]
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
          functionRegistry[fnName] = { params, bodyLines: [] };
          inFunction = fnName;
          return;
        }
      }
      if (inFunction) {
        if (lineText.startsWith('    ') || lineText.startsWith('\t')) {
          functionRegistry[inFunction].bodyLines.push({ lineNum, text: trimmed });
        } else if (trimmed.length > 0) {
          inFunction = null;
        }
      }
    });

    // Helper: evaluate expressions safely in scope
    const evaluateExpr = (expr: string, scopeVars: Record<string, any>): any => {
      const trimmed = expr.trim();
      if (!trimmed) return undefined;

      // Numeric literal
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        return Number(trimmed);
      }
      // String literal
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
      }
      // Boolean literal
      if (trimmed === 'True') return true;
      if (trimmed === 'False') return false;
      if (trimmed === 'None') return null;

      // Array literal
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const inner = trimmed.slice(1, -1).trim();
        if (!inner) return [];
        return inner.split(',').map((item) => evaluateExpr(item.trim(), scopeVars));
      }

      // Check simple variable
      if (scopeVars[trimmed] !== undefined) {
        return scopeVars[trimmed];
      }

      // len(arr)
      const lenMatch = trimmed.match(/^len\((.+)\)$/);
      if (lenMatch) {
        const val = evaluateExpr(lenMatch[1], scopeVars);
        return Array.isArray(val) || typeof val === 'string' ? val.length : 0;
      }

      // Range check
      const rangeMatch = trimmed.match(/^range\((\d+)\)$/);
      if (rangeMatch) {
        const count = Number(rangeMatch[1]);
        return Array.from({ length: count }, (_, i) => i);
      }

      // Array indexing: arr[mid]
      const indexMatch = trimmed.match(/^([a-zA-Z_0-9]+)\[(.+)\]$/);
      if (indexMatch) {
        const arrName = indexMatch[1];
        const idxExpr = indexMatch[2];
        const arr = scopeVars[arrName];
        const idxVal = evaluateExpr(idxExpr, scopeVars);
        if (Array.isArray(arr) && typeof idxVal === 'number') {
          return arr[idxVal];
        }
      }

      // Binary expressions with integer division support: a + b, (low + high) // 2, mid - 1
      let cleaned = trimmed.replace(/\/\//g, '/'); // normalize python integer division
      // Replace variable names with their actual values
      const varNames = Object.keys(scopeVars).sort((a, b) => b.length - a.length);
      for (const v of varNames) {
        const reg = new RegExp(`\\b${v}\\b`, 'g');
        const val = scopeVars[v];
        if (typeof val === 'number' || typeof val === 'boolean') {
          cleaned = cleaned.replace(reg, String(val));
        }
      }

      try {
        // Safe evaluation of mathematical arithmetic (numbers and + - * / % only)
        if (/^[0-9+\-*/%().\s><=!]+$/.test(cleaned)) {
          // eslint-disable-next-line no-eval
          const res = Function(`"use strict"; return (${cleaned});`)();
          if (trimmed.includes('//') && typeof res === 'number') {
            return Math.floor(res);
          }
          return res;
        }
      } catch {
        // fallback
      }

      return trimmed;
    };

    // Helper: Record Execution Step
    const addStep = (
      lineNum: number,
      operation: string,
      explanation: string,
      events: StandardVisualizationEvent[],
      extras: Partial<ExecutionStep> = {}
    ) => {
      const stepIndex = steps.length + 1;
      const varSnapshots: Record<string, VariableSnapshot> = {};
      Object.keys(globalVariables).forEach((k) => {
        varSnapshots[k] = { ...globalVariables[k] };
      });

      steps.push({
        stepNumber: stepIndex,
        sourceLine: lineNum,
        operation,
        explanation,
        variables: varSnapshots,
        memory: { ...memoryHeap },
        callStack: [...callStack],
        recursionTree: recursionTreeRoot,
        stdout: stdoutBuffer,
        flowchartNodeId: `fc_${lineNum}`,
        events,
        ...extras,
      });
    };

    // Helper: extract simple scope
    const getScopeVars = (): Record<string, any> => {
      const scope: Record<string, any> = {};
      Object.keys(globalVariables).forEach((k) => {
        scope[k] = globalVariables[k].value;
      });
      if (callStack.length > 1) {
        const topFrame = callStack[callStack.length - 1];
        Object.assign(scope, topFrame.localVariables);
      }
      return scope;
    };

    // Step-by-step Interpreter
    let currentLineIdx = 0;
    while (currentLineIdx < lines.length && steps.length < maxSteps) {
      const lineNum = currentLineIdx + 1;
      const rawLine = lines[currentLineIdx];
      const trimmed = rawLine.trim();
      currentLineIdx++;

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Skip function definitions when running top-level
      if (trimmed.startsWith('def ')) {
        const fnName = trimmed.split(' ')[1].split('(')[0];
        addStep(
          lineNum,
          'FUNCTION_DEFINITION',
          `Defined function '${fnName}'. Ready to be called.`,
          []
        );
        // Jump over function body in top level
        while (currentLineIdx < lines.length && (lines[currentLineIdx].startsWith('    ') || lines[currentLineIdx].startsWith('\t') || !lines[currentLineIdx].trim())) {
          currentLineIdx++;
        }
        continue;
      }

      // 1. PRINT STATEMENT
      if (trimmed.startsWith('print(')) {
        const inner = trimmed.slice(6, -1).trim();
        const scope = getScopeVars();
        const printedVal = evaluateExpr(inner, scope);
        const outStr = String(printedVal ?? '');
        stdoutBuffer += (stdoutBuffer ? '\n' : '') + outStr;

        addStep(
          lineNum,
          'OUTPUT_PRINTED',
          `Printed to standard output: ${outStr}`,
          [
            {
              type: 'OUTPUT_PRINTED',
              line: lineNum,
              value: outStr,
              message: `Standard Output received: ${outStr}`,
            },
          ]
        );
        continue;
      }

      // 2. FOR LOOP: for i in range(3):
      if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
        const forMatch = trimmed.match(/^for\s+([a-zA-Z_0-9]+)\s+in\s+(.+):$/);
        if (forMatch) {
          const loopVar = forMatch[1];
          const iterableExpr = forMatch[2];
          const scope = getScopeVars();
          const items: any[] = evaluateExpr(iterableExpr, scope) || [];

          // Collect loop body lines
          const loopBody: { lineNum: number; text: string }[] = [];
          while (currentLineIdx < lines.length && (lines[currentLineIdx].startsWith('    ') || lines[currentLineIdx].startsWith('\t'))) {
            loopBody.push({ lineNum: currentLineIdx + 1, text: lines[currentLineIdx].trim() });
            currentLineIdx++;
          }

          addStep(
            lineNum,
            'LOOP_STARTED',
            `Started 'for' loop iterating over ${iterableExpr} (${items.length} iterations).`,
            [{ type: 'LOOP_STARTED', line: lineNum, message: `Loop over ${loopVar}` }],
            {
              loopState: {
                loopVariable: loopVar,
                iteration: 0,
                condition: `${loopVar} in ${iterableExpr}`,
              },
            }
          );

          for (let iter = 0; iter < items.length && steps.length < maxSteps; iter++) {
            const val = items[iter];
            globalVariables[loopVar] = {
              name: loopVar,
              value: val,
              type: typeof val,
              isUpdated: iter > 0,
              isCreated: iter === 0,
              previousValue: iter > 0 ? items[iter - 1] : undefined,
            };

            addStep(
              lineNum,
              'LOOP_ITERATION',
              `Loop iteration ${iter + 1}: ${loopVar} = ${val}.`,
              [
                {
                  type: 'LOOP_ITERATION',
                  line: lineNum,
                  name: loopVar,
                  value: val,
                  iteration: iter + 1,
                },
              ],
              {
                loopState: {
                  loopVariable: loopVar,
                  iteration: iter + 1,
                  condition: `${iter + 1} / ${items.length}`,
                },
              }
            );

            // Execute loop body
            for (const bodyLine of loopBody) {
              if (steps.length >= maxSteps) break;
              if (bodyLine.text.startsWith('print(')) {
                const bScope = getScopeVars();
                const pVal = evaluateExpr(bodyLine.text.slice(6, -1).trim(), bScope);
                const sOut = String(pVal ?? '');
                stdoutBuffer += (stdoutBuffer ? '\n' : '') + sOut;
                addStep(
                  bodyLine.lineNum,
                  'OUTPUT_PRINTED',
                  `Print output: ${sOut}`,
                  [{ type: 'OUTPUT_PRINTED', line: bodyLine.lineNum, value: sOut }]
                );
              }
            }
          }

          addStep(
            lineNum,
            'LOOP_ENDED',
            `Loop on ${loopVar} finished.`,
            [{ type: 'LOOP_ENDED', line: lineNum }],
            {
              loopState: {
                loopVariable: loopVar,
                iteration: items.length,
                condition: 'Completed',
                isFinished: true,
              },
            }
          );
          continue;
        }
      }

      // 3. WHILE LOOP (e.g. Binary Search while low <= high:)
      if (trimmed.startsWith('while ')) {
        const condExpr = trimmed.replace(/^while\s+/, '').replace(/:$/, '').trim();
        let loopIter = 0;

        // Collect while body
        const whileBody: { lineNum: number; text: string }[] = [];
        while (currentLineIdx < lines.length && (lines[currentLineIdx].startsWith('    ') || lines[currentLineIdx].startsWith('\t'))) {
          whileBody.push({ lineNum: currentLineIdx + 1, text: lines[currentLineIdx].trim() });
          currentLineIdx++;
        }

        while (steps.length < maxSteps) {
          loopIter++;
          const scope = getScopeVars();
          const condRes = Boolean(evaluateExpr(condExpr, scope));

          addStep(
            lineNum,
            'CONDITION_CHECKED',
            `Checking while condition: '${condExpr}' -> ${condRes ? 'TRUE' : 'FALSE'}.`,
            [
              {
                type: 'CONDITION_CHECKED',
                line: lineNum,
                condition: condExpr,
                result: condRes,
              },
            ],
            {
              activeBranch: condRes ? 'TRUE' : 'FALSE',
              loopState: {
                loopVariable: 'iteration',
                iteration: loopIter,
                condition: condExpr,
                isFinished: !condRes,
              },
            }
          );

          if (!condRes) break;

          // Execute while body statements
          let broke = false;
          for (let bIdx = 0; bIdx < whileBody.length; bIdx++) {
            if (steps.length >= maxSteps) break;
            const bItem = whileBody[bIdx];
            const bText = bItem.text;

            if (bText === 'break') {
              broke = true;
              addStep(bItem.lineNum, 'LOOP_BREAK', `Executed 'break' — exiting while loop.`, []);
              break;
            }

            // mid = (low + high) // 2
            if (bText.includes('=')) {
              const eqIdx = bText.indexOf('=');
              const varName = bText.slice(0, eqIdx).trim();
              const exprVal = bText.slice(eqIdx + 1).trim();
              const bScope = getScopeVars();
              const evaluated = evaluateExpr(exprVal, bScope);
              const prev = globalVariables[varName]?.value;
              const isUpdate = globalVariables[varName] !== undefined;

              globalVariables[varName] = {
                name: varName,
                value: evaluated,
                type: typeof evaluated,
                isCreated: !isUpdate,
                isUpdated: isUpdate,
                previousValue: prev,
              };

              // Special data structure tracking for Binary Search
              let dsState: DataStructureState | undefined;
              if (globalVariables.arr && Array.isArray(globalVariables.arr.value)) {
                dsState = {
                  kind: 'BINARY_SEARCH',
                  name: 'arr',
                  items: [...globalVariables.arr.value],
                  pointers: {
                    low: globalVariables.low?.value ?? 0,
                    mid: globalVariables.mid?.value ?? 0,
                    high: globalVariables.high?.value ?? 0,
                  },
                };
              }

              addStep(
                bItem.lineNum,
                isUpdate ? 'VARIABLE_UPDATED' : 'VARIABLE_CREATED',
                isUpdate
                  ? `Updated ${varName} from ${prev} to ${evaluated}.`
                  : `Created variable ${varName} = ${evaluated}.`,
                [
                  {
                    type: isUpdate ? 'VARIABLE_UPDATED' : 'VARIABLE_CREATED',
                    line: bItem.lineNum,
                    name: varName,
                    value: evaluated,
                    previousValue: prev,
                  },
                ],
                {
                  expressionEvaluation: {
                    expression: exprVal,
                    operands: [],
                    calculation: `${exprVal} = ${evaluated}`,
                    result: evaluated,
                    targetVariable: varName,
                  },
                  dataStructureState: dsState,
                }
              );
            } else if (bText.startsWith('if ') || bText.startsWith('elif ')) {
              const ifCond = bText.replace(/^(if|elif)\s+/, '').replace(/:$/, '').trim();
              const bScope = getScopeVars();
              const ifRes = Boolean(evaluateExpr(ifCond, bScope));
              addStep(
                bItem.lineNum,
                'CONDITION_CHECKED',
                `Condition [${ifCond}] evaluated to ${ifRes ? 'TRUE' : 'FALSE'}.`,
                [{ type: 'CONDITION_CHECKED', line: bItem.lineNum, condition: ifCond, result: ifRes }],
                { activeBranch: ifRes ? 'TRUE' : 'FALSE' }
              );
            }
          }
          if (broke) break;
        }
        continue;
      }

      // 4. IF / ELSE STATEMENT
      if (trimmed.startsWith('if ')) {
        const condExpr = trimmed.replace(/^if\s+/, '').replace(/:$/, '').trim();
        const scope = getScopeVars();
        const condRes = Boolean(evaluateExpr(condExpr, scope));

        addStep(
          lineNum,
          'CONDITION_CHECKED',
          `Checked condition '${condExpr}'. Result is ${condRes ? 'TRUE' : 'FALSE'}.`,
          [
            {
              type: 'CONDITION_CHECKED',
              line: lineNum,
              condition: condExpr,
              result: condRes,
            },
            {
              type: 'BRANCH_ENTERED',
              line: lineNum,
              branch: condRes ? 'TRUE' : 'FALSE',
            },
          ],
          { activeBranch: condRes ? 'TRUE' : 'FALSE' }
        );
        continue;
      }

      // 5. FUNCTION CALL (e.g. result = add(2, 3) or result = factorial(3))
      const fnCallMatch = trimmed.match(/^([a-zA-Z_0-9]+\s*=\s*)?([a-zA-Z_0-9]+)\((.*)\)$/);
      if (fnCallMatch && functionRegistry[fnCallMatch[2]]) {
        const targetVar = fnCallMatch[1] ? fnCallMatch[1].replace('=', '').trim() : undefined;
        const fnName = fnCallMatch[2];
        const argStrings = fnCallMatch[3].split(',').map((s) => s.trim()).filter(Boolean);
        const scope = getScopeVars();
        const argVals = argStrings.map((s) => evaluateExpr(s, scope));

        // Trace recursive or standard function execution
        const executeFunction = (name: string, args: any[], depth: number = 0): any => {
          if (steps.length >= maxSteps) return 0;
          const fnDef = functionRegistry[name];
          if (!fnDef) return 0;

          const frameId = `frame_${name}_${depth}_${Date.now()}`;
          const localVars: Record<string, any> = {};
          fnDef.params.forEach((param, pIdx) => {
            localVars[param] = args[pIdx] ?? 0;
          });

          // Stack frame push
          const frame: CallStackFrame = {
            id: frameId,
            functionName: name,
            line: lineNum,
            arguments: { ...localVars },
            localVariables: { ...localVars },
          };
          callStack.push(frame);

          // Recursion tree node
          const recNode: RecursionNode = {
            id: frameId,
            functionName: name,
            args: { ...localVars },
            depth,
            children: [],
            isCurrent: true,
          };
          if (!recursionTreeRoot) {
            recursionTreeRoot = recNode;
          }

          addStep(
            lineNum,
            'FUNCTION_CALLED',
            `Called ${name}(${Object.entries(localVars).map(([k, v]) => `${k}=${v}`).join(', ')}). Created stack frame.`,
            [
              {
                type: 'FUNCTION_CALLED',
                line: lineNum,
                functionName: name,
                args: { ...localVars },
              },
            ]
          );

          let returnVal: any = undefined;

          // Run function body
          for (const bLine of fnDef.bodyLines) {
            if (steps.length >= maxSteps) break;
            const bText = bLine.text;

            // Check if condition: if n <= 1: return 1
            if (bText.startsWith('if ')) {
              const cExpr = bText.replace(/^if\s+/, '').replace(/:.*$/, '').trim();
              const cRes = Boolean(evaluateExpr(cExpr, localVars));
              addStep(
                bLine.lineNum,
                'CONDITION_CHECKED',
                `[${name}] Evaluated '${cExpr}' -> ${cRes ? 'TRUE' : 'FALSE'}.`,
                [{ type: 'CONDITION_CHECKED', line: bLine.lineNum, condition: cExpr, result: cRes }],
                { activeBranch: cRes ? 'TRUE' : 'FALSE' }
              );

              if (cRes && bText.includes('return ')) {
                const retExpr = bText.split('return ')[1].trim();
                returnVal = evaluateExpr(retExpr, localVars);
                recNode.isBaseCase = true;
                break;
              }
            }

            if (bText.startsWith('return ')) {
              const retExpr = bText.replace('return ', '').trim();

              // Recursive call: return n * factorial(n - 1)
              const recMatch = retExpr.match(/^([a-zA-Z_0-9]+)\s*\*\s*([a-zA-Z_0-9]+)\((.+)\)$/);
              if (recMatch && recMatch[2] === name) {
                const innerArg = evaluateExpr(recMatch[3], localVars);
                const subResult = executeFunction(name, [innerArg], depth + 1);
                const nVal = localVars[recMatch[1]] ?? 1;
                returnVal = nVal * subResult;

                addStep(
                  bLine.lineNum,
                  'OPERATION_EXECUTED',
                  `Calculated ${nVal} * ${name}(${innerArg}) = ${returnVal}.`,
                  [{ type: 'OPERATION_EXECUTED', line: bLine.lineNum, result: returnVal }]
                );
                break;
              }

              // Simple return a + b
              returnVal = evaluateExpr(retExpr, localVars);
              break;
            }
          }

          // Pop stack frame
          callStack.pop();
          recNode.returnValue = returnVal;
          recNode.isCurrent = false;

          addStep(
            lineNum,
            'FUNCTION_RETURNED',
            `Function ${name} returned ${returnVal}. Stack frame popped.`,
            [
              {
                type: 'FUNCTION_RETURNED',
                line: lineNum,
                functionName: name,
                result: returnVal,
              },
            ]
          );

          return returnVal;
        };

        const finalResult = executeFunction(fnName, argVals);
        if (targetVar) {
          globalVariables[targetVar] = {
            name: targetVar,
            value: finalResult,
            type: typeof finalResult,
            isCreated: true,
          };
          addStep(
            lineNum,
            'VARIABLE_CREATED',
            `Stored return value in ${targetVar} = ${finalResult}.`,
            [{ type: 'VARIABLE_CREATED', line: lineNum, name: targetVar, value: finalResult }]
          );
        }
        continue;
      }

      // 6. VARIABLE ASSIGNMENT: a = 2, c = a + b, x = (a + b) * c
      if (trimmed.includes('=') && !trimmed.startsWith('==')) {
        const parts = trimmed.split('=');
        const varName = parts[0].trim();
        const exprStr = parts.slice(1).join('=').trim();
        const scope = getScopeVars();

        // Check operands
        const operandsUsed: { name: string; value: any }[] = [];
        Object.keys(scope).forEach((k) => {
          if (new RegExp(`\\b${k}\\b`).test(exprStr)) {
            operandsUsed.push({ name: k, value: scope[k] });
          }
        });

        const evaluated = evaluateExpr(exprStr, scope);
        const prev = globalVariables[varName]?.value;
        const isUpdate = globalVariables[varName] !== undefined;

        globalVariables[varName] = {
          name: varName,
          value: evaluated,
          type: Array.isArray(evaluated) ? 'list' : typeof evaluated,
          isCreated: !isUpdate,
          isUpdated: isUpdate,
          previousValue: prev,
        };

        // Heap tracking for arrays/lists
        if (Array.isArray(evaluated)) {
          memoryHeap[varName] = [...evaluated];
        }

        const events: StandardVisualizationEvent[] = [];
        operandsUsed.forEach((op) => {
          events.push({
            type: 'VARIABLE_READ',
            line: lineNum,
            name: op.name,
            value: op.value,
          });
        });

        events.push({
          type: isUpdate ? 'VARIABLE_UPDATED' : 'VARIABLE_CREATED',
          line: lineNum,
          name: varName,
          value: evaluated,
          previousValue: prev,
          valueType: Array.isArray(evaluated) ? 'list' : typeof evaluated,
        });

        const calculationDesc = operandsUsed.length > 0
          ? `${operandsUsed.map((o) => `${o.name}(${o.value})`).join(' and ')} -> ${exprStr} = ${evaluated}`
          : `${exprStr} = ${evaluated}`;

        const explanation = isUpdate
          ? `Variable ${varName} changed from ${prev} to ${evaluated}.`
          : `Created variable ${varName} with value ${JSON.stringify(evaluated)}.`;

        addStep(
          lineNum,
          isUpdate ? 'VARIABLE_UPDATED' : 'VARIABLE_CREATED',
          explanation,
          events,
          {
            expressionEvaluation: {
              expression: exprStr,
              operands: operandsUsed,
              calculation: calculationDesc,
              result: evaluated,
              targetVariable: varName,
            },
            dataStructureState: Array.isArray(evaluated)
              ? {
                  kind: 'ARRAY',
                  name: varName,
                  items: evaluated,
                }
              : undefined,
          }
        );
        continue;
      }
    }

    // Identify Phases
    const phases: ExecutionPhase[] = [];
    if (steps.length > 0) {
      const total = steps.length;
      phases.push({
        id: 'phase_init',
        title: 'Phase 1: Initialization',
        startStep: 1,
        endStep: Math.min(3, total),
        type: 'INIT',
      });
      if (total > 3) {
        phases.push({
          id: 'phase_logic',
          title: 'Phase 2: Execution Logic',
          startStep: 4,
          endStep: Math.max(4, total - 1),
          type: 'MAIN',
        });
      }
      phases.push({
        id: 'phase_result',
        title: 'Phase 3: Output & Result',
        startStep: total,
        endStep: total,
        type: 'RESULT',
      });
    }

    const duration = Date.now() - startTime;

    return {
      steps,
      totalSteps: steps.length,
      output: stdoutBuffer,
      status: 'SUCCESS',
      executionTimeMs: Math.max(duration, 8),
      flowchartNodes,
      phases,
    };
  }

  /**
   * Generates execution trace for JavaScript code.
   */
  public traceJavaScript(code: string, options: TracerOptions = {}): ExecutionTrace {
    // Convert JS to equivalent Python-like representation for trace analysis
    // or run deterministic step evaluation.
    const pyEquivalent = code
      .replace(/const\s+|let\s+|var\s+/g, '')
      .replace(/console\.log\((.*)\);?/g, 'print($1)')
      .replace(/;/g, '')
      .replace(/\{/g, ':')
      .replace(/\}/g, '');

    return this.tracePython(pyEquivalent, options);
  }
}

export const executionTraceEngine = ExecutionTraceEngine.getInstance();
