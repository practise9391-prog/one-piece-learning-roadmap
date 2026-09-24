export interface InitialCourseSeed {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  order_index: number;
}

export const INITIAL_COURSES: InitialCourseSeed[] = [
  {
    id: 'python',
    name: 'Python',
    description: 'Master core programming, OOP, data structures, and Pythonic patterns.',
    icon: 'logo-python',
    theme: 'python',
    order_index: 1,
  },
  {
    id: 'dsa',
    name: 'DSA',
    description: 'Data Structures and Algorithms for problem solving and technical interviews.',
    icon: 'git-network-outline',
    theme: 'dsa',
    order_index: 2,
  },
  {
    id: 'git',
    name: 'Git',
    description: 'Version control mastery, branching strategies, rebasing, and GitHub workflows.',
    icon: 'git-branch-outline',
    theme: 'git',
    order_index: 3,
  },
  {
    id: 'sql',
    name: 'SQL',
    description: 'Relational database queries, indexing, schema design, and query optimization.',
    icon: 'server-outline',
    theme: 'sql',
    order_index: 4,
  },
  {
    id: 'django',
    name: 'Django',
    description: 'Full-stack web application development with Python, ORM, and REST frameworks.',
    icon: 'layers-outline',
    theme: 'django',
    order_index: 5,
  },
  {
    id: 'ml_developer',
    name: 'ML Developer',
    description: 'Machine Learning foundations, NumPy, Pandas, Scikit-learn, and model deployment.',
    icon: 'hardware-chip-outline',
    theme: 'ml_developer',
    order_index: 6,
  },
  {
    id: 'linux',
    name: 'Linux',
    description: 'Command line power, shell scripting, permissions, process management, and DevOps basics.',
    icon: 'terminal-outline',
    theme: 'linux',
    order_index: 7,
  },
  {
    id: 'frappe',
    name: 'Frappe',
    description: 'Enterprise framework development, DocTypes, ERPNext customization, and APIs.',
    icon: 'cube-outline',
    theme: 'frappe',
    order_index: 8,
  },
  {
    id: 'aptitude_reasoning',
    name: 'Aptitude & Reasoning',
    description: 'Quantitative aptitude, logical reasoning, and analytical problem-solving skills.',
    icon: 'bulb-outline',
    theme: 'aptitude_reasoning',
    order_index: 9,
  },
  {
    id: 'english',
    name: 'English',
    description: 'Professional communication, grammar precision, vocabulary, and workplace fluency.',
    icon: 'book-outline',
    theme: 'english',
    order_index: 10,
  },
  {
    id: 'hindi',
    name: 'Hindi',
    description: 'Core Hindi language comprehension, grammar, and communicative expression.',
    icon: 'language-outline',
    theme: 'hindi',
    order_index: 11,
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Semantic web markup, accessibility standards, SEO foundations, and document structure.',
    icon: 'code-slash-outline',
    theme: 'html',
    order_index: 12,
  },
  {
    id: 'css',
    name: 'CSS',
    description: 'Modern styling, Flexbox, CSS Grid, responsive design, animations, and Tailwind.',
    icon: 'color-palette-outline',
    theme: 'css',
    order_index: 13,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'ES6+, asynchronous programming, DOM manipulation, closures, and modern web APIs.',
    icon: 'logo-javascript',
    theme: 'javascript',
    order_index: 14,
  },
];

