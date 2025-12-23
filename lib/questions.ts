import { 
  AppCategory, 
  Question, 
  ThinkingQuestion, 
  DecisionQuestion, 
  ClassificationResult,
  AppTypeOption,
  MonetizationModel
} from '../types';

// ============================================
// APP TYPE OPTIONS (for carousel)
// ============================================

export const APP_TYPE_OPTIONS: AppTypeOption[] = [
  {
    id: 'subscription-paywall',
    title: 'Subscription / Paywall',
    description: 'Users pay monthly or yearly to unlock features',
    exampleApps: ['Headspace', 'RIZZ', 'Calm'],
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Users buy and sell with each other.',
    exampleApps: ['Airbnb', 'Depop', 'Craigslist'],
  },
  {
    id: 'web-store',
    title: 'Web Store to App',
    description: 'Bring an existing brand or store to mobile.',
    exampleApps: ['Shopify', 'Square', 'H&M'],
  },
  {
    id: 'creator',
    title: 'Creator App',
    description: 'Create content and get paid by your fans',
    exampleApps: ['Patreon', 'Ko-fi', 'Cash App'],
  },
  {
    id: 'booking',
    title: 'Booking / Ordering',
    description: 'Schedule, reserve or place orders.',
    exampleApps: ['DoorDash', 'Calendly', 'OpenTable'],
  },
  {
    id: 'social-feed',
    title: 'Social Feed App',
    description: 'Scroll, post, like and comment on others\' posts.',
    exampleApps: ['TikTok', 'Instagram', 'BeReal'],
  },
  {
    id: 'live-streaming',
    title: 'Livestream App',
    description: 'Go live and watch others live.',
    exampleApps: ['Twitch', 'TikTok Live', 'BeReal'],
  },
  {
    id: 'messaging',
    title: 'Messaging / Chat App',
    description: 'One-on-one or group conversations.',
    exampleApps: ['WhatsApp', 'Discord', 'Telegram'],
  },
  {
    id: 'ai-tool',
    title: 'AI-Powered App',
    description: 'AI helps users do something faster or better.',
    exampleApps: ['ChatGPT', 'Otter.ai', 'Notion AI'],
  },
  {
    id: 'productivity',
    title: 'Productivity App',
    description: 'Track habits, goals or progress.',
    exampleApps: ['Notion', 'Things 3', 'Forest'],
  },
  {
    id: 'game',
    title: 'Game',
    description: 'Play for fun or competition.',
    exampleApps: ['Candy Crush', 'Among Us', 'Wordle'],
  },
  {
    id: 'media-streaming',
    title: 'Media / Streaming App',
    description: 'Watch or listen to content.',
    exampleApps: ['Netflix', 'Spotify', 'YouTube'],
  },
];

// ============================================
// MONETIZATION OPTIONS
// ============================================

export interface MonetizationOption {
  id: MonetizationModel;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

export const MONETIZATION_OPTIONS: MonetizationOption[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'No payment, open to everyone.',
    icon: '🌐',
    badge: 'No Setup Needed',
    badgeColor: 'zinc',
  },
  {
    id: 'subscription',
    title: 'Subscription',
    description: 'Recurring payments for ongoing access',
    icon: '🔄',
    badge: 'Recommended',
    badgeColor: 'emerald',
  },
  {
    id: 'freemium',
    title: 'Freemium',
    description: 'Free tier with paid upgrades.',
    icon: '🔓',
    badge: 'Most Flexible',
    badgeColor: 'blue',
  },
  {
    id: 'ad-supported',
    title: 'Ad Supported',
    description: 'Free for users, revenue from ads.',
    icon: '📢',
    badge: 'Coming Soon',
    badgeColor: 'amber',
  },
];

// ============================================
// NAME SUGGESTIONS GENERATOR
// ============================================

export function generateNameSuggestions(idea: string, appType: AppCategory | null): string[] {
  // Simple name generation based on keywords
  const words = idea.toLowerCase().split(' ');
  const prefixes = ['Nova', 'Mono', 'App', 'Flow', 'Pulse', 'Spark', 'Loop', 'Beam', 'Flux', 'Sync'];
  const suffixes = ['ify', 'ly', 'io', 'hub', 'lab', 'box', 'space', 'base', 'nest', 'zone'];
  
  const suggestions: string[] = [];
  
  // Generate 4 unique suggestions
  const usedPrefixes = new Set<number>();
  while (suggestions.length < 4 && usedPrefixes.size < prefixes.length) {
    const prefixIdx = Math.floor(Math.random() * prefixes.length);
    if (usedPrefixes.has(prefixIdx)) continue;
    usedPrefixes.add(prefixIdx);
    
    const prefix = prefixes[prefixIdx];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    // Different naming patterns
    const patterns = [
      `${prefix}${suffix}`,
      `${prefix}Forge`,
      `${prefix}Spark`,
      `${prefix}Sculpt`,
    ];
    
    suggestions.push(patterns[suggestions.length % patterns.length]);
  }
  
  return suggestions;
}

// ============================================
// THUMBNAIL STYLES
// ============================================

export interface ThumbnailStyle {
  id: string;
  bgGradient: string;
  iconPath: string;
  iconColor: string;
}

export const THUMBNAIL_STYLES: ThumbnailStyle[] = [
  {
    id: 'flame-dark',
    bgGradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    iconColor: '#ffffff',
  },
  {
    id: 'wave-red',
    bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    iconColor: '#ffffff',
  },
  {
    id: 'bolt-purple',
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    iconColor: '#ffffff',
  },
];

// ============================================
// HARDCODED QUESTIONS (existing)
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
    subtext: "Do you want to use a managed live-video service (like Mux), or run live streaming yourself using open technologies (like WebRTC)?\n\nThis decision affects reliability, time to launch, monthly costs, and whether you'll need specialized engineers later.\nIt's one of the hardest decisions to reverse once users depend on the app.",
    
    // New Mental Model Section
    mentalModel: {
      title: "Before you answer, here's the mental model",
      content: `Using a managed streaming service (like Mux) is like **renting a house**.
• You pay monthly.
• Most things "just work."
• When plumbing breaks, it's not your job to fix the pipes.

Running live streaming yourself is like **building your own house**.
• You might save money long-term.
• But you're responsible for wiring, plumbing, inspections, and repairs.
• If something breaks at 2am, it's your problem.

Neither option is "better." They optimize for different kinds of pain: money vs responsibility.`
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
    subtext: `Assume a competitor already exists and works fine. Why would someone switch to your app?

"Better UI" is not enough.
If switching requires effort, there must be a clear, painful reason.

What I'm actually testing:
• Do you have a real wedge?
• Or is this just a nicer version of something that already exists?`,
    suggestions: [
      `"I'm 10× better at one specific thing, not everything."`,
      `"I'm cheaper because I cut features on purpose."`,
      `"I'm built for one niche competitors ignore."`,
      `"I already have distribution (audience, community, school, org)."`,
      `"I enable something competitors literally can't do."`,
      `"I don't have a good answer yet."`
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
