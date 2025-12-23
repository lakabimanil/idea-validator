'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { classifyIdea } from '../lib/classifier';
import { buildQuestionFlow, getPillarLabel } from '../lib/questions';
import { 
  ClassificationResult, 
  Question, 
  ThinkingQuestion, 
  DecisionQuestion,
  UserResponse,
  CATEGORY_LABELS,
  DecisionOption
} from '../types';
import PixelBackground from '../components/PixelBackground';

// ============================================
// TYPES
// ============================================

type MessageType = 'ai' | 'user' | 'divider';

interface ChatMessage {
  id: string;
  role: MessageType;
  content: React.ReactNode;
  timestamp: number;
}

// Onboarding phases
const PHASES = [
  { id: 'validate', label: 'Validate' },
  { id: 'name', label: 'Name' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'brief', label: 'Brief' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function Home() {
  const router = useRouter();
  
  // Input State
  const [idea, setIdea] = useState('');
  const [editableIdea, setEditableIdea] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isEditingIdea, setIsEditingIdea] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  // Logic State
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [questionFlow, setQuestionFlow] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  
  // UI State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const flowRef = useRef<Question[]>([]);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [activeDecisionQuestion, setActiveDecisionQuestion] = useState<DecisionQuestion | null>(null);
  const [expandedPastQuestions, setExpandedPastQuestions] = useState<Set<string>>(new Set());
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [editedResponseText, setEditedResponseText] = useState('');

  const isValid = idea.trim().length >= 10;
  
  // Progress
  const totalQuestions = questionFlow.length || 8;
  const answeredQuestions = responses.length;
  const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const questionsRemaining = totalQuestions - answeredQuestions;

  // Auto-scroll
  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  // Keep flowRef in sync with questionFlow state
  useEffect(() => {
    flowRef.current = questionFlow;
  }, [questionFlow]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input after presenting thinking question
  useEffect(() => {
    const currentQ = questionFlow[currentIndex];
    if (currentQ?.type === 'thinking' && !isTyping && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, isTyping, questionFlow]);

  // Typewriter animation for placeholder
  useEffect(() => {
    if (hasStarted) {
      setAnimatedPlaceholder('');
      setShowCursor(true);
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
      return;
    }
    
    const fullText = 'I want to build...';
    let currentIndex = 0;
    
    // Start typing after form animation delay
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setAnimatedPlaceholder(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          // Blinking cursor after typing is complete
          clearInterval(typeInterval);
          cursorIntervalRef.current = setInterval(() => {
            setShowCursor(prev => !prev);
          }, 530);
        }
      }, 80); // Typing speed - adjust as needed
      
      return () => {
        clearInterval(typeInterval);
        if (cursorIntervalRef.current) {
          clearInterval(cursorIntervalRef.current);
          cursorIntervalRef.current = null;
        }
      };
    }, 600); // Wait for form animation
    
    return () => {
      clearTimeout(startDelay);
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [hasStarted]);

  const addAiMessage = (content: React.ReactNode) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36),
        role: 'ai',
        content,
        timestamp: Date.now()
      }]);
    }, 600);
  };

  const addUserMessage = (content: React.ReactNode) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36),
      role: 'user',
      content,
      timestamp: Date.now()
    }]);
  };

  // ============================================
  // QUESTION PRESENTATION
  // ============================================

  const presentQuestion = (q: Question) => {
    if (q.type === 'thinking') {
      presentThinkingQuestion(q as ThinkingQuestion);
    } else {
      presentDecisionQuestion(q as DecisionQuestion);
    }
  };

  // THINKING QUESTIONS - Conversational with smart suggestions
  const presentThinkingQuestion = (q: ThinkingQuestion) => {
    const content = (
      <div className="space-y-5 animate-fade-in-up w-full">
        {/* Question */}
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-white leading-tight tracking-tight">
            {q.prompt}
          </h2>
          {q.subtext && (
            <p className="text-[#666] text-sm leading-relaxed">
              {q.subtext}
            </p>
          )}
        </div>

        {/* Smart suggestions - clickable options */}
        {q.suggestions && q.suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
              Pick one or write your own
            </p>
            <div className="space-y-2">
              {q.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleThinkingSuggestionSelect(q.id, s)}
                  className="w-full text-left p-3.5 rounded-lg bg-black/60 backdrop-blur-xl border border-[#222] hover:border-[#444] hover:bg-black/70 transition-all duration-150 group shadow-lg"
                >
                  <p className="text-sm text-[#999] group-hover:text-[#CCC] leading-relaxed transition-colors">
                    {s}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    addAiMessage(content);
  };

  // DECISION QUESTIONS - Set as active (rendered separately for interactivity)
  const presentDecisionQuestion = (q: DecisionQuestion) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setActiveDecisionQuestion(q);
    }, 600);
  };

  // Decision Question Component - Rendered live for interactivity
  const DecisionQuestionUI = ({ q }: { q: DecisionQuestion }) => {
    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
    
    return (
      <div className="space-y-6 animate-fade-in-up w-full">
        
        {/* SECTION 1: The Setup - What we're deciding */}
        <div className="space-y-4">
          <span className="inline-block text-[10px] font-semibold text-[#FFBE5D] uppercase tracking-wider bg-[#FFBE5D]/10 px-3 py-1 rounded-full">
            Livestreaming Backbone
          </span>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {q.prompt}
          </h2>
        </div>

        {/* SECTION 2: The Question */}
        <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-5 shadow-2xl">
          <p className="text-[10px] text-[#FFBE5D] uppercase tracking-wider font-bold mb-2">Question</p>
          <p className="text-white text-lg font-medium leading-relaxed mb-4">
            Do you want to use a managed live-video service (like Mux), or run live streaming yourself using open technologies (like WebRTC)?
          </p>
          <div className="text-sm text-[#777] leading-relaxed space-y-2">
            <p>This decision affects reliability, time to launch, monthly costs, and whether you'll need specialized engineers later.</p>
            <p className="text-[#FFBE5D]/80">It's one of the hardest decisions to reverse once users depend on the app.</p>
          </div>
        </div>

        {/* SECTION 3: Mental Model - After the question */}
        {q.mentalModel && (
          <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-5 shadow-2xl">
            <h3 className="text-white text-sm font-semibold mb-4">
              {q.mentalModel.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="text-3xl mb-2">🏠</div>
                <h4 className="text-white font-semibold text-sm mb-2">Using a managed service (like Mux) is like renting a house</h4>
                <ul className="space-y-1.5 text-xs text-[#888]">
                  <li>• You pay monthly</li>
                  <li>• Most things "just work"</li>
                  <li>• When plumbing breaks, it's not your job to fix the pipes</li>
                </ul>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="text-3xl mb-2">🔨</div>
                <h4 className="text-white font-semibold text-sm mb-2">Running live streaming yourself is like building your own house</h4>
                <ul className="space-y-1.5 text-xs text-[#888]">
                  <li>• You might save money long-term</li>
                  <li>• But you're responsible for wiring, plumbing, inspections, and repairs</li>
                  <li>• If something breaks at 2am, it's your problem</li>
                </ul>
              </div>
            </div>
            <p className="text-center text-zinc-500 text-sm mt-4">
              Neither option is "better." They optimize for different kinds of pain: <span className="text-white">money vs responsibility</span>.
            </p>
          </div>
        )}

        {/* SECTION 5: Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((option, idx) => {
            const isManaged = idx === 0;
            const isExpanded = expandedOptions.has(option.id);
            const icon = isManaged ? '🏠' : '🔨';
            
            return (
              <div
                key={option.id}
                className="rounded-xl border border-[#222] bg-black/70 backdrop-blur-xl hover:border-[#444] transition-all duration-300 overflow-hidden shadow-2xl"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                          {isManaged ? 'Option A: Managed streaming' : 'Option B: Self-hosted streaming'}
                        </h3>
                        <p className="text-xs text-zinc-500">{isManaged ? 'e.g. Mux, AWS IVS' : 'WebRTC / Open Source'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${
                      isManaged 
                        ? 'bg-[#1A1A1A] text-white' 
                        : 'bg-[#1A1A1A] text-[#888]'
                    }`}>
                      {option.complexity === 'Easy' ? 'EASIER' : 'HARDER'}
                    </span>
                  </div>

                  {/* Key Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666]">Time to launch</span>
                      <span className={`font-medium ${isManaged ? 'text-white' : 'text-[#888]'}`}>
                        {isManaged ? '2–4 weeks' : '2–4 months'}
                      </span>
                    </div>
                    <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isManaged ? 'bg-white w-[20%]' : 'bg-[#444] w-[80%]'}`} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666]">Monthly cost (10k viewers)</span>
                      <span className={`font-medium ${isManaged ? 'text-white' : 'text-[#888]'}`}>
                        {isManaged ? '$500–$2,000+' : '$300–$1,200 + eng'}
                      </span>
                    </div>
                    <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isManaged ? 'bg-white w-[60%]' : 'bg-[#444] w-[40%]'}`} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666]">Expertise needed</span>
                      <span className={`font-medium ${isManaged ? 'text-white' : 'text-[#888]'}`}>
                        {isManaged ? 'Basic integration' : 'Video engineer ($8–15k/mo)'}
                      </span>
                    </div>
                    <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isManaged ? 'bg-white w-[15%]' : 'bg-[#444] w-[85%]'}`} />
                    </div>
                  </div>

                  {/* Why Users Care */}
                  <div className="mb-4 p-3 rounded-lg bg-[#111] border border-[#1A1A1A]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Why users care</p>
                    <p className="text-sm text-[#AAA] leading-relaxed">{option.whyUsersCare}</p>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => {
                      setExpandedOptions(prev => {
                        const next = new Set(prev);
                        if (isExpanded) {
                          next.delete(option.id);
                        } else {
                          next.add(option.id);
                        }
                        return next;
                      });
                    }}
                    className="w-full text-xs py-2.5 rounded-lg border border-[#222] text-[#888] hover:text-white hover:border-[#333] transition-all font-medium"
                  >
                    {isExpanded ? '↑ Hide full details' : '↓ See full details'}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#1A1A1A] space-y-4 animate-fade-in">
                    {/* Business Impact */}
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Business Impact</p>
                      <p className="text-sm text-[#AAA] leading-relaxed">{option.businessImpact}</p>
                    </div>

                    {/* Full Cost Breakdown */}
                    <div className="p-3 rounded-lg bg-[#111] border border-[#1A1A1A]">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Full Cost Breakdown</p>
                      <div className="text-xs text-[#888] leading-relaxed whitespace-pre-line">
                        {option.costDetail.split('\n').map((line, i) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <div key={i} className="mb-1">
                              {parts.map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={j} className="text-[#CCC] font-semibold">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Who Deals With Pain */}
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Who deals with the pain</p>
                      <p className="text-sm text-[#AAA] leading-relaxed whitespace-pre-line">{option.whoDealsWithPain}</p>
                    </div>

                    {/* Upsides */}
                    {option.upsides && option.upsides.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Upside</p>
                        <ul className="space-y-1.5">
                          {option.upsides.map((item, i) => (
                            <li key={i} className="text-sm text-[#AAA] flex items-start gap-2">
                              <span className="text-white shrink-0">+</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tradeoffs */}
                    {option.tradeoffs && option.tradeoffs.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Tradeoffs</p>
                        <ul className="space-y-1.5">
                          {option.tradeoffs.map((item, i) => (
                            <li key={i} className="text-sm text-[#AAA] flex items-start gap-2">
                              <span className="text-[#666] shrink-0">−</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => handleDecisionSelect(q.id, option)}
                  className={`w-full py-4 font-semibold text-sm transition-all border-t ${
                    isManaged 
                      ? 'bg-white hover:bg-[#E5E5E5] text-black border-[#1A1A1A]' 
                      : 'bg-[#1A1A1A] hover:bg-[#222] text-white border-[#1A1A1A]'
                  }`}
                >
                  Choose {isManaged ? 'Managed' : 'Self-Hosted'} →
                </button>
              </div>
            );
          })}
        </div>

        {/* SECTION 6: Reality Check */}
        {q.realityCheck && (
          <div className="bg-black/70 backdrop-blur-xl border border-[#FFBE5D]/30 rounded-xl p-4 shadow-2xl">
            <div className="flex gap-3 items-start">
              <span className="text-base">⚠️</span>
              <div>
                <p className="text-[10px] text-[#FFBE5D] uppercase tracking-wider font-bold mb-1">Reality Check</p>
                <p className="text-sm text-[#AAA] leading-relaxed whitespace-pre-line">
                  {q.realityCheck}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: Why This Matters */}
        {q.whyMatters && (
          <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-4 shadow-2xl">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Why this question matters</p>
            <p className="text-sm text-[#777] leading-relaxed whitespace-pre-line">
              {q.whyMatters}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleThinkingSuggestionSelect = (questionId: string, suggestion: string) => {
    if (isComplete) return;

    addUserMessage(suggestion);

    const response: UserResponse = {
      questionId,
      questionType: 'thinking',
      response: suggestion,
      responseText: suggestion,
      timestamp: Date.now()
    };
    setResponses(prev => {
      const newResponses = [...prev, response];
      advanceFlow(newResponses, flowRef.current);
      return newResponses;
    });
    setInputValue('');
  };

  const handleDecisionSelect = (questionId: string, option: DecisionOption) => {
    if (isComplete) return;

    // Clear the active decision question
    setActiveDecisionQuestion(null);

    addUserMessage(
      <span className="text-white">{option.title}</span>
    );

    const response: UserResponse = {
      questionId,
      questionType: 'decision',
      response: option.id,
      responseText: option.title,
      timestamp: Date.now()
    };
    setResponses(prev => {
      const newResponses = [...prev, response];
      advanceFlow(newResponses, flowRef.current);
      return newResponses;
    });
  };

  const handleSkip = () => {
    setShowSkipWarning(true);
  };

  const confirmSkip = () => {
    setShowSkipWarning(false);
    setIsComplete(true);
    addUserMessage(
      <span className="text-[#666] italic">Skipped onboarding</span>
    );
    setTimeout(() => {
      finishOnboarding(responses);
    }, 600);
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isComplete) return;

    const currentQ = flowRef.current[currentIndex];
    if (!currentQ) return;
    
    addUserMessage(inputValue);

    const response: UserResponse = {
      questionId: currentQ.id,
      questionType: 'thinking',
      response: inputValue,
      responseText: inputValue,
      timestamp: Date.now()
    };
    setResponses(prev => {
      const newResponses = [...prev, response];
      advanceFlow(newResponses, flowRef.current);
      return newResponses;
    });
    setInputValue('');
  };

  const advanceFlow = (currentResponses: UserResponse[], flow: Question[]) => {
    console.log('🔥 ADVANCE FLOW: currentIndex=', currentIndex, 'flow.length=', flow.length, 'responses.length=', currentResponses.length);
    setCurrentIndex(prevIndex => {
      console.log('🔥 SETTING INDEX: prevIndex=', prevIndex, 'flow.length=', flow.length);
      if (prevIndex < flow.length - 1) {
        const nextIndex = prevIndex + 1;
        console.log('🔥 MOVING TO QUESTION:', nextIndex, flow[nextIndex]?.id, flow[nextIndex]?.type);
        setTimeout(() => {
          presentQuestion(flow[nextIndex]);
        }, 400);
        return nextIndex;
      } else {
        console.log('🔥 FLOW COMPLETE - showing summary');
        setIsComplete(true);
        setTimeout(() => {
          finishOnboarding(currentResponses);
        }, 600);
        return prevIndex;
      }
    });
  };

  // ============================================
  // END SUMMARY
  // ============================================

  const finishOnboarding = (finalResponses: UserResponse[]) => {
    // Build summary from responses
    const thinkingResponses = finalResponses.filter(r => r.questionType === 'thinking');
    const decisionResponses = finalResponses.filter(r => r.questionType === 'decision');

    const content = (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Here's what you've decided
          </h3>
          <p className="text-[#666] text-sm">
            {finalResponses.length} questions answered. Your strategy is taking shape.
          </p>
        </div>

        {/* Decisions recap */}
        {decisionResponses.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[#555] uppercase tracking-wider">Key Decisions</p>
            <div className="space-y-2">
              {decisionResponses.map((r, i) => {
                const question = questionFlow.find(q => q.id === r.questionId) as DecisionQuestion;
                const option = question?.options.find(o => o.id === r.response);
                return (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-zinc-600">→</span>
                    <div>
                      <span className="text-white">{r.responseText}</span>
                      {option?.cost && (
                        <span className="text-zinc-500 ml-2">({option.cost})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Positioning insights */}
        {thinkingResponses.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[#555] uppercase tracking-wider">Your Positioning</p>
            <div className="bg-black/60 backdrop-blur-xl border border-[#222] rounded-lg p-3 shadow-xl">
              <p className="text-sm text-[#888] leading-relaxed line-clamp-3">
                "{thinkingResponses[0]?.responseText}"
              </p>
            </div>
          </div>
        )}

        {/* Next step */}
        <button 
          onClick={() => {
            // TODO: Navigate to naming phase
            alert('Naming phase coming soon! For now, this validates your strategy.');
          }}
          className="w-full h-11 bg-white text-black rounded-xl font-semibold hover:bg-[#E5E5E5] transition-colors text-sm flex items-center justify-center gap-2"
        >
          Continue to naming
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    );

    addAiMessage(content);
  };

  // ============================================
  // RESET / START
  // ============================================

  const handleRegenerateFromQuestion = (questionIndex: number) => {
    // Remove all responses after this index
    const newResponses = responses.slice(0, questionIndex);
    setResponses(newResponses);
    
    // Clear messages after the question
    const questionId = responses[questionIndex - 1]?.questionId;
    const questionMsgIndex = messages.findIndex((msg) => {
      // Find the message index where this question appeared
      return msg.role === 'ai';
    });
    
    // Clear active decision question
    setActiveDecisionQuestion(null);
    
    // Reset state
    setCurrentIndex(questionIndex);
    setIsComplete(false);
    setEditingResponse(null);
    setEditedResponseText('');
    
    // Present the question at this index
    setTimeout(() => {
      if (questionFlow[questionIndex]) {
        presentQuestion(questionFlow[questionIndex]);
      }
    }, 300);
  };

  const handleEditResponse = (responseId: string, newText: string) => {
    // Update the response
    setResponses(prev => prev.map(r => 
      r.questionId === responseId 
        ? { ...r, response: newText, responseText: newText }
        : r
    ));
    
    setEditingResponse(null);
    setEditedResponseText('');
  };

  const handleReset = () => {
    setHasStarted(false);
    setIdea('');
    setEditableIdea('');
    setClassification(null);
    setQuestionFlow([]);
    setCurrentIndex(0);
    setResponses([]);
    setMessages([]);
    setIsTyping(false);
    setInputValue('');
    setIsComplete(false);
    setIsEditingIdea(false);
    setActiveDecisionQuestion(null);
    setExpandedPastQuestions(new Set());
    setEditingResponse(null);
    setEditedResponseText('');
  };

  const handleRegenerate = () => {
    if (editableIdea.trim().length < 10) return;
    
    const trimmedIdea = editableIdea.trim();
    setIdea(trimmedIdea);
    setIsEditingIdea(false);
    
    setClassification(null);
    setQuestionFlow([]);
    setCurrentIndex(0);
    setResponses([]);
    setMessages([]);
    setIsTyping(false);
    setInputValue('');
    setIsComplete(false);
    setActiveDecisionQuestion(null);
    
    const result = classifyIdea(trimmedIdea);
    setClassification(result);
    const flow = buildQuestionFlow(result, 8);
    console.log('🔥 QUESTION FLOW:', flow.length, 'questions');
    console.log('🔥 FLOW TYPES:', flow.map(q => `${q.id} (${q.type})`));
    setQuestionFlow(flow);

    addAiMessage(
      <p className="text-[#666] text-sm">
        Looks like a <span className="text-white font-medium">{CATEGORY_LABELS[result.primaryCategory]}</span>. Let's think through this.
      </p>
    );

    setTimeout(() => {
      if (flow.length > 0) {
        presentQuestion(flow[0]);
      }
    }, 1000);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    const trimmedIdea = idea.trim();
    
    // Store idea in sessionStorage and redirect to validator
    sessionStorage.setItem('app-idea', trimmedIdea);
    router.push('/validator');
  };

  const currentQ = questionFlow[currentIndex];
  const isDecisionQuestion = currentQ?.type === 'decision';
  const isInputDisabled = isTyping || isComplete || isDecisionQuestion;

  // ============================================
  // INITIAL STATE
  // ============================================
  if (!hasStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#000] relative">
        {/* Pixel Art Background */}
        <PixelBackground />
        
        {/* Dark overlay for better contrast */}
        <div className="fixed inset-0 bg-black/40 pointer-events-none z-[1]" />
        
        <header className="px-6 py-5 flex items-center justify-between border-b border-[#111]/50 bg-black/60 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold text-sm">
              x1
            </div>
            <span className="text-zinc-600 text-sm font-medium">.new</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
          <div className="w-full max-w-xl">
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3 tracking-tight animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                What are you building?
              </h1>
              <p className="text-base text-zinc-500 max-w-md mx-auto leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                Describe your app. We'll help you think through the hard decisions before you write any code.
              </p>
            </div>

            <form onSubmit={handleStart} className="animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
              <div 
                className={`relative rounded-2xl transition-all duration-300 bg-black/80 backdrop-blur-2xl border ${
                  isFocused ? 'border-[#444] shadow-2xl shadow-white/10' : 'border-[#222]'
                }`}
              >
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={hasStarted ? 'I want to build...' : animatedPlaceholder}
                  rows={4}
                  className="w-full px-5 py-4 bg-transparent text-white placeholder-zinc-600 focus:outline-none resize-none text-base leading-relaxed transition-all duration-200"
                  autoFocus
                />
                
                <div className="px-5 pb-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">
                    {idea.length > 0 && <span className="text-zinc-400">{idea.length}</span>}
                  </span>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
                      isValid ? 'bg-white text-black hover:bg-[#E5E5E5] hover:scale-105 active:scale-95' : 'bg-zinc-800/50 text-zinc-600'
                    }`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>

        <footer className="px-6 py-4 text-center">
          <p className="text-xs text-zinc-600 font-medium tracking-wide">A thinking tool for builders.</p>
        </footer>
      </div>
    );
  }

  // ============================================
  // CHAT STATE
  // ============================================
  return (
    <div className="flex flex-col h-screen bg-[#000] text-white font-sans relative">
      {/* Pixel Art Background */}
      <PixelBackground />
      
      {/* Dark overlay for better contrast */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none z-[1]" />
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#111]/50 bg-black/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold text-sm">
            x1
          </div>
          <span className="text-sm font-medium text-zinc-600">.new</span>
        </div>
        
        {/* Progress Bar - Duolingo Style */}
        <div className="flex-1 max-w-md mx-6">
          <div className="h-3 bg-[#1A1A1A] rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[#58CC02] rounded-full transition-all duration-500 ease-out relative"
              style={{ width: isComplete ? '100%' : `${Math.max(progressPercent, 5)}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/20 to-transparent" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs text-[#666] hover:text-white transition-colors font-medium uppercase tracking-wide"
        >
          Skip
        </button>
      </header>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth relative z-10">
        <div className="max-w-2xl mx-auto space-y-6 pb-4">
          
          {/* Idea card - compact */}
          <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-4 animate-fade-in-up shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditingIdea ? (
                  <textarea
                    value={editableIdea}
                    onChange={(e) => setEditableIdea(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#333] resize-none text-sm leading-relaxed"
                    rows={2}
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-sm leading-relaxed">{idea}</p>
                )}
                {classification && !isEditingIdea && (
                  <span className="inline-block mt-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    {CATEGORY_LABELS[classification.primaryCategory]}
                  </span>
                )}
              </div>
              <div className="flex-shrink-0">
                {!isEditingIdea ? (
                  <button
                    onClick={() => setIsEditingIdea(true)}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingIdea(false);
                        setEditableIdea(idea);
                      }}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={editableIdea.trim().length < 10 || editableIdea.trim() === idea}
                      className="text-xs bg-white text-black px-3 py-1 rounded-md hover:bg-[#E5E5E5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Past Questions History - Collapsible */}
          {responses.length > 0 && (
            <details className="group bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl overflow-hidden shadow-2xl" open>
              <summary className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-[#0D0D0D] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Past Questions</span>
                  <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                    {responses.length}
                  </span>
                </div>
                <svg className="w-4 h-4 text-[#666] group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-3 border-t border-[#1A1A1A]">
                {responses.map((response, idx) => {
                  const question = questionFlow.find(q => q.id === response.questionId);
                  if (!question) return null;
                  
                  const isExpanded = expandedPastQuestions.has(response.questionId);
                  const isEditing = editingResponse === response.questionId;
                  const isDecision = question.type === 'decision';
                  
                  return (
                    <div key={response.questionId} className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg overflow-hidden hover:border-[#222] transition-colors">
                      {/* Question Header - Always Visible */}
                      <button
                        onClick={() => {
                          setExpandedPastQuestions(prev => {
                            const next = new Set(prev);
                            if (isExpanded) {
                              next.delete(response.questionId);
                            } else {
                              next.add(response.questionId);
                            }
                            return next;
                          });
                        }}
                        className="w-full text-left px-3 py-3 hover:bg-[#0D0D0D] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-[10px] font-bold text-zinc-500 mt-0.5">{idx + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#888] leading-relaxed mb-1.5">{question.prompt}</p>
                            <div className="bg-[#111] border border-[#1A1A1A] rounded-md p-2">
                              <p className="text-sm text-white leading-relaxed line-clamp-2">
                                {response.responseText}
                              </p>
                            </div>
                          </div>
                          <svg 
                            className={`w-4 h-4 text-[#666] transition-transform flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-4 border-t border-[#1A1A1A] pt-3 animate-fade-in">
                          {isEditing ? (
                            // EDITING MODE - Show response editor
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Edit Your Response</p>
                                {isDecision ? (
                                  // For decision questions, show option selector
                                  <div className="space-y-2">
                                    {(question as DecisionQuestion).options.map((option) => (
                                      <button
                                        key={option.id}
                                        onClick={() => setEditedResponseText(option.title)}
                                        className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                                          editedResponseText === option.title
                                            ? 'bg-white/10 border-white/20'
                                            : 'bg-[#111] border-[#1A1A1A] hover:border-[#222]'
                                        }`}
                                      >
                                        <p className="text-sm text-white">{option.title}</p>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  // For thinking questions, show textarea
                                  <textarea
                                    value={editedResponseText}
                                    onChange={(e) => setEditedResponseText(e.target.value)}
                                    className="w-full bg-[#111] border border-[#222] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#333] resize-none text-sm leading-relaxed min-h-[80px]"
                                    autoFocus
                                  />
                                )}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingResponse(null);
                                      setEditedResponseText('');
                                    }}
                                    className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleEditResponse(response.questionId, editedResponseText)}
                                    disabled={!editedResponseText.trim()}
                                    className="text-xs bg-white text-black px-3 py-1.5 rounded-md hover:bg-[#E5E5E5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // VIEW MODE - Show full question as originally presented
                            <>
                              {isDecision ? (
                                // Decision Question - Show full UI
                                <DecisionQuestionUI q={question as DecisionQuestion} />
                              ) : (
                                // Thinking Question - Show full details
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white">{question.prompt}</h3>
                                    {question.subtext && (
                                      <p className="text-sm text-[#666] leading-relaxed whitespace-pre-line">
                                        {question.subtext}
                                      </p>
                                    )}
                                  </div>

                                  {/* Show suggestions if available */}
                                  {(question as ThinkingQuestion).suggestions && (question as ThinkingQuestion).suggestions!.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                                        Suggestions
                                      </p>
                                      <div className="space-y-2">
                                        {(question as ThinkingQuestion).suggestions!.map((s, i) => (
                                          <div
                                            key={i}
                                            className="p-2.5 rounded-lg bg-[#111] border border-[#1A1A1A]"
                                          >
                                            <p className="text-sm text-[#999] leading-relaxed">
                                              {s}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Your Response - Always shown */}
                              <div className="space-y-2 pt-3 border-t border-[#1A1A1A]">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Your Response</p>
                                <div className="bg-[#111] border border-[#1A1A1A] rounded-lg p-3">
                                  <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                                    {response.responseText}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingResponse(response.questionId);
                                    setEditedResponseText(response.responseText);
                                  }}
                                  className="flex-1 text-xs py-2 rounded-lg border border-[#222] text-[#888] hover:text-white hover:border-[#333] transition-all font-medium"
                                >
                                  ✏️ Edit Response
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRegenerateFromQuestion(idx + 1);
                                  }}
                                  className="flex-1 text-xs py-2 rounded-lg border border-[#222] text-[#888] hover:text-white hover:border-[#333] transition-all font-medium"
                                >
                                  🔄 Regenerate from here
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {/* Progress counter */}
          {!isComplete && questionFlow.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
                {answeredQuestions + 1} of {totalQuestions}
              </span>
              <span className="text-[10px] font-medium text-zinc-600">
                {questionsRemaining} left
              </span>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${msg.role === 'user' ? 'flex justify-end' : ''} animate-fade-in-up`}
            >
              {msg.role === 'user' ? (
                <div className="bg-black/70 backdrop-blur-xl text-white rounded-xl rounded-br-sm px-4 py-3 border border-[#222] max-w-[85%] text-sm leading-relaxed shadow-xl">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 h-6 animate-fade-in">
              <div className="w-1 h-1 bg-[#333] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-[#333] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-[#333] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Active Decision Question - Rendered live for interactivity */}
          {activeDecisionQuestion && !isTyping && (
            <div className="animate-fade-in-up">
              <DecisionQuestionUI q={activeDecisionQuestion} />
            </div>
          )}
          
          <div className="h-32" />
        </div>
      </div>

      {/* Input area - only for thinking questions */}
      <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 relative z-10 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleTextSubmit}
            className={`relative transition-all duration-200 ${isInputDisabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              placeholder={isDecisionQuestion ? "Pick an option above" : "Type your answer..."}
              disabled={isInputDisabled}
              rows={1}
              className="w-full bg-black/70 backdrop-blur-xl border border-zinc-700 text-white placeholder-zinc-400 rounded-xl pl-4 pr-20 py-4 focus:outline-none focus:border-zinc-500 focus:shadow-2xl focus:shadow-white/5 resize-none text-sm min-h-[52px]"
            />
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isInputDisabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-black rounded-lg disabled:bg-zinc-600 disabled:text-zinc-300 transition-all hover:bg-zinc-200 text-xs font-medium"
            >
              Send →
            </button>
          </form>
        </div>
      </div>

      {/* Skip Warning Modal */}
      {showSkipWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md bg-black/90 backdrop-blur-2xl border border-[#333] rounded-2xl p-6 shadow-2xl transform scale-100 animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-2">
              Are you sure?
            </h3>
            <p className="text-[#888] text-sm leading-relaxed mb-6">
              Vague ideas = no real app. Not spending a few minutes now will save you hours if not days on changing your product later.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSkipWarning(false)}
                className="flex-1 py-3 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-[#222] transition-colors"
              >
                Go back
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:bg-[#E5E5E5] transition-colors"
              >
                Skip anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
