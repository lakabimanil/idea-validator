import { 
  AppCategory, 
  ClassificationResult, 
  FinalReport, 
  RealityCheck,
  CATEGORY_LABELS 
} from '../types';

interface ReportContext {
  idea: string;
  classification: ClassificationResult;
  userAnswers: Record<string, string>;
  realityCheck: RealityCheck;
}

function analyzeStrengths(ctx: ReportContext): string {
  const { classification, userAnswers } = ctx;
  const { primaryCategory } = classification;

  // Look for positive signals in answers
  const positiveSignals: string[] = [];
  
  // Check for existing audience/distribution
  if (userAnswers['uni-4'] === 'existing-audience') {
    positiveSignals.push('You have existing distribution — that\'s rare and valuable.');
  }

  // Check for clear core feature
  if (userAnswers['uni-3'] === 'core-action') {
    positiveSignals.push('You\'ve identified a clear core action — good sign you understand the value prop.');
  }

  // Category-specific strengths
  if (primaryCategory === 'marketplace') {
    if (userAnswers['mp-1'] === 'existing-sellers' || userAnswers['mp-1'] === 'manual-recruit') {
      positiveSignals.push('You have a plan for supply — most marketplace founders don\'t.');
    }
    if (userAnswers['mp-2'] === 'niche-buyers') {
      positiveSignals.push('Niche focus can work if the niche is real and reachable.');
    }
  }

  if (primaryCategory === 'saas') {
    if (userAnswers['saas-1'] === 'daily-multiple' || userAnswers['saas-1'] === 'daily') {
      positiveSignals.push('Daily usage frequency is a strong retention signal.');
    }
    if (userAnswers['saas-4'] === 'critical') {
      positiveSignals.push('Mission-critical tools have pricing power.');
    }
  }

  if (primaryCategory === 'social') {
    if (userAnswers['social-2'] === 'network-effect') {
      positiveSignals.push('Network effects are real — if you can get past the cold start.');
    }
    if (userAnswers['social-3'] === 'invite-only') {
      positiveSignals.push('Invite-only can create quality and urgency.');
    }
  }

  if (primaryCategory === 'subscription-content') {
    if (userAnswers['sub-3'] === 'existing-audience') {
      positiveSignals.push('Existing audience means you can validate demand before building.');
    }
    if (userAnswers['sub-4'] === 'reference') {
      positiveSignals.push('Reference content retains better than consumable content.');
    }
  }

  if (primaryCategory === 'ai-tool') {
    if (userAnswers['ai-4'] === 'workflow' || userAnswers['ai-4'] === 'custom-model') {
      positiveSignals.push('Workflow integration or custom data creates a real moat.');
    }
    if (userAnswers['ai-1'] === 'low-stakes') {
      positiveSignals.push('Low-stakes AI usage means you can ship imperfect and iterate.');
    }
  }

  if (positiveSignals.length === 0) {
    return 'No clear standout advantages yet. That doesn\'t mean it won\'t work — just means you need to find your edge through execution.';
  }

  return positiveSignals.slice(0, 2).join(' ');
}

function analyzeWeaknesses(ctx: ReportContext): string {
  const { classification, userAnswers } = ctx;
  const { primaryCategory } = classification;

  const concerns: string[] = [];

  // Universal concerns
  if (userAnswers['uni-4'] === 'social-hope' || userAnswers['uni-4'] === 'no-plan') {
    concerns.push('No distribution strategy. This kills more startups than bad products.');
  }

  if (userAnswers['uni-3'] === 'everything') {
    concerns.push('Scope creep warning — shipping everything means shipping nothing.');
  }

  // Category-specific concerns
  if (primaryCategory === 'marketplace') {
    if (userAnswers['mp-1'] === 'no-plan') {
      concerns.push('No supply strategy is a fatal flaw for marketplaces.');
    }
    if (userAnswers['mp-3'] === 'no-plan') {
      concerns.push('Ignoring dispute resolution will burn you fast.');
    }
  }

  if (primaryCategory === 'saas') {
    if (userAnswers['saas-1'] === 'sporadic') {
      concerns.push('Sporadic usage = high churn. Users forget apps they don\'t use regularly.');
    }
    if (userAnswers['saas-3'] === 'overall-better') {
      concerns.push('"Better overall" rarely wins. Switching costs are real.');
    }
  }

  if (primaryCategory === 'social') {
    if (userAnswers['social-2'] === 'hoping') {
      concerns.push('Hope is not a retention strategy. You need a concrete answer.');
    }
    if (userAnswers['social-3'] === 'no-plan') {
      concerns.push('No moderation plan will kill your community fast.');
    }
  }

  if (primaryCategory === 'subscription-content') {
    if (userAnswers['sub-2'] === 'hoping') {
      concerns.push('High churn is the #1 killer of subscription content.');
    }
    if (userAnswers['sub-3'] === 'unsure') {
      concerns.push('No discovery strategy means no subscribers.');
    }
  }

  if (primaryCategory === 'ai-tool') {
    if (userAnswers['ai-1'] === 'high-stakes' || userAnswers['ai-1'] === 'no-plan') {
      concerns.push('High-stakes AI needs guardrails you probably don\'t have.');
    }
    if (userAnswers['ai-4'] === 'no-moat') {
      concerns.push('If ChatGPT works, you\'re competing with a free product.');
    }
  }

  if (concerns.length === 0) {
    return 'You\'ve thought through the obvious pitfalls. The real challenges will be execution and things you can\'t predict.';
  }

  return concerns.slice(0, 2).join(' ');
}

function identifyWedge(ctx: ReportContext): { wedge: string; hasWedge: boolean } {
  const { classification, userAnswers } = ctx;
  const { primaryCategory } = classification;

  // Look for clear differentiation signals
  const wedgeSignals: string[] = [];
  let hasWedge = false;
  
  // Distribution advantage
  if (userAnswers['uni-4'] === 'existing-audience') {
    wedgeSignals.push('existing audience/distribution');
    hasWedge = true;
  }

  // Category-specific wedges
  if (primaryCategory === 'marketplace') {
    if (userAnswers['mp-1'] === 'existing-sellers') {
      wedgeSignals.push('pre-existing supply relationships');
      hasWedge = true;
    }
    if (userAnswers['mp-2'] === 'niche-buyers') {
      wedgeSignals.push('access to a specific buyer segment');
    hasWedge = true;
    }
  }

  if (primaryCategory === 'saas') {
    if (userAnswers['saas-3'] === 'pain-point') {
      wedgeSignals.push('solving a specific, acute pain point');
    hasWedge = true;
    }
    if (userAnswers['saas-4'] === 'critical') {
      wedgeSignals.push('mission-critical workflow integration');
    hasWedge = true;
    }
  }

  if (primaryCategory === 'ai-tool') {
    if (userAnswers['ai-4'] === 'custom-model') {
      wedgeSignals.push('proprietary training data');
      hasWedge = true;
    }
    if (userAnswers['ai-4'] === 'workflow') {
      wedgeSignals.push('deep workflow integration');
      hasWedge = true;
    }
  }

  if (primaryCategory === 'subscription-content') {
    if (userAnswers['sub-3'] === 'existing-audience') {
      wedgeSignals.push('built-in audience');
      hasWedge = true;
    }
  }

  if (wedgeSignals.length > 0) {
    return {
      wedge: `Your potential wedge: ${wedgeSignals.join(' + ')}. Lean into this hard.`,
      hasWedge: true,
    };
  }
  
  return {
    wedge: 'No clear wedge identified yet. "Better UX" isn\'t a wedge. "I\'ll work harder" isn\'t a wedge. You need an unfair advantage — distribution, data, relationships, or timing.',
    hasWedge: false,
  };
}

function generateMVPScope(ctx: ReportContext): string[] {
  const { classification, userAnswers } = ctx;
  const { primaryCategory } = classification;

  const mvpItems: string[] = [];

  // Universal MVP items
  mvpItems.push('Core user flow (one path, no branching)');

  if (userAnswers['uni-3'] === 'core-action') {
    mvpItems.push('Single primary action, perfected');
  }

  // Category-specific MVP scope
  switch (primaryCategory) {
    case 'marketplace':
      mvpItems.push('Manual matching (no algorithm)');
      mvpItems.push('Stripe payment link (not custom checkout)');
      mvpItems.push('Email-based dispute handling');
      break;
    case 'saas':
      mvpItems.push('Single user type (no teams/roles)');
      mvpItems.push('Core functionality only (no integrations)');
      mvpItems.push('Basic auth (email/password)');
      break;
    case 'social':
      mvpItems.push('Invite-only launch (quality control)');
      mvpItems.push('Manual moderation');
      mvpItems.push('Core content type only');
      break;
    case 'subscription-content':
      mvpItems.push('One pricing tier');
      mvpItems.push('Gumroad/Stripe billing (not custom)');
      mvpItems.push('Email for community (not in-app)');
      break;
    case 'live-streaming':
      mvpItems.push('Live only (no recording/replay)');
      mvpItems.push('Single streaming provider');
      mvpItems.push('Chat via Discord/external');
      break;
    case 'ai-tool':
      mvpItems.push('One AI capability, done well');
      mvpItems.push('Clear error states and limitations');
      mvpItems.push('Human fallback for edge cases');
      break;
    default:
      mvpItems.push('Minimum viable feature set');
      mvpItems.push('Off-the-shelf components where possible');
  }

  // Cut based on user answers
  if (userAnswers['uni-2'] === 'speed') {
    mvpItems.push('Cut anything not essential to first 10 users');
  }

  return mvpItems.slice(0, 6);
}

function identifyTopRisks(ctx: ReportContext): string[] {
  const { classification, userAnswers } = ctx;
  const { primaryCategory, isHybrid } = classification;

  const risks: string[] = [];
  
  // Universal risks
  if (userAnswers['uni-4'] === 'no-plan' || userAnswers['uni-4'] === 'social-hope') {
    risks.push('No distribution — you can build it, but will anyone find it?');
  }

  if (userAnswers['uni-3'] === 'everything' || userAnswers['uni-3'] === 'unsure') {
    risks.push('Unclear scope — you\'ll spend 3 months building what should take 3 weeks.');
  }

  if (isHybrid) {
    risks.push('Hybrid model complexity — trying to be two things at once.');
  }

  // Category-specific risks
  switch (primaryCategory) {
    case 'marketplace':
      risks.push('Cold start death spiral — no supply, no demand, no supply.');
      if (userAnswers['mp-4'] === 'no-plan') {
        risks.push('Disintermediation — users routing around you.');
      }
      break;
    case 'saas':
      if (userAnswers['saas-1'] === 'weekly' || userAnswers['saas-1'] === 'sporadic') {
        risks.push('Low usage frequency — they\'ll forget you exist.');
      }
      risks.push('Feature creep from user requests — stay focused.');
      break;
    case 'social':
      risks.push('Empty room problem — no one talks in an empty room.');
      risks.push('Moderation burden grows faster than you expect.');
      break;
    case 'subscription-content':
      risks.push('Month 2 churn — the excitement cliff is real.');
      risks.push('Content creation burnout if you\'re the creator.');
      break;
    case 'live-streaming':
      risks.push('Infrastructure costs at scale — budget carefully.');
      risks.push('Technical complexity around real-time systems.');
      break;
    case 'ai-tool':
      risks.push('User trust erosion when AI makes mistakes.');
      risks.push('API cost unpredictability at scale.');
      break;
    default:
      risks.push('Unclear market fit — what problem does this solve?');
  }
  
  return risks.slice(0, 3);
}

function generateNextDecisions(ctx: ReportContext): string[] {
  const { classification, userAnswers } = ctx;
  const { primaryCategory } = classification;

  const decisions: string[] = [];
  
  // Universal decisions
  if (userAnswers['uni-4'] === 'no-plan' || userAnswers['uni-4'] === 'social-hope') {
    decisions.push('Find 10 potential users and validate demand before building.');
  } else {
    decisions.push('Talk to 5 potential users this week — validate assumptions.');
  }
  
  // Category-specific decisions
  switch (primaryCategory) {
    case 'marketplace':
      decisions.push('Pick supply or demand side to start with — you can\'t do both.');
      decisions.push('Define your take rate and how you\'ll handle payments.');
      break;
    case 'saas':
      decisions.push('Define the single metric that proves value to users.');
      decisions.push('Decide: freemium, free trial, or paid-only?');
      break;
    case 'social':
      decisions.push('Plan your first 50 users — who are they specifically?');
      decisions.push('Write your moderation policy before launch.');
      break;
    case 'subscription-content':
      decisions.push('Validate price point with actual pre-sales or waitlist.');
      decisions.push('Plan content cadence you can sustain for 6 months.');
      break;
    case 'live-streaming':
      decisions.push('Get cost estimates from at least 2 streaming providers.');
      decisions.push('Decide on MVP: live-only or replays essential?');
      break;
    case 'ai-tool':
      decisions.push('Define acceptable error rate and how you\'ll communicate limitations.');
      decisions.push('Estimate API costs at 100, 1000, and 10000 users.');
      break;
    default:
      decisions.push('Write a one-sentence pitch and test it on 10 strangers.');
      decisions.push('List everything you think you need, then cut 50%.');
  }

  decisions.push('Set a hard launch deadline — 4 weeks max for MVP.');

  return decisions.slice(0, 3);
}

export function generateFinalReport(ctx: ReportContext): FinalReport {
  const { idea, classification, realityCheck } = ctx;
  const wedgeResult = identifyWedge(ctx);

  // Generate a concise "what you're building" summary
  const categoryLabel = CATEGORY_LABELS[classification.primaryCategory];
  let whatYoureBuilding = realityCheck.whatYoureBuilding;
  if (classification.isHybrid && classification.secondaryCategory) {
    whatYoureBuilding += ` — a hybrid of ${categoryLabel} and ${CATEGORY_LABELS[classification.secondaryCategory]}.`;
  }

  return {
    whatYoureActuallyBuilding: whatYoureBuilding,
    whyThisMightWork: analyzeStrengths(ctx),
    whyThisMightNot: analyzeWeaknesses(ctx),
    theRealWedge: wedgeResult.wedge,
    hasWedge: wedgeResult.hasWedge,
    mvpScope: generateMVPScope(ctx),
    topRisks: identifyTopRisks(ctx),
    nextDecisions: generateNextDecisions(ctx),
    generatedAt: Date.now(),
  };
}

export function summarizeIdea(idea: string, classification: ClassificationResult): string {
  const { primaryCategory, isHybrid, secondaryCategory } = classification;
  const categoryLabel = CATEGORY_LABELS[primaryCategory];

  // Create a one-liner summary
  const ideaLower = idea.toLowerCase();
  const words = idea.split(/\s+/).slice(0, 30).join(' ');
  const truncated = words.length < idea.length ? words + '...' : words;

  let summary = `A ${categoryLabel.toLowerCase()}`;

  if (isHybrid && secondaryCategory) {
    summary += ` with ${CATEGORY_LABELS[secondaryCategory].toLowerCase()} elements`;
  }

  // Try to extract the core concept
  if (ideaLower.includes('for ')) {
    const forMatch = idea.match(/for\s+([^,.]+)/i);
    if (forMatch) {
      summary += ` for ${forMatch[1].trim()}`;
    }
  }

  return summary;
}
