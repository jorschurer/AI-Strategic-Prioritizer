import { Question, UseCaseInput } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Strategy',
    text: 'How defined is your AI strategy?',
    options: [
      { text: 'No formal strategy exists.', score: 1 },
      { text: 'We have some ad-hoc pilots.', score: 2 },
      { text: 'Defined strategy for specific departments.', score: 3 },
      { text: 'AI is central to our corporate strategy.', score: 4 },
    ],
  },
  {
    id: 2,
    category: 'Data',
    text: 'What is the state of your data infrastructure?',
    options: [
      { text: 'Data is siloed and mostly manual.', score: 1 },
      { text: 'Some digital records, but inconsistent.', score: 2 },
      { text: 'Centralized data warehouse available.', score: 3 },
      { text: 'Real-time, governed data lakehouse.', score: 4 },
    ],
  },
  {
    id: 3,
    category: 'Technology',
    text: 'How modern is your technology stack?',
    options: [
      { text: 'Legacy on-premise systems.', score: 1 },
      { text: 'Transitioning to cloud.', score: 2 },
      { text: 'Cloud-native with API integrations.', score: 3 },
      { text: 'Modern MLOps and scalable compute.', score: 4 },
    ],
  },
  {
    id: 4,
    category: 'People',
    text: 'What is your team\'s AI literacy?',
    options: [
      { text: 'Limited understanding or skepticism.', score: 1 },
      { text: 'Curious, but skill gaps exist.', score: 2 },
      { text: 'Dedicated data science team.', score: 3 },
      { text: 'AI literacy across all business units.', score: 4 },
    ],
  },
  {
    id: 5,
    category: 'Governance',
    text: 'How do you manage AI risk and ethics?',
    options: [
      { text: 'No governance structure.', score: 1 },
      { text: 'Ad-hoc reviews when issues arise.', score: 2 },
      { text: 'Established policies and guidelines.', score: 3 },
      { text: 'Automated compliance and monitoring.', score: 4 },
    ],
  },
];

export const DEMO_DATA: UseCaseInput[] = [
  {
    id: 'demo-1',
    title: 'Automated Customer Support Agent',
    department: 'Customer Service',
    description: 'Implement a GenAI chatbot to handle Tier 1 support queries and ticket routing.',
  },
  {
    id: 'demo-2',
    title: 'Supply Chain Demand Forecasting',
    department: 'Operations',
    description: 'Use predictive analytics to optimize inventory levels based on seasonal trends.',
  },
  {
    id: 'demo-3',
    title: 'Personalized Marketing Content',
    department: 'Marketing',
    description: 'Generate hyper-personalized email copy for different customer segments at scale.',
  },
];