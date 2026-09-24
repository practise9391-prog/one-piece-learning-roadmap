export interface TopicCodeSnippet {
  language: string;
  code: string;
  output?: string;
}

export interface TopicContent {
  title: string;
  explanation: string;
  codeSnippet?: TopicCodeSnippet;
  examples?: string[];
  tips?: string[];
  importantPoints?: string[];
}
