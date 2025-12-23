// App Categories for classification
export type AppCategory =
  | 'marketplace'
  | 'saas'
  | 'social'
  | 'subscription-content'
  | 'live-streaming'
  | 'ai-tool'
  | 'subscription-paywall'
  | 'web-store'
  | 'creator'
  | 'booking'
  | 'social-feed'
  | 'messaging'
  | 'productivity'
  | 'game'
  | 'media-streaming'
  | 'other';

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  'marketplace': 'Marketplace',
  'saas': 'Productivity / SaaS',
  'social': 'Social & Community',
  'subscription-content': 'Subscription Content',
  'live-streaming': 'Livestream App',
  'ai-tool': 'AI-Powered App',
  'subscription-paywall': 'Subscription / Paywall',
  'web-store': 'Web Store to App',
  'creator': 'Creator App',
  'booking': 'Booking / Ordering',
  'social-feed': 'Social Feed App',
  'messaging': 'Messaging / Chat',
  'productivity': 'Productivity App',
  'game': 'Game',
  'media-streaming': 'Media / Streaming',
  'other': 'General App',
};

export const CATEGORY_ICONS: Record<AppCategory, string> = {
  'marketplace': '🛒',
  'saas': '⚡',
  'social': '💬',
  'subscription-content': '📱',
  'live-streaming': '📺',
  'ai-tool': '🤖',
  'subscription-paywall': '💳',
  'web-store': '🏪',
  'creator': '🎨',
  'booking': '📅',
  'social-feed': '📷',
  'messaging': '💬',
  'productivity': '✅',
  'game': '🎮',
  'media-streaming': '🎬',
  'other': '📱',
};

// Monetization models
export type MonetizationModel = 'free' | 'subscription' | 'freemium' | 'ad-supported';

export const MONETIZATION_LABELS: Record<MonetizationModel, string> = {
  'free': 'Free',
  'subscription': 'Subscription',
  'freemium': 'Freemium',
  'ad-supported': 'Ad Supported',
};

export const MONETIZATION_DESCRIPTIONS: Record<MonetizationModel, string> = {
  'free': 'No payment, open to everyone.',
  'subscription': 'Recurring payments for ongoing access',
  'freemium': 'Free tier with paid upgrades.',
  'ad-supported': 'Free for users, revenue from ads.',
};

// App type with example apps
export interface AppTypeOption {
  id: AppCategory;
  title: string;
  description: string;
  exampleApps: string[];
}

// Onboarding data structure
export interface OnboardingData {
  idea: string;
  appType: AppCategory | null;
  monetization: MonetizationModel | null;
  appName: string;
  nameSuggestions: string[];
  thumbnail: {
    style: 'generated' | 'uploaded' | 'custom';
    selectedIndex: number;
    accentColor: string;
    bgColor: string;
    iconColor: string;
    description: string;
  };
}

// Classification types
export interface CategoryScore {
  category: AppCategory;
  score: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface ClassificationResult {
  primaryCategory: AppCategory;
  secondaryCategory?: AppCategory;
  scores: CategoryScore[];
  isHybrid: boolean;
}

// ============================================
// NEW QUESTION SYSTEM - Two Types of Questions
// ============================================

export type QuestionType = 'thinking' | 'decision';

// Thinking Questions: Open-ended, conversational
// Used for: positioning, insight, differentiation
// Don't block progress, encourage free-text
export interface ThinkingQuestion {
  id: string;
  type: 'thinking';
  category: AppCategory | 'universal';
  prompt: string;
  subtext?: string; // Additional context shown below the prompt
  suggestions?: string[]; // Optional suggestions (not forced choices)
  pillar: 'positioning' | 'differentiation' | 'customer' | 'distribution' | 'retention';
}

// Decision Questions: Tradeoff-driven, consequential
// Used for: cost, timeline, scalability, complexity, flexibility decisions
// Must show options side-by-side with real consequences
export interface DecisionOption {
  id: string;
  title: string;
  
  // Content fields
  whyUsersCare: string;
  businessImpact: string; // "Why this helps (or hurts) the business"
  costDetail: string; // "What this costs you"
  complexity: 'Easy' | 'Medium' | 'Hard'; // "How hard this is"
  whoDealsWithPain: string; // "Who has to deal with the pain"
  
  // Lists
  upsides: string[];
  tradeoffs: string[];
  
  // Original fields (mapped or kept for compatibility)
  description?: string; // Optional now
  whyChooseThis?: string; // Optional now
  cost?: string; // Optional now
  timeline?: string; // Optional now
  downside?: string; // Optional now (can map to tradeoffs)
  recommended?: boolean;
}

export interface DecisionQuestion {
  id: string;
  type: 'decision';
  category: AppCategory | 'universal';
  prompt: string;
  subtext?: string;
  mentalModel?: {
    title: string;
    content: string;
  };
  options: DecisionOption[];
  pillar: 'infrastructure' | 'monetization' | 'scope' | 'launch' | 'risk';
  realityCheck?: string; // New field for "Reality check"
  whyMatters?: string;   // New field for "Why this question matters"
  blocksProgress?: boolean;
}

export type Question = ThinkingQuestion | DecisionQuestion;

export interface QuestionBank {
  category: AppCategory | 'universal';
  questions: Question[];
}

// Message types for chat
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  questionId?: string;
  questionType?: QuestionType;
}

// User's response to questions
export interface UserResponse {
  questionId: string;
  questionType: QuestionType;
  response: string; // Free text for thinking, option ID for decision
  responseText: string; // Human-readable response
  timestamp: number;
}

// Summary of decisions for recap
export interface DecisionSummary {
  questionId: string;
  prompt: string;
  chosenOption: string;
  implication: string;
}

export interface ThinkingSummary {
  questionId: string;
  pillar: string;
  response: string;
}

// Final Chat Summary
export interface ChatSummary {
  ideaSummary: string;
  positioningInsights: ThinkingSummary[];
  decisionsChosen: DecisionSummary[];
  implications: {
    costRange: string;
    timelineEstimate: string;
    riskLevel: 'low' | 'medium' | 'high';
    keyRisks: string[];
  };
  nextSteps: string[];
  generatedAt: number;
}

// Reality Check - live updating panel
export interface RealityCheck {
  whatYoureBuilding: string;
  inferredType: AppCategory;
  isHybrid: boolean;
  complexityLevel: 'Low' | 'Medium' | 'High';
  biggestRisk: string;
  firstThingToCut: string;
}

// Final Report
export interface FinalReport {
  whatYoureActuallyBuilding: string;
  whyThisMightWork: string;
  whyThisMightNot: string;
  theRealWedge: string;
  hasWedge: boolean;
  mvpScope: string[];
  topRisks: string[];
  nextDecisions: string[];
  generatedAt: number;
}

// Validator State
export interface ValidatorState {
  idea: string;
  messages: Message[];
  classification: ClassificationResult | null;
  realityCheck: RealityCheck | null;
  questionsAsked: number;
  responses: UserResponse[];
  isComplete: boolean;
  chatSummary: ChatSummary | null;
  finalReport: FinalReport | null;
}
