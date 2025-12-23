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
  CATEGORY_LABELS,
} from '../../types';
import PixelBackground from '../../components/PixelBackground';

const MAX_QUESTIONS = 8;

// ============================================
// MAIN VALIDATOR PAGE
// ============================================

export default function ValidatorPage() {
  const router = useRouter();
  
  // Core state
  const [idea, setIdea] = useState<string>('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [questionFlow, setQuestionFlow] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // UI state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Initialize session - only requires app-idea
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

  // Total onboarding steps = validator questions + onboarding steps (app type, monetization, naming, thumbnail)
  const ONBOARDING_STEPS = 4;
  const totalSteps = questionFlow.length + ONBOARDING_STEPS;
  const currentGlobalStep = currentIndex + 1; // Current position in validator

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

  if (!classification || !idea || questionFlow.length === 0) {
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
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Pixel Art Background */}
      <PixelBackground />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-[1]" />
      
      {/* Header */}
      <header className="relative flex-shrink-0 h-16 border-b border-[#222] flex items-center justify-between px-6 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')} 
            className="text-[#666] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> 
            <span>Back</span>
          </button>
          <div className="h-5 w-px bg-[#222]" />
          <span className="text-xs text-[#666] uppercase tracking-wider font-medium">
            {CATEGORY_LABELS[classification.primaryCategory]}
          </span>
        </div>
        
        {/* Progress - Total onboarding steps (validator + setup) */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-12 rounded-full transition-all duration-500 ${
                idx < currentGlobalStep 
                  ? 'bg-white' 
                  : idx === currentGlobalStep - 1
                    ? 'bg-white' 
                    : 'bg-[#333]'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col z-10 overflow-y-auto">
        <div 
          className={`flex-1 transition-all duration-300 ${
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

      {/* Footer */}
      <footer className="relative flex-shrink-0 border-t border-[#222] bg-black/60 backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-[#444]">
              Validating: <span className="text-[#888] font-medium">{idea.slice(0, 50)}{idea.length > 50 ? '...' : ''}</span>
            </div>
            {currentQuestion && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentQuestion.type === 'thinking' ? 'bg-cyan-500' : 'bg-[#FFBE5D]'
                }`} />
                <span className="text-[#666]">
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
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-fade-in-up">
      {/* Question Type Label */}
      <div className="flex items-center gap-3">
        <span className="inline-block text-[10px] font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/30">
          Thinking Question
        </span>
        <span className="text-xs text-[#444] uppercase tracking-wider">
          {getPillarLabel(question.pillar)}
        </span>
      </div>
      
      {/* Question Prompt */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
          {question.prompt}
        </h1>
        {question.subtext && (
          <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-5 shadow-2xl">
            <p className="text-[#AAA] leading-relaxed whitespace-pre-line">
              {question.subtext}
            </p>
          </div>
        )}
      </div>
                
      {/* Suggestions */}
      {question.suggestions && question.suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-[#666] uppercase tracking-wider font-semibold">
            Pick one or write your own
          </p>
          <div className="space-y-2">
            {question.suggestions.map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setInputValue(suggestion)}
                className="w-full text-left p-4 rounded-xl bg-black/60 backdrop-blur-xl border border-[#222] 
                         hover:border-[#444] hover:bg-black/70 transition-all duration-150 group shadow-lg"
              >
                <p className="text-sm text-[#999] group-hover:text-[#CCC] leading-relaxed transition-colors">
                  {suggestion}
                </p>
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
          rows={4}
          className="w-full px-5 py-4 bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl text-white placeholder-[#444] 
                   focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 resize-none transition-all shadow-2xl"
        />
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#444]">
            Press Enter to continue or write as much as you want
          </p>
          <button 
            onClick={() => onSubmit(inputValue)}
            disabled={!inputValue.trim()}
            className="px-6 py-2.5 bg-white hover:bg-[#E5E5E5] text-black font-semibold text-sm rounded-lg 
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
// DECISION QUESTION UI - Visual Design
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
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());

  const toggleExpanded = (optionId: string) => {
    setExpandedOptions(prev => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-fade-in-up">
      
      {/* SECTION 1: Header Badge */}
      <div className="flex items-center gap-3">
        <span className="inline-block text-[10px] font-semibold text-[#FFBE5D] uppercase tracking-wider bg-[#FFBE5D]/10 px-3 py-1.5 rounded-full border border-[#FFBE5D]/30">
          {getPillarLabel(question.pillar)}
        </span>
      </div>
      
      {/* SECTION 2: Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
        {question.prompt}
      </h1>

      {/* SECTION 3: The Question Box */}
      <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-6 shadow-2xl">
        <p className="text-[10px] text-[#FFBE5D] uppercase tracking-wider font-bold mb-3">Question</p>
        <p className="text-white text-lg font-medium leading-relaxed mb-4">
          {question.subtext?.split('\n')[0] || question.prompt}
        </p>
        {question.subtext && question.subtext.split('\n').length > 1 && (
          <div className="text-sm text-[#777] leading-relaxed space-y-2">
            {question.subtext.split('\n').slice(1).map((line, i) => (
              <p key={i} className={line.includes('hardest') || line.includes('reverse') ? 'text-[#FFBE5D]/80' : ''}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: Mental Model - Visual Cards */}
      {question.mentalModel && (
        <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-6 shadow-2xl">
          <h3 className="text-white text-sm font-semibold mb-5">
            {question.mentalModel.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Renting a house */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-all">
              <div className="text-4xl mb-3">🏠</div>
              <h4 className="text-white font-semibold text-base mb-3">Using a managed service is like renting a house</h4>
              <ul className="space-y-2 text-sm text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFBE5D]">•</span>
                  <span>You pay monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFBE5D]">•</span>
                  <span>Most things "just work"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFBE5D]">•</span>
                  <span>When plumbing breaks, it's not your job to fix the pipes</span>
                </li>
              </ul>
            </div>
            {/* Card 2: Building your own house */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-all">
              <div className="text-4xl mb-3">🔨</div>
              <h4 className="text-white font-semibold text-base mb-3">Running it yourself is like building your own house</h4>
              <ul className="space-y-2 text-sm text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-[#666]">•</span>
                  <span>You might save money long-term</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#666]">•</span>
                  <span>But you're responsible for wiring, plumbing, inspections, and repairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#666]">•</span>
                  <span>If something breaks at 2am, it's your problem</span>
                </li>
              </ul>
            </div>
          </div>
          <p className="text-center text-[#666] text-sm mt-5">
            Neither option is "better." They optimize for different kinds of pain: <span className="text-white font-medium">money vs responsibility</span>.
          </p>
        </div>
      )}

      {/* SECTION 5: Option Cards - Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {question.options.map((option, idx) => {
          const isManaged = idx === 0;
          const isExpanded = expandedOptions.has(option.id);
          const icon = isManaged ? '🏠' : '🔨';
          
          return (
            <div
              key={option.id}
              className={`rounded-xl border bg-black/70 backdrop-blur-xl transition-all duration-300 overflow-hidden shadow-2xl ${
                selectedOption === option.id 
                  ? 'border-[#FFBE5D] ring-1 ring-[#FFBE5D]/30' 
                  : 'border-[#222] hover:border-[#444]'
              }`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {isManaged ? 'Option A: Managed streaming' : 'Option B: Self-hosted streaming'}
                      </h3>
                      <p className="text-xs text-[#666]">{isManaged ? 'e.g. Mux, AWS IVS' : 'WebRTC / Open Source'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    option.complexity === 'Easy' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {option.complexity === 'Easy' ? '🟢 EASIER' : '🔴 HARDER'}
                  </span>
                </div>

                {/* Visual Stats with Progress Bars */}
                <div className="space-y-4 mb-5">
                  {/* Time to launch */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#666]">Time to launch</span>
                      <span className={`font-medium ${isManaged ? 'text-white' : 'text-[#888]'}`}>
                        {isManaged ? '2–4 weeks' : '2–4 months'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        isManaged ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-[20%]' : 'bg-[#444] w-[80%]'
                      }`} />
                    </div>
                  </div>

                  {/* Monthly cost */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#666]">Monthly cost (10k viewers)</span>
                      <span className={`font-medium ${isManaged ? 'text-white' : 'text-[#888]'}`}>
                        {isManaged ? '$500–$2,000+' : '$300–$1,200 + eng'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        isManaged ? 'bg-gradient-to-r from-[#FFBE5D] to-[#FF8C00] w-[60%]' : 'bg-[#444] w-[40%]'
                      }`} />
                    </div>
                  </div>

                  {/* Expertise needed */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#666]">Expertise needed</span>
                      <span className={`font-medium ${isManaged ? 'text-white' : 'text-[#888]'}`}>
                        {isManaged ? 'Basic integration' : 'Video engineer ($8–15k/mo)'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        isManaged ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-[15%]' : 'bg-[#444] w-[85%]'
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Why Users Care */}
                <div className="mb-4 p-4 rounded-xl bg-[#111] border border-[#1A1A1A]">
                  <p className="text-[10px] text-[#666] uppercase tracking-wider font-semibold mb-1.5">Why users care</p>
                  <p className="text-sm text-[#AAA] leading-relaxed">{option.whyUsersCare}</p>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleExpanded(option.id)}
                  className="w-full text-xs py-2.5 rounded-lg border border-[#222] text-[#888] hover:text-white hover:border-[#333] transition-all font-medium"
                >
                  {isExpanded ? '↑ Hide full details' : '↓ See full details'}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-[#1A1A1A] space-y-4 animate-fade-in">
                  {/* Business Impact */}
                  {option.businessImpact && (
                    <div>
                      <p className="text-[10px] text-[#666] uppercase tracking-wider font-semibold mb-1.5">Business Impact</p>
                      <p className="text-sm text-[#AAA] leading-relaxed">{option.businessImpact}</p>
                    </div>
                  )}

                  {/* Full Cost Breakdown */}
                  {option.costDetail && (
                    <div className="p-4 rounded-xl bg-[#111] border border-[#1A1A1A]">
                      <p className="text-[10px] text-[#666] uppercase tracking-wider font-semibold mb-2">Full Cost Breakdown</p>
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
                  )}

                  {/* Who Deals With Pain */}
                  {option.whoDealsWithPain && (
                    <div>
                      <p className="text-[10px] text-[#666] uppercase tracking-wider font-semibold mb-1.5">Who deals with the pain</p>
                      <p className="text-sm text-[#AAA] leading-relaxed whitespace-pre-line">{option.whoDealsWithPain}</p>
                    </div>
                  )}

                  {/* Upsides & Tradeoffs - Side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Upsides */}
                    {option.upsides && option.upsides.length > 0 && (
                      <div>
                        <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-2">Upsides</p>
                        <ul className="space-y-1.5">
                          {option.upsides.map((item, i) => (
                            <li key={i} className="text-xs text-[#AAA] flex items-start gap-2">
                              <span className="text-emerald-400 shrink-0">+</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tradeoffs */}
                    {option.tradeoffs && option.tradeoffs.length > 0 && (
                      <div>
                        <p className="text-[10px] text-[#FFBE5D] uppercase tracking-wider font-semibold mb-2">Tradeoffs</p>
                        <ul className="space-y-1.5">
                          {option.tradeoffs.map((item, i) => (
                            <li key={i} className="text-xs text-[#AAA] flex items-start gap-2">
                              <span className="text-[#666] shrink-0">−</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Select Button */}
              <button
                onClick={() => onSelect(option.id)}
                className={`w-full py-4 font-semibold text-sm transition-all border-t ${
                  isManaged 
                    ? 'bg-white hover:bg-[#E5E5E5] text-black border-[#1A1A1A]' 
                    : 'bg-[#1A1A1A] hover:bg-[#222] text-white border-[#1A1A1A]'
                }`}
              >
                {selectedOption === option.id ? '✓ Selected' : `Choose ${isManaged ? 'Managed' : 'Self-Hosted'} →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* SECTION 6: Reality Check */}
      {question.realityCheck && (
        <div className="bg-black/70 backdrop-blur-xl border border-[#FFBE5D]/30 rounded-xl p-5 shadow-2xl">
          <div className="flex gap-3 items-start">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-[10px] text-[#FFBE5D] uppercase tracking-wider font-bold mb-2">Reality Check</p>
              <p className="text-sm text-[#AAA] leading-relaxed whitespace-pre-line">
                {question.realityCheck}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: Why This Matters */}
      {question.whyMatters && (
        <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl p-5 shadow-2xl">
          <div className="flex gap-3 items-start">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-[10px] text-[#666] uppercase tracking-wider font-bold mb-2">Why This Decision Matters</p>
              <p className="text-sm text-[#AAA] leading-relaxed whitespace-pre-line">
                {question.whyMatters}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
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
  
  const thinkingResponses = responses.filter(r => r.questionType === 'thinking');
  const decisionResponses = responses.filter(r => r.questionType === 'decision');
  
  const decisions = decisionResponses.map(r => {
    const question = questionFlow.find(q => q.id === r.questionId) as DecisionQuestion | undefined;
    const option = question?.options.find(o => o.id === r.response);
    return {
      questionPrompt: question?.prompt || '',
      chosen: option?.title || r.responseText,
      complexity: option?.complexity,
      upsides: option?.upsides || [],
      tradeoffs: option?.tradeoffs || [],
    };
  });

  return (
    <div className="min-h-screen bg-black relative">
      <PixelBackground />
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-[1]" />
      
      {/* Header */}
      <header className="relative h-16 border-b border-[#222] flex items-center px-6 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFBE5D] to-[#FF6B6B] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="font-semibold text-white">Validation Complete</span>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-12 z-10">
        <div className="space-y-10 animate-fade-in-up">
          
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Here's what you decided
            </h1>
            <p className="text-lg text-[#888] max-w-2xl mx-auto leading-relaxed">
              Based on your responses, here's a summary of your thinking and the tradeoffs you've chosen.
            </p>
          </div>
          
          {/* What you're building */}
          <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3 bg-[#111] border-b border-[#1A1A1A]">
              <h2 className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">What You're Building</h2>
            </div>
            <div className="p-5">
              <p className="text-base text-[#CCC] leading-relaxed">{idea}</p>
              <div className="mt-4">
                <span className="px-3 py-1.5 bg-[#1A1A1A] rounded-full text-sm text-[#AAA] border border-[#222]">
                  {CATEGORY_LABELS[classification.primaryCategory]}
                </span>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Positioning Insights */}
            <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3 bg-[#111] border-b border-[#1A1A1A] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <h2 className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">Your Positioning</h2>
              </div>
              <div className="p-5 space-y-4">
                {thinkingResponses.length > 0 ? (
                  thinkingResponses.map((r, i) => {
                    const q = questionFlow.find(q => q.id === r.questionId) as ThinkingQuestion | undefined;
                    return (
                      <div key={i} className="pb-4 border-b border-[#1A1A1A] last:border-0 last:pb-0">
                        <p className="text-[10px] text-[#666] mb-2 uppercase tracking-wider">
                          {q?.prompt || 'Insight'}
                        </p>
                        <p className="text-sm text-[#AAA] leading-relaxed">
                          "{r.responseText}"
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-[#666]">No positioning insights captured.</p>
                )}
              </div>
            </div>

            {/* Key Decisions */}
            <div className="bg-black/70 backdrop-blur-xl border border-[#222] rounded-xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3 bg-[#111] border-b border-[#1A1A1A] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFBE5D]" />
                <h2 className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">Decisions Made</h2>
              </div>
              <div className="p-5 space-y-4">
                {decisions.length > 0 ? (
                  decisions.map((d, i) => (
                    <div key={i} className="pb-4 border-b border-[#1A1A1A] last:border-0 last:pb-0">
                      <p className="text-[10px] text-[#666] mb-2 uppercase tracking-wider">
                        {d.questionPrompt}
                      </p>
                      <p className="text-sm font-medium text-white mb-2">
                        → {d.chosen}
                      </p>
                      {d.complexity && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          d.complexity === 'Easy' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {d.complexity === 'Easy' ? '🟢 Easier' : '🔴 Harder'}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#666]">No decisions captured.</p>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6 pt-6">
            <p className="text-base text-[#888]">
              You now have clarity on what you're building and the tradeoffs you're accepting.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-[#333] text-[#AAA] hover:bg-[#111] rounded-xl transition-all"
              >
                Start Over
              </button>
              <button
                onClick={() => router.push('/onboarding')}
                className="px-8 py-3 bg-gradient-to-r from-[#FFBE5D] to-[#FF6B6B] text-black font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#FFBE5D]/20"
              >
                Continue to Setup →
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
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      <PixelBackground />
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-[1]" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#222] rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#FFBE5D] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-medium">Preparing validation</p>
          <p className="text-[#666] text-sm">Loading your strategy questions...</p>
        </div>
      </div>
    </div>
  );
}
