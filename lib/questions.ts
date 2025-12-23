import { 
  AppCategory, 
  Question, 
  ThinkingQuestion, 
  DecisionQuestion, 
  ClassificationResult
} from '../types';

// ============================================
// HARDCODED QUESTIONS
// ============================================

const HARDCODED_QUESTIONS: Question[] = [
  // 1️⃣ TRADEOFF QUESTION (Livestreaming Backbone)
  {
    id: 'dec-streaming-backbone',
    type: 'decision',
    category: 'live-streaming',
    pillar: 'infrastructure',
    
    // Header
    prompt: "Big Decision — Managed Streaming vs Self-Hosted Streaming",
    subtext: "Do you want to use a managed live-video service (like Mux), or run live streaming yourself using open technologies (like WebRTC)?\n\nThis decision affects reliability, time to launch, monthly costs, and whether you’ll need specialized engineers later.\nIt’s one of the hardest decisions to reverse once users depend on the app.",
    
    // New Mental Model Section
    mentalModel: {
      title: "Before you answer, here’s the mental model",
      content: "Using a managed streaming service (like Mux) is like **renting a house**.\n• You pay monthly.\n• Most things “just work.”\n• When plumbing breaks, it’s not your job to fix the pipes.\n\nRunning live streaming yourself is like **building your own house**.\n• You might save money long-term.\n• But you’re responsible for wiring, plumbing, inspections, and repairs.\n• If something breaks at 2am, it’s your problem.\n\nNeither option is “better.” They optimize for different kinds of pain: money vs responsibility."
    },

    options: [
      {
        id: 'managed-streaming',
        title: "Option A: Managed streaming (e.g. Mux)",
        
        // Content
        whyUsersCare: "Streams are more reliable across devices and networks. Fewer freezes, fewer failed streams during important moments.",
        businessImpact: "You can launch faster and focus on creators, content, and growth instead of debugging live video issues.",
        
        costDetail: "You pay based on how much video people watch.\n\n**Example for ~10,000 monthly viewers:**\n• ~10 minutes watched per viewer per day\n• ≈ 3 million minutes watched per month\n\n**Typical monthly range:**\n$500–$2,000+ / month, depending on:\n• video quality (720p vs 1080p)\n• peak concurrent viewers\n• recording & storage\n\n(These are rough estimates, not quotes. Costs scale with usage.)",
        
        complexity: "Easy", // 🟢 Easier
        whoDealsWithPain: "Mostly money. Much less day-to-day technical stress.",
        
        // Lists
        upsides: [
          "Fastest path to a stable product",
          "Fewer catastrophic live failures",
          "No deep streaming expertise required early"
        ],
        tradeoffs: [
          "Monthly costs grow as usage grows",
          "Less low-level control"
        ],
        
        // Mapped for compatibility
        recommended: true
      },
      {
        id: 'self-hosted-streaming',
        title: "Option B: Self-hosted streaming (WebRTC / open-source)",
        
        // Content
        whyUsersCare: "Potentially lower cost per minute at scale if everything runs smoothly.",
        businessImpact: "Lower third-party fees, but significantly more responsibility and operational complexity.",
        
        costDetail: "**There are two real costs: infrastructure and people.**\n\n**Infrastructure (for ~10,000 users):**\n• Servers for video routing\n• Heavy bandwidth usage\n• Monitoring, backups, redundancy\n**Typical range:** $300–$1,200 / month in cloud + bandwidth\n\n**People / time cost (often underestimated):**\n• Initial setup: weeks to months\n• Ongoing tuning and firefighting\n• At scale, most teams need 1 experienced real-time/video engineer\n**Rough equivalent cost:** $8k–$15k/month",
        
        complexity: "Hard", // 🔴 High
        whoDealsWithPain: "You at first.\nLater: specialized streaming engineers, not just general developers.",
        
        // Lists
        upsides: [
          "Lower per-minute costs if you reach scale",
          "Full control over streaming behavior"
        ],
        tradeoffs: [
          "Slower to launch",
          "More fragile under real-world conditions",
          "Debugging live failures is time-consuming and stressful"
        ],
      }
    ],
    
    realityCheck: "Most teams that start self-hosted eventually:\n• hire streaming expertise, or\n• move to a managed service after stability issues\n\nSwitching later usually means reworking large parts of the system, not flipping a switch.",
    
    whyMatters: "This single decision often determines:\n• whether you ship in weeks or months\n• whether costs show up as invoices or burnout\n• whether you can run the product without a full engineering team"
  } as DecisionQuestion,

  // 2️⃣ OPEN-ENDED QUESTION
  {
    id: 'think-switching',
    type: 'thinking',
    category: 'universal',
    pillar: 'positioning',
    prompt: "The Switching Question",
    subtext: "Assume a competitor already exists and works fine. Why would someone switch to your app?\n\n“Better UI” is not enough.\nIf switching requires effort, there must be a clear, painful reason.\n\nWhat I’m actually testing:\n• Do you have a real wedge?\n• Or is this just a nicer version of something that already exists?",
    suggestions: [
      "“I’m 10× better at one specific thing, not everything.”",
      "“I’m cheaper because I cut features on purpose.”",
      "“I’m built for one niche competitors ignore.”",
      "“I already have distribution (audience, community, school, org).”",
      "“I enable something competitors literally can’t do.”",
      "“I don’t have a good answer yet.”"
    ],
  } as ThinkingQuestion
];

// Simplified buildQuestionFlow that just returns the hardcoded questions
export function buildQuestionFlow(
  classification: ClassificationResult,
  maxQuestions: number = 10
): Question[] {
  // Ignore classification and just return hardcoded flow
  return HARDCODED_QUESTIONS;
}

export function getPillarLabel(pillar: string): string {
  const labels: Record<string, string> = {
    positioning: 'Positioning Strategy',
    differentiation: 'Core Differentiation',
    customer: 'Target Customer',
    distribution: 'Go-to-Market',
    retention: 'Retention Loop',
    infrastructure: 'Tech Stack & Infra',
    monetization: 'Business Model',
    scope: 'MVP Scope',
    launch: 'Launch Strategy',
    risk: 'Risk Analysis',
  };
  return labels[pillar] || pillar;
}
