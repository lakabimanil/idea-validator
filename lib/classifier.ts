import { AppCategory, CategoryScore, ClassificationResult } from '../types';

interface KeywordGroup {
  keywords: string[];
  weight: number;
}

const CATEGORY_KEYWORDS: Record<AppCategory, KeywordGroup[]> = {
  marketplace: [
    { keywords: ['marketplace', 'buy and sell', 'buyers', 'sellers', 'listing', 'listings'], weight: 3 },
    { keywords: ['two-sided', 'platform', 'connect', 'matching', 'match'], weight: 2 },
    { keywords: ['commission', 'fee', 'transaction', 'escrow', 'payment'], weight: 2 },
    { keywords: ['vendor', 'merchant', 'shop', 'store', 'inventory'], weight: 1.5 },
    { keywords: ['airbnb', 'uber', 'etsy', 'ebay', 'fiverr', 'upwork'], weight: 3 },
    { keywords: ['booking', 'reserve', 'hire', 'rent', 'rental'], weight: 1.5 },
  ],
  saas: [
    { keywords: ['saas', 'software', 'tool', 'dashboard', 'admin'], weight: 3 },
    { keywords: ['productivity', 'workflow', 'automation', 'automate'], weight: 2.5 },
    { keywords: ['team', 'collaborate', 'collaboration', 'workspace'], weight: 2 },
    { keywords: ['analytics', 'reporting', 'reports', 'metrics', 'tracking'], weight: 2 },
    { keywords: ['crm', 'erp', 'project management', 'task', 'tasks'], weight: 2.5 },
    { keywords: ['subscription', 'monthly', 'pricing tier', 'enterprise'], weight: 1.5 },
    { keywords: ['notion', 'slack', 'asana', 'monday', 'hubspot'], weight: 2 },
    { keywords: ['manage', 'organize', 'schedule', 'planning'], weight: 1 },
  ],
  social: [
    { keywords: ['social', 'community', 'network', 'networking'], weight: 3 },
    { keywords: ['friends', 'followers', 'following', 'connections'], weight: 2.5 },
    { keywords: ['feed', 'timeline', 'posts', 'sharing', 'share'], weight: 2 },
    { keywords: ['profile', 'profiles', 'user profiles'], weight: 1.5 },
    { keywords: ['like', 'comment', 'react', 'engage', 'engagement'], weight: 2 },
    { keywords: ['message', 'chat', 'dm', 'messaging'], weight: 1.5 },
    { keywords: ['instagram', 'twitter', 'tiktok', 'facebook', 'discord'], weight: 2 },
    { keywords: ['group', 'groups', 'forum', 'discussion'], weight: 1.5 },
  ],
  'subscription-content': [
    { keywords: ['subscription', 'subscribe', 'subscriber', 'membership'], weight: 2.5 },
    { keywords: ['content', 'creator', 'creators', 'exclusive'], weight: 2 },
    { keywords: ['course', 'courses', 'learning', 'education', 'tutorial'], weight: 2.5 },
    { keywords: ['newsletter', 'blog', 'articles', 'writing'], weight: 2 },
    { keywords: ['paywall', 'premium', 'paid', 'monetize'], weight: 2 },
    { keywords: ['patreon', 'substack', 'onlyfans', 'gumroad', 'teachable'], weight: 3 },
    { keywords: ['video', 'videos', 'series', 'episodes'], weight: 1.5 },
    { keywords: ['coaching', 'mentorship', 'consulting'], weight: 2 },
  ],
  'live-streaming': [
    { keywords: ['live', 'streaming', 'stream', 'broadcast', 'real-time', 'realtime'], weight: 3 },
    { keywords: ['video call', 'video chat', 'webinar', 'conference'], weight: 2.5 },
    { keywords: ['twitch', 'youtube live', 'zoom', 'meets'], weight: 2.5 },
    { keywords: ['viewers', 'audience', 'watch', 'watching'], weight: 2 },
    { keywords: ['chat', 'live chat', 'interaction', 'interactive'], weight: 1.5 },
    { keywords: ['event', 'events', 'virtual event', 'concert'], weight: 2 },
    { keywords: ['gaming', 'esports', 'sports'], weight: 1.5 },
  ],
  'ai-tool': [
    { keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml'], weight: 3 },
    { keywords: ['gpt', 'chatgpt', 'openai', 'llm', 'language model'], weight: 3 },
    { keywords: ['generate', 'generation', 'generated', 'generator'], weight: 2 },
    { keywords: ['automate', 'automation', 'automated', 'automatic'], weight: 1.5 },
    { keywords: ['smart', 'intelligent', 'predict', 'prediction'], weight: 1.5 },
    { keywords: ['copilot', 'assistant', 'bot', 'chatbot'], weight: 2 },
    { keywords: ['analyze', 'analysis', 'insight', 'insights'], weight: 1.5 },
    { keywords: ['image', 'images', 'text', 'voice', 'speech'], weight: 1 },
  ],
  // New categories for onboarding (mapped to existing categories for classification)
  'subscription-paywall': [
    { keywords: ['subscription', 'subscribe', 'subscriber', 'membership'], weight: 2.5 },
    { keywords: ['content', 'creator', 'creators', 'exclusive'], weight: 2 },
    { keywords: ['paywall', 'premium', 'paid', 'monetize'], weight: 2 },
  ],
  'web-store': [
    { keywords: ['store', 'shop', 'ecommerce', 'e-commerce'], weight: 3 },
    { keywords: ['products', 'catalog', 'inventory'], weight: 2 },
    { keywords: ['shopify', 'woocommerce'], weight: 2 },
  ],
  creator: [
    { keywords: ['creator', 'creators', 'content creator'], weight: 3 },
    { keywords: ['patreon', 'onlyfans', 'subscription'], weight: 2 },
    { keywords: ['fans', 'supporters', 'community'], weight: 1.5 },
  ],
  booking: [
    { keywords: ['booking', 'reserve', 'reservation', 'appointment'], weight: 3 },
    { keywords: ['schedule', 'calendar', 'availability'], weight: 2 },
    { keywords: ['restaurant', 'hotel', 'service'], weight: 1.5 },
  ],
  'social-feed': [
    { keywords: ['feed', 'timeline', 'posts', 'social'], weight: 3 },
    { keywords: ['scroll', 'like', 'comment', 'share'], weight: 2 },
    { keywords: ['instagram', 'twitter', 'tiktok'], weight: 2 },
  ],
  messaging: [
    { keywords: ['message', 'messaging', 'chat', 'dm'], weight: 3 },
    { keywords: ['conversation', 'talk', 'communicate'], weight: 2 },
    { keywords: ['whatsapp', 'telegram', 'signal'], weight: 2 },
  ],
  productivity: [
    { keywords: ['productivity', 'organize', 'manage'], weight: 3 },
    { keywords: ['habit', 'tracker', 'goal', 'progress'], weight: 2 },
    { keywords: ['todo', 'task', 'checklist'], weight: 2 },
  ],
  game: [
    { keywords: ['game', 'gaming', 'play', 'player'], weight: 3 },
    { keywords: ['multiplayer', 'competition', 'leaderboard'], weight: 2 },
    { keywords: ['casual', 'arcade', 'puzzle'], weight: 1.5 },
  ],
  'media-streaming': [
    { keywords: ['streaming', 'watch', 'listen', 'media'], weight: 3 },
    { keywords: ['video', 'music', 'podcast', 'audio'], weight: 2 },
    { keywords: ['netflix', 'spotify', 'youtube'], weight: 2 },
  ],
  other: [
    { keywords: ['utility', 'simple', 'basic', 'minimal'], weight: 1 },
    { keywords: ['health', 'fitness', 'wellness', 'meditation'], weight: 1.5 },
    { keywords: ['finance', 'fintech', 'banking', 'investment'], weight: 1.5 },
  ],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function calculateCategoryScore(text: string, category: AppCategory): number {
  const normalizedText = normalizeText(text);
  const keywordGroups = CATEGORY_KEYWORDS[category];
  let score = 0;

  for (const group of keywordGroups) {
    for (const keyword of group.keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        score += matches.length * group.weight;
      }
    }
  }

  return score;
}

function getConfidence(score: number, maxScore: number): 'low' | 'medium' | 'high' {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  return 'low';
}

export function classifyIdea(ideaText: string): ClassificationResult {
  const categories: AppCategory[] = [
    'marketplace',
    'saas',
    'social',
    'subscription-content',
    'live-streaming',
    'ai-tool',
    'other',
  ];

  const scores: CategoryScore[] = categories.map((category) => ({
    category,
    score: calculateCategoryScore(ideaText, category),
    confidence: 'low' as const,
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const maxScore = scores[0].score;
  const secondScore = scores[1]?.score || 0;

  // Update confidence levels
  scores.forEach((s) => {
    s.confidence = getConfidence(s.score, maxScore);
  });

  // Determine if hybrid (two categories are close in score)
  const isHybrid = maxScore > 0 && secondScore > 0 && secondScore / maxScore >= 0.6;

  // If no strong signals, default to 'other'
  const primaryCategory = maxScore >= 2 ? scores[0].category : 'other';
  const secondaryCategory = isHybrid && scores[1].score >= 2 ? scores[1].category : undefined;

  return {
    primaryCategory,
    secondaryCategory,
    scores,
    isHybrid,
  };
}

export function getComplexityLevel(
  ideaText: string,
  classification: ClassificationResult
): 'Low' | 'Medium' | 'High' {
  const text = normalizeText(ideaText);
  let complexityScore = 0;

  // High complexity indicators
  const highComplexity = [
    'marketplace', 'two-sided', 'payment', 'escrow', 'live streaming',
    'real-time', 'video call', 'machine learning', 'ai', 'recommendation',
    'matching algorithm', 'moderation', 'verification', 'identity',
  ];

  // Medium complexity indicators
  const mediumComplexity = [
    'subscription', 'authentication', 'user accounts', 'notifications',
    'messaging', 'upload', 'search', 'filter', 'dashboard', 'analytics',
    'integration', 'api', 'sync',
  ];

  for (const keyword of highComplexity) {
    if (text.includes(keyword)) complexityScore += 2;
  }

  for (const keyword of mediumComplexity) {
    if (text.includes(keyword)) complexityScore += 1;
  }

  // Category-based complexity
  if (['marketplace', 'live-streaming'].includes(classification.primaryCategory)) {
    complexityScore += 3;
  } else if (['social', 'ai-tool'].includes(classification.primaryCategory)) {
    complexityScore += 2;
  }

  // Hybrid adds complexity
  if (classification.isHybrid) {
    complexityScore += 2;
  }

  if (complexityScore >= 6) return 'High';
  if (complexityScore >= 3) return 'Medium';
  return 'Low';
}

export function inferBiggestRisk(
  ideaText: string,
  classification: ClassificationResult
): string {
  const { primaryCategory, isHybrid } = classification;

  const categoryRisks: Record<AppCategory, string> = {
    marketplace: 'Cold start problem — you need supply before demand, but suppliers won\'t show up without buyers.',
    saas: 'Frequency of use — if people don\'t use it daily, they\'ll forget it exists and churn.',
    social: 'Content creation burden — if users have to create content, most won\'t. The app dies empty.',
    'subscription-content': 'Retention after month one — excitement fades fast, and canceling is one click away.',
    'live-streaming': 'Cost at scale — streaming infrastructure gets expensive quickly, and margins disappear.',
    'ai-tool': 'Accuracy expectations — users will blame you when the AI is wrong, even if you warned them.',
    'subscription-paywall': 'Retention after month one — excitement fades fast, and canceling is one click away.',
    'web-store': 'Trust and conversion — users are hesitant to buy from unknown brands on mobile.',
    creator: 'Creator acquisition — you need compelling creators first, but they won\'t join without an audience.',
    booking: 'Marketplace dynamics — you need service providers before customers, but providers won\'t list without demand.',
    'social-feed': 'Content creation burden — if users have to create content, most won\'t. The app dies empty.',
    messaging: 'Network effects — a messaging app is useless if your friends aren\'t on it.',
    productivity: 'Habit formation — users download it with good intentions but never build the habit.',
    game: 'Engagement cliff — most players drop off after day 1. Retention is brutal.',
    'media-streaming': 'Content costs — licensing or creating quality content is expensive and time-consuming.',
    other: 'Unclear value proposition — if you can\'t explain it in one sentence, users won\'t get it.',
  };

  if (isHybrid) {
    return 'Scope creep — hybrid apps try to do too much and end up doing nothing well.';
  }

  return categoryRisks[primaryCategory];
}

export interface BuilderInsight {
  technicalComplexity: string;
  estimatedDevTime: string;
  keyRisk: string;
  coreTechStack: string[];
}

export function getBuilderInsights(
  ideaText: string,
  classification: ClassificationResult
): BuilderInsight {
  const { primaryCategory, isHybrid } = classification;
  const complexity = getComplexityLevel(ideaText, classification);

  const insights: Record<AppCategory, BuilderInsight> = {
    marketplace: {
      technicalComplexity: 'High (Payment logic, matching algorithms)',
      estimatedDevTime: '3-4 months for MVP',
      keyRisk: 'Liquidity: Supply must match demand geography/timing.',
      coreTechStack: ['PostgreSQL (Relational data)', 'Redis (Caching)', 'Stripe Connect'],
    },
    saas: {
      technicalComplexity: 'Medium (CRUD, Auth, State management)',
      estimatedDevTime: '2-3 months for MVP',
      keyRisk: 'Churn: Value must be delivered immediately.',
      coreTechStack: ['PostgreSQL', 'Next.js', 'Vercel'],
    },
    social: {
      technicalComplexity: 'High (Real-time, Graph data)',
      estimatedDevTime: '3-4 months for MVP',
      keyRisk: 'Empty State: Social apps are boring without content.',
      coreTechStack: ['Supabase Realtime', 'Graph/Relational hybrid', 'CDN for media'],
    },
    'subscription-content': {
      technicalComplexity: 'Medium (CMS, Gating logic)',
      estimatedDevTime: '1-2 months for MVP',
      keyRisk: 'Content Treadmill: Producing enough value monthly.',
      coreTechStack: ['Stripe Subscriptions', 'CDN (Video/Audio)', 'Next.js'],
    },
    'live-streaming': {
      technicalComplexity: 'Very High (Latency, Bandwidth, Infrastructure)',
      estimatedDevTime: '4-6 months for MVP',
      keyRisk: 'Unit Economics: Streaming costs scale linearly.',
      coreTechStack: ['WebRTC', 'Mux/AWS IVS', 'WebSocket server'],
    },
    'ai-tool': {
      technicalComplexity: 'High (LLM integration, Prompt engineering)',
      estimatedDevTime: '1-3 months for MVP (depends on model)',
      keyRisk: 'Hallucination & Cost: API bills can spike.',
      coreTechStack: ['OpenAI/Anthropic API', 'Vector Database (Pinecone/pgvector)', 'Edge Functions'],
    },
    'subscription-paywall': {
      technicalComplexity: 'Medium (CMS, Gating logic)',
      estimatedDevTime: '1-2 months for MVP',
      keyRisk: 'Content Treadmill: Producing enough value monthly.',
      coreTechStack: ['Stripe Subscriptions', 'CDN (Video/Audio)', 'Next.js'],
    },
    'web-store': {
      technicalComplexity: 'Medium (Catalog, Cart, Checkout)',
      estimatedDevTime: '2-3 months for MVP',
      keyRisk: 'Conversion: Mobile checkout has high drop-off.',
      coreTechStack: ['Shopify API', 'Stripe', 'Next.js'],
    },
    creator: {
      technicalComplexity: 'High (Payment splits, Content delivery)',
      estimatedDevTime: '3-4 months for MVP',
      keyRisk: 'Creator acquisition: Chicken-and-egg problem.',
      coreTechStack: ['Stripe Connect', 'CDN', 'PostgreSQL'],
    },
    booking: {
      technicalComplexity: 'Medium (Calendar, Availability, Notifications)',
      estimatedDevTime: '2-3 months for MVP',
      keyRisk: 'No-shows and cancellations hurt trust.',
      coreTechStack: ['Calendar API', 'PostgreSQL', 'Email/SMS'],
    },
    'social-feed': {
      technicalComplexity: 'High (Real-time, Content moderation)',
      estimatedDevTime: '3-4 months for MVP',
      keyRisk: 'Empty State: Social apps are boring without content.',
      coreTechStack: ['Supabase Realtime', 'CDN for media', 'PostgreSQL'],
    },
    messaging: {
      technicalComplexity: 'Very High (Real-time sync, E2E encryption)',
      estimatedDevTime: '4-5 months for MVP',
      keyRisk: 'Network effects: Useless without critical mass.',
      coreTechStack: ['WebSocket', 'Redis Pub/Sub', 'E2E encryption'],
    },
    productivity: {
      technicalComplexity: 'Low-Medium (Data models, Reminders)',
      estimatedDevTime: '1-2 months for MVP',
      keyRisk: 'Habit formation: Users download but don\'t stick.',
      coreTechStack: ['PostgreSQL', 'Push notifications', 'Next.js'],
    },
    game: {
      technicalComplexity: 'Medium-High (Game logic, Physics, Multiplayer)',
      estimatedDevTime: '3-6 months for MVP',
      keyRisk: 'Retention: Most drop off after day 1.',
      coreTechStack: ['Game engine', 'WebSocket (if multiplayer)', 'Leaderboard DB'],
    },
    'media-streaming': {
      technicalComplexity: 'High (CDN, DRM, Adaptive streaming)',
      estimatedDevTime: '3-4 months for MVP',
      keyRisk: 'Content costs: Licensing or creation is expensive.',
      coreTechStack: ['CDN', 'Video encoding', 'DRM (if needed)'],
    },
    other: {
      technicalComplexity: 'Variable',
      estimatedDevTime: '2-3 months',
      keyRisk: 'Market Fit: Problem might not be acute enough.',
      coreTechStack: ['PostgreSQL', 'Next.js', 'Tailwind CSS'],
    },
  };

  const baseInsight = insights[primaryCategory];

  // Adjust for hybrid or complexity
  if (isHybrid) {
    baseInsight.technicalComplexity += ' (Increased due to hybrid nature)';
    baseInsight.estimatedDevTime = '4-5 months (Hybrid scope)';
    baseInsight.keyRisk = 'Scope Creep: Trying to build two apps at once.';
  }

  if (complexity === 'High' && !isHybrid) {
     baseInsight.estimatedDevTime = baseInsight.estimatedDevTime.replace(/(\d+)/, (m) => String(parseInt(m) + 1));
  }

  return baseInsight;
}

export function suggestFirstCut(
  ideaText: string,
  classification: ClassificationResult
): string {
  const { primaryCategory } = classification;
  const text = normalizeText(ideaText);

  // Look for common feature bloat
  const featureBloat = [
    { keyword: 'chat', cut: 'Real-time chat — use email notifications instead for MVP.' },
    { keyword: 'messaging', cut: 'In-app messaging — link to existing channels (WhatsApp, email) instead.' },
    { keyword: 'recommendation', cut: 'Smart recommendations — start with simple sorting/filtering.' },
    { keyword: 'ai', cut: 'AI features — start with manual curation or simple rules.' },
    { keyword: 'notification', cut: 'Push notifications — email works fine for MVP.' },
    { keyword: 'analytics', cut: 'Analytics dashboard — use a third-party tool initially.' },
    { keyword: 'payment', cut: 'Custom payment flow — use Stripe checkout links.' },
    { keyword: 'search', cut: 'Advanced search — simple category browsing is enough to start.' },
  ];

  for (const { keyword, cut } of featureBloat) {
    if (text.includes(keyword)) {
      return cut;
    }
  }

  const categoryCuts: Record<AppCategory, string> = {
    marketplace: 'Automated matching — do it manually first to learn what users actually need.',
    saas: 'User roles and permissions — start with one user type and expand later.',
    social: 'Social features like likes/comments — focus on core value first.',
    'subscription-content': 'Multiple pricing tiers — start with one price and adjust based on data.',
    'live-streaming': 'Recording and replays — just do live first and validate demand.',
    'ai-tool': 'Multiple AI models or options — pick one and make it work well.',
    'subscription-paywall': 'Multiple pricing tiers — start with one price and adjust based on data.',
    'web-store': 'Advanced filters and search — simple catalog is enough to start.',
    creator: 'Creator analytics dashboard — manual payouts work fine initially.',
    booking: 'Complex availability rules — start with simple time slots.',
    'social-feed': 'Algorithm and personalization — chronological feed works great for MVP.',
    messaging: 'Voice/video calls — text messaging is plenty for MVP.',
    productivity: 'Team collaboration features — start single-player first.',
    game: 'Multiplayer mode — single player is easier to nail first.',
    'media-streaming': 'Offline downloads — streaming-only keeps it simple.',
    other: 'Any feature you\'re not 100% sure users need — cut it ruthlessly.',
  };

  return categoryCuts[primaryCategory];
}
