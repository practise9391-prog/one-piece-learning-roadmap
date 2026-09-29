import { LanguageAdapter } from './BaseLanguageAdapter';
import { PythonAdapter } from './PythonAdapter';
import { JavaScriptAdapter } from './JavaScriptAdapter';
import { SQLAdapter } from './SQLAdapter';
import { JavaAdapter, CAdapter, CppAdapter } from './CompiledLanguageAdapter';

export * from './BaseLanguageAdapter';
export * from './PythonAdapter';
export * from './JavaScriptAdapter';
export * from './SQLAdapter';
export * from './CompiledLanguageAdapter';

export class AdapterRegistry {
  private static instance: AdapterRegistry;
  private adapters: Map<string, LanguageAdapter> = new Map();

  private constructor() {
    this.register(new PythonAdapter());
    this.register(new JavaScriptAdapter());
    this.register(new SQLAdapter());
    this.register(new JavaAdapter());
    this.register(new CAdapter());
    this.register(new CppAdapter());
  }

  public static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  public register(adapter: LanguageAdapter): void {
    this.adapters.set(adapter.language.toLowerCase(), adapter);
  }

  public getAdapter(language: string): LanguageAdapter {
    const clean = language.toLowerCase();
    if (this.adapters.has(clean)) {
      return this.adapters.get(clean)!;
    }
    // Aliases
    if (clean === 'js') return this.adapters.get('javascript')!;
    if (clean === 'py') return this.adapters.get('python')!;
    if (clean === 'sqlite') return this.adapters.get('sql')!;
    if (clean === 'c++') return this.adapters.get('cpp')!;

    // Fallback to python adapter
    return this.adapters.get('python')!;
  }

  public getAllSupportedLanguages(): { id: string; name: string; isExecutable: boolean }[] {
    return Array.from(this.adapters.values()).map((a) => ({
      id: a.language,
      name: a.displayName,
      isExecutable: a.isExecutable,
    }));
  }
}

export const adapterRegistry = AdapterRegistry.getInstance();
