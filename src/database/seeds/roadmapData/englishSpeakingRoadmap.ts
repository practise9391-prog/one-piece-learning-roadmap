import { CourseRoadmapSeed } from './types';

export const englishSpeakingRoadmap: CourseRoadmapSeed = {
  courseId: 'english_speaking',
  modules: [
    // --- STAGE 1: THE 8 PROGRESSIVE SPEAKING LEVELS ---
    {
      title: 'Level 1: Speak Without Fear',
      description: 'Overcoming hesitation, pacing, pronunciation reflex, and embracing mistakes.',
      icon: 'sparkles-outline',
      topics: [
        'Overcoming the Fear of Making Mistakes: Mindset Shift',
        'Breathing, Pausing, and Sentence Pacing Techniques',
        'Clear Pronunciation Basics and Syllable Stress',
        'Building Your Daily English Speaking Reflex',
        'Speaking Without Translating from Your Native Language',
      ],
    },
    {
      title: 'Level 2: Basic Daily Conversation',
      description: 'Warm greetings, daily routines, expressing likes, and asking open questions.',
      icon: 'chatbubble-outline',
      topics: [
        'Greetings, Handshakes, and Making Warm First Impressions',
        'Talking About Your Daily Routine and Typical Day',
        'Expressing Likes, Dislikes, Preferences, and Hobbies',
        'Asking Open-Ended Questions to Keep Conversations Flowing',
        'Polite Goodbyes, Leave-Taking, and Future Meeting Invitations',
      ],
    },
    {
      title: 'Level 3: Everyday Situations',
      description: 'Dining out, shopping, asking directions, and booking travel logistics.',
      icon: 'cart-outline',
      topics: [
        'Ordering Food at a Restaurant, Inquiring Ingredients, and Paying the Bill',
        'Shopping at a Store, Inquiring Sizes, Prices, and Courteous Bargaining',
        'Asking for, Understanding, and Giving Step-by-Step Directions',
        'Booking Train/Flight Tickets, Checking into Hotels, and Inquiring Amenities',
        'Handling Emergencies, Inquiring Pharmacy/Medical Help Politely',
      ],
    },
    {
      title: 'Level 4: College & Student Life',
      description: 'Talking with peers, professors, group project coordination, and seminars.',
      icon: 'school-outline',
      topics: [
        'Breaking the Ice with New Classmates and Making Friends on Campus',
        'Speaking with College Professors and Asking Clarifying Questions Politely',
        'Discussing Group Project Ideas, Work Distribution, and Deadlines',
        'Presenting a Technical Seminar Topic in Front of Class with Poise',
        'Participating in College Clubs, Cultural Fests, and Student Councils',
      ],
    },
    {
      title: 'Level 5: Workplace English',
      description: 'Stand-up updates, onboarding, asking seniors for help, and reporting issues.',
      icon: 'briefcase-outline',
      topics: [
        'Introducing Yourself to Your New Team on Day One',
        'Delivering Crisp Daily Stand-Up Updates (Yesterday, Today, Blockers)',
        'Asking Senior Colleagues and Leads for Technical Help Diplomatically',
        'Reporting Software Bugs, System Blockers, and Technical Difficulties',
        'Coffee Machine and Water-Cooler Informal Chats with Co-Workers',
      ],
    },
    {
      title: 'Level 6: Professional Communication',
      description: 'Meeting participation, polite disagreement, demos, and stakeholder chats.',
      icon: 'trophy-outline',
      topics: [
        'Actively Participating in Team Brainstorming and Sprint Retrospectives',
        'Expressing Disagreement Politely and Constructively in Meetings',
        'Delivering a Live Software Demo or Architecture Presentation',
        'Speaking Confidently with International Clients and Stakeholders',
        'Handling Difficult Conversations and Managing Unrealistic Deadlines',
      ],
    },
    {
      title: 'Level 7: Interview Speaking',
      description: 'Self-intro elevator pitch, technical explanations, and behavioral STAR stories.',
      icon: 'mic-outline',
      topics: [
        'Delivering Your 90-Second Self-Introduction Elevator Pitch with Energy',
        'Explaining Complex Technical Architecture in Simple Plain English',
        'Storytelling Using the STAR Framework (Situation, Task, Action, Result)',
        'Answering Tough Behavioral Questions (Conflict, Failure, Pressure)',
        'Asking Strategic, Thoughtful Questions to the Hiring Manager',
      ],
    },
    {
      title: 'Level 8: Advanced Conversation & Debate',
      description: 'Nuanced small talk, debating diplomatically, persuasion, and extempore.',
      icon: 'ribbon-outline',
      topics: [
        'Nuanced Small Talk and Professional Networking at Conferences',
        'Expressing Complex, Balanced Opinions on Social and Industry Trends',
        'Persuasive Speaking: Pitching an Idea and Winning Support',
        'Handling Spontaneous Extempore Speaking Topics Under 1 Minute',
        'Mastering Voice Modulation, Inflection, and Gravitas',
      ],
    },

    // --- STAGE 2: DAILY SPEAKING TOPICS (SECTION 9 OF SPEC) ---
    {
      title: 'Daily Speaking: Personal & Lifestyle',
      description: 'Foundational personal themes for daily 2-minute spoken reflections.',
      icon: 'person-circle-outline',
      topics: [
        'Introduce Yourself: Background, Passions, and Core Drive',
        'Talk About Your Family and Childhood Memories',
        'Talk About Your Daily Routine from Morning to Night',
        'Talk About Your Favorite Hobbies and Weekend Activities',
        'Talk About Your Favorite Food and Cooking Experiences',
        'Talk About Your Favorite Movie or Book and What it Taught You',
        'Talk About Travel Experiences and Your Dream Destination',
        'Talk About Your City, Hometown, and Local Culture',
        'Talk About Your Closest Friends and What Makes Friendship Special',
      ],
    },
    {
      title: 'Daily Speaking: Technology & Engineering',
      description: 'Speaking fluently about modern technology, software, and industry.',
      icon: 'code-working-outline',
      topics: [
        'Talk About Technology and How it Shapes Modern Life',
        'Talk About Artificial Intelligence: Opportunities and Concerns',
        'Talk About Social Media: Staying Connected vs Digital Addiction',
        'Talk About Your Software Project: Architecture, Goal, and Impact',
        'Talk About Programming: Why You Enjoy Writing Code',
        'Talk About Your Technical Skills and What You Want to Learn Next',
        'Talk About Education: Traditional College vs Online Self-Learning',
        'Talk About Work Culture: Remote vs Hybrid vs Office Work',
      ],
    },
    {
      title: 'Daily Speaking: Ambition & Experiences',
      description: 'Articulating life goals, strengths, growth areas, and resilience.',
      icon: 'flame-outline',
      topics: [
        'Talk About Your Goals for the Next 12 Months',
        'Talk About Your Vision for Your Future Career in Tech',
        'Talk About Your Greatest Strengths with Real Examples',
        'Talk About Your Weaknesses and How You are Improving Them',
        'Talk About a Difficult Experience and How You Overcame It',
        'Talk About a Recent Achievement You are Proud Of',
      ],
    },

    // --- STAGE 3: REAL-LIFE SPEAKING SCENARIOS (SECTION 10 OF SPEC) ---
    {
      title: 'Scenarios: Campus & Education',
      description: 'Simulated dialogues between students, teachers, and university staff.',
      icon: 'library-outline',
      topics: [
        'Teacher ↔ Student: Discussing Exam Performance and Improvement',
        'Two Friends: Catching Up on Weekend Plans and Hobbies',
        'Student ↔ Professor: Requesting Guidance on Final Year Project',
        'Student ↔ Receptionist: Inquiring About Course Admissions and Fees',
      ],
    },
    {
      title: 'Scenarios: Workplace & Tech',
      description: 'Simulated dialogues for standups, code reviews, client syncs, and 1-on-1s.',
      icon: 'business-outline',
      topics: [
        'Developer ↔ Team Lead: Stand-Up Blocker and Deployment Status',
        'Developer ↔ Colleague: Code Review Feedback and Refactoring Discussion',
        'Developer ↔ Client: Clarifying Feature Requirements and Timelines',
        'Employee ↔ Manager: Quarterly Performance 1-on-1 Review',
        'Employee ↔ HR: Discussing Relocation, Leave Policy, and Benefits',
        'Candidate ↔ Interviewer: Answering Technical System Design Questions',
      ],
    },
    {
      title: 'Scenarios: Service & Everyday Life',
      description: 'Simulated dialogues for shopping, hotels, support, and friendship.',
      icon: 'call-outline',
      topics: [
        'Customer ↔ Shopkeeper: Inquiring Product Warranty and Return Policy',
        'Traveler ↔ Hotel Staff: Room Service Request and Late Checkout',
        'Person ↔ Customer Support: Resolving an E-Commerce Delivery Issue',
        'Employee ↔ Customer: Demonstrating Software and Answering Queries',
        'Friend ↔ Friend: Giving Encouragement and Career Advice',
      ],
    },
    {
      title: 'Interactive Speaking Dojo',
      description: 'Real-time practice drills for fluency, shadowing, and Speak Without Fear.',
      icon: 'fitness-outline',
      topics: [
        'Speak Without Fear Dojo: 60-Second Non-Stop Fluency Drill',
        'Shadowing Technique: Mimicking Native Rhythm and Intonation',
        'Eliminating Filler Words: Pausing with Confidence Practice',
        'Spontaneous Roleplay: Random Scenario Generation Simulator',
      ],
    },
  ],
};
