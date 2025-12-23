'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { classifyIdea } from '../../lib/classifier';
import { 
  buildQuestionFlow, 
  getPillarLabel 
} from '../../lib/questions';
import { 
  ClassificationResult, 
  Question, 
  ThinkingQuestion, 
  DecisionQuestion,
  DecisionOption,
  UserResponse,
  CATEGORY_LABELS 
} from '../../types';

const MAX_QUESTIONS = 8;

// ============================================
// MAIN ONBOARDING PAGE
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  
  // Core state
  const [idea, setIdea] = useState('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [questionFlow, setQuestionFlow] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // UI state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    const storedIdea = sessionStorage.getItem('app-idea');
    if (!storedIdea) {
      router.push('/');
      return;
    }
    
    setIdea(storedIdea);
    const result = classifyIdea(storedIdea);
    setClassification(result);
    
    const flow = buildQuestionFlow(result, MAX_QUESTIONS);
    setQuestionFlow(flow);
  }, [router]);

  const currentQuestion = questionFlow[currentIndex];
  const progress = questionFlow.length > 0 
    ? Math.round(((currentIndex + 1) / questionFlow.length) * 100) 
    : 0;

  const handleThinkingResponse = useCallback((text: string) => {
    if (!currentQuestion || currentQuestion.type !== 'thinking') return;
    if (!text.trim()) return;
    
    setIsTransitioning(true);
    
    const response: UserResponse = {
      questionId: currentQuestion.id,
      questionType: 'thinking',
      response: text.trim(),
      responseText: text.trim(),
      timestamp: Date.now(),
    };
    
    setResponses(prev => [...prev, response]);
    setInputValue('');
    
    setTimeout(() => {
      if (currentIndex < questionFlow.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
      setIsTransitioning(false);
    }, 400);
  }, [currentQuestion, currentIndex, questionFlow.length]);

  const handleDecisionResponse = useCallback((optionId: string) => {
    if (!currentQuestion || currentQuestion.type !== 'decision') return;
    
    const option = currentQuestion.options.find(o => o.id === optionId);
    if (!option) return;
    
    setSelectedOption(optionId);
    setIsTransitioning(true);
    
    const response: UserResponse = {
      questionId: currentQuestion.id,
      questionType: 'decision',
      response: optionId,
      responseText: option.title,
      timestamp: Date.now(),
    };
    
    setResponses(prev => [...prev, response]);
    
    setTimeout(() => {
      if (currentIndex < questionFlow.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsComplete(true);
      }
      setIsTransitioning(false);
    }, 600);
  }, [currentQuestion, currentIndex, questionFlow.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleThinkingResponse(inputValue);
    }
  };

  if (!classification || questionFlow.length === 0) {
    return <LoadingScreen />;
  }

  if (isComplete) {
    return (
      <SummaryScreen 
        idea={idea}
        classification={classification}
        responses={responses}
        questionFlow={questionFlow}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative flex-shrink-0 h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')} 
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> 
            <span>Back</span>
          </button>
          <div className="h-5 w-px bg-zinc-800" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            {CATEGORY_LABELS[classification.primaryCategory]}
          </span>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-500">
            <span className="font-mono text-zinc-300">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span className="font-mono">{questionFlow.length}</span>
          </div>
          <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div 
          className={`w-full max-w-3xl transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {currentQuestion?.type === 'thinking' ? (
            <ThinkingQuestionUI 
              question={currentQuestion}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSubmit={handleThinkingResponse}
              onKeyDown={handleKeyDown}
            />
          ) : currentQuestion?.type === 'decision' ? (
            <DecisionQuestionUI 
              question={currentQuestion}
              selectedOption={selectedOption}
              onSelect={handleDecisionResponse}
            />
          ) : null}
        </div>
      </main>

      {/* Footer with context */}
      <footer className="relative flex-shrink-0 border-t border-zinc-800/50 bg-zinc-950/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-zinc-600">
              Building: <span className="text-zinc-400 font-medium">{idea.slice(0, 60)}{idea.length > 60 ? '...' : ''}</span>
            </div>
            {currentQuestion && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentQuestion.type === 'thinking' ? 'bg-cyan-500' : 'bg-violet-500'
                }`} />
                <span className="text-zinc-500">
                  {getPillarLabel(currentQuestion.pillar)}
                </span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// THINKING QUESTION UI
// ============================================

interface ThinkingQuestionUIProps {
  question: ThinkingQuestion;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function ThinkingQuestionUI({ 
  question, 
  inputValue, 
  setInputValue, 
  onSubmit,
  onKeyDown 
}: ThinkingQuestionUIProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, [question.id]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Question Type Label */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Thinking Question
          </span>
        </div>
        <span className="text-xs text-zinc-600 uppercase tracking-wider">
          {getPillarLabel(question.pillar)}
        </span>
      </div>
      
      {/* Question Prompt */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white leading-snug">
          {question.prompt}
        </h1>
        {question.subtext && (
          <p className="text-base text-zinc-400 leading-relaxed">
            {question.subtext}
          </p>
                  )}
                </div>
                
      {/* Suggestions */}
      {question.suggestions && question.suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">
            Some possibilities to consider:
          </p>
          <div className="flex flex-wrap gap-2">
            {question.suggestions.map((suggestion, i) => (
                      <button 
                key={i}
                onClick={() => setInputValue(suggestion)}
                className="px-4 py-2.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-full text-sm 
                         hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all duration-200"
              >
                {suggestion}
                      </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="space-y-4">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Share your thinking..."
          rows={3}
          className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 
                   focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 resize-none transition-all"
        />
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            Press Enter to continue or write as much as you want
          </p>
                      <button 
            onClick={() => onSubmit(inputValue)}
            disabled={!inputValue.trim()}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-sm rounded-lg 
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Continue →
                      </button>
                    </div>
                  </div>
    </div>
  );
}

// ============================================
// DECISION QUESTION UI
// ============================================

interface DecisionQuestionUIProps {
  question: DecisionQuestion;
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
}

function DecisionQuestionUI({ 
  question, 
  selectedOption, 
  onSelect 
}: DecisionQuestionUIProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Question Type Label */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
            Decision Required
          </span>
        </div>
        <span className="text-xs text-zinc-600 uppercase tracking-wider">
          {getPillarLabel(question.pillar)}
        </span>
      </div>
      
      {/* Question Prompt */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white leading-snug">
          {question.prompt}
        </h1>
        {question.subtext && (
          <p className="text-base text-zinc-400 leading-relaxed">
            {question.subtext}
          </p>
        )}
      </div>
      
      {/* Options */}
      <div className="space-y-4">
        {question.options.map((option) => (
          <DecisionOptionCard
            key={option.id}
            option={option}
            isSelected={selectedOption === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
      
      <p className="text-xs text-zinc-600 text-center">
        Click an option to continue. This affects your plan.
      </p>
    </div>
  );
}

// ============================================
// DECISION OPTION CARD
// ============================================

interface DecisionOptionCardProps {
  option: DecisionOption;
  isSelected: boolean;
  onSelect: () => void;
}

function DecisionOptionCard({ option, isSelected, onSelect }: DecisionOptionCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left p-5 rounded-xl border transition-all duration-200 ${
        isSelected 
          ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10' 
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/80'
      }`}
    >
      {/* Recommended badge */}
      {option.recommended && (
        <span className="absolute -top-2 right-4 px-2 py-0.5 bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-full">
          Recommended
        </span>
      )}
      
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            {option.title}
          </h3>
          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            isSelected 
              ? 'border-violet-500 bg-violet-500' 
              : 'border-zinc-600'
          }`}>
            {isSelected && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed">
          {option.description}
        </p>
        
        {/* Why choose this */}
        <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-1">Why people choose this</p>
          <p className="text-sm text-zinc-300">{option.whyChooseThis}</p>
        </div>
        
        {/* Meta info */}
        <div className="flex flex-wrap gap-2">
          {option.cost && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs font-medium text-amber-400">
              <span>$</span>
              {option.cost}
            </span>
          )}
          {option.timeline && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs font-medium text-emerald-400">
              <span>⏱</span>
              {option.timeline}
            </span>
          )}
        </div>
        
        {/* Downside */}
        <div className="pt-3 border-t border-zinc-800/50">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-semibold text-rose-400 uppercase">
              Risk
            </span>
            <p className="text-xs text-zinc-500 leading-relaxed flex-1">
              {option.downside}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================
// SUMMARY SCREEN
// ============================================

interface SummaryScreenProps {
  idea: string;
  classification: ClassificationResult;
  responses: UserResponse[];
  questionFlow: Question[];
}

function SummaryScreen({ idea, classification, responses, questionFlow }: SummaryScreenProps) {
  const router = useRouter();
  
  // Separate thinking and decision responses
  const thinkingResponses = responses.filter(r => r.questionType === 'thinking');
  const decisionResponses = responses.filter(r => r.questionType === 'decision');
  
  // Get decision details
  const decisions = decisionResponses.map(r => {
    const question = questionFlow.find(q => q.id === r.questionId) as DecisionQuestion | undefined;
    const option = question?.options.find(o => o.id === r.response);
    return {
      prompt: question?.prompt || '',
      chosen: option?.title || r.responseText,
      cost: option?.cost,
      timeline: option?.timeline,
      implication: option?.downside || '',
    };
  });
  
  // Calculate implied cost range
  const hasHighCost = decisions.some(d => 
    d.cost?.includes('$800') || d.cost?.includes('$1,000') || d.cost?.includes('$1,500')
  );
  const costRange = hasHighCost ? '$500–2,000/mo' : '$50–500/mo';
  
  // Calculate timeline
  const hasLongTimeline = decisions.some(d =>
    d.timeline?.includes('months') || d.timeline?.includes('2-4')
  );
  const timelineEstimate = hasLongTimeline ? '2-4 months' : '2-6 weeks';

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative h-16 border-b border-zinc-800/50 flex items-center px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="font-semibold text-white">Session Complete</span>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-10 animate-fade-in-up">
          
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-semibold text-white tracking-tight">
              Here's what you decided
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Based on your responses, here's a summary of your thinking and the tradeoffs you've chosen.
            </p>
          </div>
          
          {/* What you're building */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">What You're Building</h2>
            </div>
            <div className="p-5">
              <p className="text-lg text-white leading-relaxed">{idea}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300">
                  {CATEGORY_LABELS[classification.primaryCategory]}
                </span>
                {classification.isHybrid && classification.secondaryCategory && (
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-500">
                    + {CATEGORY_LABELS[classification.secondaryCategory]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Positioning Insights */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your Positioning</h2>
              </div>
              <div className="p-5 space-y-4">
                {thinkingResponses.length > 0 ? (
                  thinkingResponses.map((r, i) => {
                    const q = questionFlow.find(q => q.id === r.questionId) as ThinkingQuestion | undefined;
                    return (
                      <div key={i} className="pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                        <p className="text-xs text-zinc-600 mb-2">
                          {q ? getPillarLabel(q.pillar) : 'Insight'}
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          "{r.responseText}"
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500">No positioning insights captured.</p>
                )}
              </div>
                </div>

            {/* Key Decisions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Decisions Made</h2>
                      </div>
              <div className="p-5 space-y-4">
                {decisions.length > 0 ? (
                  decisions.map((d, i) => (
                    <div key={i} className="pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                      <p className="text-xs text-zinc-600 mb-2">
                        {d.prompt.slice(0, 50)}{d.prompt.length > 50 ? '...' : ''}
                      </p>
                      <p className="text-sm font-medium text-white mb-2">
                        → {d.chosen}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {d.cost && (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                            {d.cost}
                          </span>
                        )}
                        {d.timeline && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400">
                            {d.timeline}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No decisions captured.</p>
                )}
                        </div>
                    </div>
                  </div>

          {/* Implications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">What This Implies</h2>
            </div>
            <div className="p-5">
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-amber-400">
                    {costRange}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">
                    Est. Monthly Cost
                    </div>
                    </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {timelineEstimate}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">
                    Time to MVP
                  </div>
                </div>
                <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                  <div className="text-2xl font-mono font-bold text-violet-400">
                    {decisions.length}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">
                    Key Tradeoffs
                  </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Risks to watch */}
          {decisions.filter(d => d.implication).length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Risks to Watch</h2>
              </div>
              <div className="p-5 space-y-3">
                {decisions.filter(d => d.implication).map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-300">{d.chosen}</p>
                      <p className="text-xs text-zinc-500 mt-1">{d.implication}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center space-y-6 pt-6">
            <p className="text-base text-zinc-400">
              You now have clarity on what you're building and the tradeoffs you're accepting.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-zinc-700 text-zinc-300 hover:bg-zinc-900 rounded-xl transition-all"
              >
                Start Over
              </button>
              <button
                onClick={() => alert('This would open the IDE with your project context!')}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-violet-500/20"
              >
                Start Building →
                  </button>
              </div>
          </div>
              </div>
        </main>
    </div>
  );
}

// ============================================
// LOADING SCREEN
// ============================================

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-zinc-300 font-medium">Preparing your session</p>
          <p className="text-zinc-500 text-sm">Analyzing your idea...</p>
        </div>
      </div>
    </div>
  );
}
