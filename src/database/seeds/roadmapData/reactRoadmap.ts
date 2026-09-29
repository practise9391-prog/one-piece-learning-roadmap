import { CourseRoadmapSeed } from './types';

export const reactRoadmap: CourseRoadmapSeed = {
  courseId: 'react',
  modules: [
    {
        "title": "Level 0 — Web & JavaScript Prerequisites",
        "description": "Essential web foundations: semantic HTML, responsive CSS, JavaScript ES6+, and Asynchronous HTTP request flows.",
        "icon": "code-tags",
        "topics": [
            "1. HTML",
            "2. CSS",
            "3. JavaScript",
            "4. ES6+",
            "5. Async JavaScript",
            "6. APIs"
        ]
    },
    {
        "title": "Phase 1 — React Fundamentals & Core Syntax",
        "description": "Introduction to declarative UI, Vite project tooling, JSX compilation, reusable Components, and Props.",
        "icon": "react",
        "topics": [
            "7. React Introduction",
            "8. Vite",
            "9. JSX",
            "10. Components",
            "11. Props",
            "12. Lists",
            "13. Conditional Rendering",
            "14. Events"
        ]
    },
    {
        "title": "Phase 1 — State & Component Interaction",
        "description": "Mastering local state with useState, immutability with objects & arrays, controlled forms, and parent-child communication.",
        "icon": "lightning-bolt-outline",
        "topics": [
            "15. useState",
            "16. State with Objects",
            "17. State with Arrays",
            "18. Forms",
            "19. Component Communication"
        ]
    },
    {
        "title": "Phase 2 — Effects, Asynchronous Flow & Refs",
        "description": "Lifecycle side effects with useEffect, cleanups, real API data fetching, loading & error states, and DOM refs.",
        "icon": "sync",
        "topics": [
            "20. useEffect",
            "21. API Calls",
            "22. Loading/Error States",
            "23. useRef"
        ]
    },
    {
        "title": "Phase 2 — Performance Optimization & Custom Hooks",
        "description": "Memoization with useMemo and useCallback, preventing re-renders with React.memo, and reusable Custom Hooks.",
        "icon": "speedometer",
        "topics": [
            "24. useMemo",
            "25. useCallback",
            "26. React.memo",
            "27. Custom Hooks"
        ]
    },
    {
        "title": "Phase 2 — Advanced State Management & Routing",
        "description": "Global state with React Context and useReducer, React Router multi-page SPA navigation, Auth, LocalStorage, and Redux Toolkit.",
        "icon": "layers-outline",
        "topics": [
            "28. Context",
            "29. useReducer",
            "30. React Router",
            "31. Authentication",
            "32. LocalStorage",
            "33. Redux Toolkit",
            "34. Server State",
            "35. TanStack Query"
        ]
    },
    {
        "title": "Phase 3 — Enterprise UI Patterns & Data Handling",
        "description": "Form libraries (React Hook Form / Zod), file uploads, filtering, sorting, pagination, debouncing, error boundaries, and profiling.",
        "icon": "filter-variant",
        "topics": [
            "36. Advanced Forms",
            "37. File Uploads",
            "38. Search/Filter/Sort/Pagination",
            "39. Debouncing/Throttling",
            "40. Error Handling",
            "41. Performance"
        ]
    },
    {
        "title": "Phase 3 — Modern React, TypeScript & Testing",
        "description": "React Suspense, React Server Components (RSC), full TypeScript integration, Vitest/React Testing Library, a11y, and security (XSS/CSRF).",
        "icon": "shield-check-outline",
        "topics": [
            "42. Suspense",
            "43. Server Components",
            "44. TypeScript",
            "45. Testing",
            "46. Accessibility",
            "47. Security"
        ]
    },
    {
        "title": "Phase 4 — System Architecture, UI Ecosystem & Frameworks",
        "description": "Feature-based project architecture, Design Systems, Tailwind/Shadcn UI, Django/Frappe backend integration, Next.js, and rendering paradigms.",
        "icon": "view-dashboard-outline",
        "topics": [
            "48. Project Architecture",
            "49. Design Systems",
            "50. UI Libraries",
            "51. React + Django/Frappe",
            "52. Next.js",
            "53. CSR/SSR/SSG/ISR"
        ]
    },
    {
        "title": "Phase 4 — Production, DevOps & Capstone",
        "description": "Bundle optimization, code splitting, edge deployment (Vercel/Cloudflare), Docker containerization, CI/CD pipelines, WebSockets, and Capstone.",
        "icon": "rocket-launch-outline",
        "topics": [
            "54. Production Optimization",
            "55. Deployment",
            "56. Docker",
            "57. CI/CD",
            "58. Advanced Architecture",
            "59. Real-time Applications",
            "60. Final Full-Stack Project"
        ]
    }
]
};
