'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AppCategory, 
  MonetizationModel,
  OnboardingData,
  CATEGORY_LABELS,
} from '../../types';
import { 
  APP_TYPE_OPTIONS, 
  MONETIZATION_OPTIONS,
  generateNameSuggestions,
  THUMBNAIL_STYLES,
} from '../../lib/questions';
import PixelBackground from '../../components/PixelBackground';

// ============================================
// ONBOARDING STEPS
// ============================================

type OnboardingStep = 
  | 'app-type'
  | 'monetization' 
  | 'naming'
  | 'thumbnail'
  | 'complete';

const STEPS: OnboardingStep[] = ['app-type', 'monetization', 'naming', 'thumbnail', 'complete'];

const STEP_TITLES: Record<OnboardingStep, string> = {
  'app-type': 'What type of app are you building?',
  'monetization': 'How will your app make money?',
  'naming': "Great! Let's find a name for it",
  'thumbnail': "We've generated thumbnails for you!",
  'complete': 'You\'re all set!',
};

const STEP_SUBTITLES: Record<OnboardingStep, string> = {
  'app-type': 'Select the type that fits your app.',
  'monetization': 'You can always change the model later.',
  'naming': 'Share a quick brief so the builder agent can tailor your Product Requirements Document.',
  'thumbnail': 'Based on all you\'ve said about your app, we generated some thumbnails for you.',
  'complete': 'Your app is ready to build.',
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  
  // Onboarding state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('app-type');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    idea: '',
    appType: null,
    monetization: null,
    appName: '',
    nameSuggestions: [],
    thumbnail: {
      style: 'generated',
      selectedIndex: 0,
      accentColor: '#F43F5E',
      bgColor: '#FFBE5D',
      iconColor: '#8B5CF6',
      description: '',
    },
  });

  // App type carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Initialize from session
  useEffect(() => {
    const storedIdea = sessionStorage.getItem('app-idea');
    if (!storedIdea) {
      router.push('/');
      return;
    }
    setData(prev => ({ 
      ...prev, 
      idea: storedIdea,
      nameSuggestions: generateNameSuggestions(storedIdea, null),
    }));
  }, [router]);

  // Update scroll buttons
  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [currentStep]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  // Navigation
  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex) / (STEPS.length - 1)) * 100;

  const canContinue = () => {
    switch (currentStep) {
      case 'app-type': return data.appType !== null;
      case 'monetization': return data.monetization !== null;
      case 'naming': return data.appName.trim().length > 0;
      case 'thumbnail': return true;
      case 'complete': return true;
    }
  };

  const goNext = () => {
    if (!canContinue()) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex]);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const goBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        setCurrentStep(STEPS[prevIndex]);
      } else {
        router.push('/');
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleComplete = () => {
    // Store onboarding data and navigate to validator
    sessionStorage.setItem('onboarding-data', JSON.stringify(data));
    router.push('/validator');
  };

  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 'app-type':
        return <AppTypeStep data={data} setData={setData} carouselRef={carouselRef} onScroll={updateScrollButtons} />;
      case 'monetization':
        return <MonetizationStep data={data} setData={setData} />;
      case 'naming':
        return <NamingStep data={data} setData={setData} />;
      case 'thumbnail':
        return <ThumbnailStep data={data} setData={setData} />;
      case 'complete':
        return <CompleteStep data={data} onComplete={handleComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Pixel Art Background */}
      <PixelBackground />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-[1]" />
      
      {/* Header */}
      <header className="relative flex-shrink-0 h-16 flex items-center justify-between px-6 bg-black/60 backdrop-blur-xl z-50 border-b border-zinc-800/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">x1</span>
          </div>
          <span className="text-zinc-500 text-sm font-medium">.new</span>
        </div>
        
        {/* Progress Segments */}
        <div className="flex items-center gap-2">
          {STEPS.slice(0, -1).map((step, idx) => (
            <div
              key={step}
              className={`h-1 w-12 rounded-full transition-all duration-500 ${
                idx < currentStepIndex 
                  ? 'bg-white' 
                  : idx === currentStepIndex 
                    ? 'bg-white' 
                    : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
        
        <div className="w-20" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col z-10 overflow-hidden">
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Title Section */}
          <div className="text-center pt-12 pb-8 px-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3 tracking-tight">
              {STEP_TITLES[currentStep]}
            </h1>
            <p className="text-base text-zinc-400 max-w-lg mx-auto">
              {STEP_SUBTITLES[currentStep]}
            </p>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-hidden">
            {renderStepContent()}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      {currentStep !== 'complete' && (
        <footer className="relative flex-shrink-0 px-6 py-5 bg-black/60 backdrop-blur-xl z-50 border-t border-zinc-800/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all font-medium"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            {/* Carousel Navigation (only for app-type) */}
            {currentStep === 'app-type' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            )}

            <button
              onClick={goNext}
              disabled={!canContinue()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <span>→</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

// ============================================
// STEP 1: APP TYPE
// ============================================

interface StepProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

interface AppTypeStepProps extends StepProps {
  carouselRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

function AppTypeStep({ data, setData, carouselRef, onScroll }: AppTypeStepProps) {
  return (
    <div className="h-full flex items-center">
      <div 
        ref={carouselRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {APP_TYPE_OPTIONS.map((option) => {
          const isSelected = data.appType === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => setData(prev => ({ ...prev, appType: option.id }))}
              className={`flex-shrink-0 w-[200px] text-left rounded-2xl border transition-all duration-200 overflow-hidden group ${
                isSelected 
                  ? 'border-white bg-zinc-900 shadow-lg shadow-white/10' 
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <h3 className="font-semibold text-white text-sm mb-1.5 leading-tight">
                  {option.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
              
              {/* Example Apps */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider px-2">Examples</span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.exampleApps.slice(0, 3).map((app, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-zinc-400">
                        {app.charAt(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="h-1 bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// STEP 2: MONETIZATION
// ============================================

function MonetizationStep({ data, setData }: StepProps) {
  return (
    <div className="flex items-center justify-center px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
        {MONETIZATION_OPTIONS.map((option) => {
          const isSelected = data.monetization === option.id;
          const isDisabled = option.id === 'ad-supported';
          
          return (
            <button
              key={option.id}
              onClick={() => !isDisabled && setData(prev => ({ ...prev, monetization: option.id }))}
              disabled={isDisabled}
              className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-200 ${
                isSelected 
                  ? 'border-white bg-zinc-900 shadow-lg shadow-white/10' 
                  : isDisabled
                    ? 'border-zinc-800 bg-zinc-900/30 opacity-50 cursor-not-allowed'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Background Image Placeholder */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-700/50 to-transparent" />
              </div>
              
              {/* Icon */}
              <div className="relative text-4xl mb-4">
                {option.icon}
              </div>
              
              {/* Badge */}
              {option.badge && (
                <span className={`relative mb-3 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  option.badgeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  option.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  option.badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {option.badge}
                </span>
              )}
              
              {/* Title */}
              <h3 className="relative font-semibold text-white text-base mb-2">
                {option.title}
              </h3>
              
              {/* Description */}
              <p className="relative text-xs text-zinc-500 leading-relaxed">
                {option.description}
              </p>
              
              {/* Selection ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white ring-offset-2 ring-offset-black pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// STEP 3: NAMING
// ============================================

function NamingStep({ data, setData }: StepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const regenerateSuggestions = () => {
    const newSuggestions = generateNameSuggestions(data.idea, data.appType);
    setData(prev => ({ ...prev, nameSuggestions: newSuggestions }));
  };

  return (
    <div className="flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Card Container */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold">x1</span>
            </div>
            <span className="text-zinc-500 font-medium">.new</span>
            
            {/* Mini progress */}
            <div className="flex-1 flex justify-end gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1 w-6 rounded-full ${i <= 3 ? 'bg-white' : 'bg-zinc-700'}`} />
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                App name
                <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-500">?</span>
              </label>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-all">
                <span>Suggest</span>
                <span>✨</span>
              </button>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={data.appName}
              onChange={(e) => setData(prev => ({ ...prev, appName: e.target.value }))}
              placeholder="Enter app name"
              className="w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all"
            />
          </div>

          {/* Smart Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Smart Suggestions:</span>
              <button 
                onClick={regenerateSuggestions}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <span>↻</span>
                <span>Generate more</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {data.nameSuggestions.map((name, i) => {
                const isSelected = data.appName === name;
                const isRecommended = i === 0;
                
                return (
                  <button
                    key={i}
                    onClick={() => setData(prev => ({ ...prev, appName: name }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-white text-black border-white' 
                        : 'bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <span>{name}</span>
                    {isRecommended && !isSelected && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30">
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 4: THUMBNAIL
// ============================================

function ThumbnailStep({ data, setData }: StepProps) {
  const [showUpload, setShowUpload] = useState(false);

  const thumbnailOptions = [
    { bg: '#1a1a1a', icon: '🔥', borderColor: 'white' },
    { bg: '#ef4444', icon: '⚡', borderColor: 'transparent' },
    { bg: '#8b5cf6', icon: '🌊', borderColor: 'transparent' },
  ];

  return (
    <div className="flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold">x1</span>
            </div>
            <span className="text-zinc-500 font-medium">.new</span>
          </div>

          {showUpload ? (
            /* Upload View */
            <div className="flex items-center gap-6">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl"
                style={{ 
                  background: thumbnailOptions[data.thumbnail.selectedIndex].bg,
                  border: data.thumbnail.selectedIndex === 0 ? '2px solid white' : 'none' 
                }}
              >
                {thumbnailOptions[data.thumbnail.selectedIndex].icon}
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowUpload(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-all"
                >
                  <span>↑</span>
                  <span>Change Thumbnail</span>
                </button>
                <p className="text-xs text-zinc-500">PNG, JPG, or SVG · Up to 5 MB</p>
              </div>
            </div>
          ) : (
            /* Selection View */
            <div className="flex items-center justify-center gap-4">
              {thumbnailOptions.map((thumb, i) => {
                const isSelected = data.thumbnail.selectedIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setData(prev => ({
                        ...prev,
                        thumbnail: { ...prev.thumbnail, selectedIndex: i }
                      }));
                      setShowUpload(true);
                    }}
                    className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl transition-all ${
                      isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-105' : 'hover:scale-105'
                    }`}
                    style={{ background: thumb.bg }}
                  >
                    {thumb.icon}
                  </button>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Custom Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Describe your thumbnail</label>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-all">
                <span>Suggest</span>
                <span>✨</span>
              </button>
            </div>
            
            <input
              type="text"
              value={data.thumbnail.description}
              onChange={(e) => setData(prev => ({
                ...prev,
                thumbnail: { ...prev.thumbnail, description: e.target.value }
              }))}
              placeholder="e.g. Minimal Dark icon with a bold X and soft violet glow"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
            />
          </div>

          {/* Color Pickers */}
          <div className="flex items-center justify-center gap-3">
            {[
              { label: 'Accent', color: data.thumbnail.accentColor, key: 'accentColor' },
              { label: 'BG Color', color: data.thumbnail.bgColor, key: 'bgColor' },
              { label: 'Icon Color', color: data.thumbnail.iconColor, key: 'iconColor' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
                <span className="text-xs text-zinc-400">{item.label}</span>
                <div 
                  className="w-5 h-5 rounded-md border border-zinc-600"
                  style={{ background: item.color }}
                />
                <span className="text-xs text-zinc-500 font-mono">{item.color}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-medium transition-all border border-zinc-700">
              Upload Thumbnail
            </button>
            <button className="px-4 py-3 bg-white hover:bg-zinc-200 rounded-xl text-black font-medium transition-all flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Generate Thumbnail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 5: COMPLETE
// ============================================

interface CompleteStepProps {
  data: OnboardingData;
  onComplete: () => void;
}

function CompleteStep({ data, onComplete }: CompleteStepProps) {
  return (
    <div className="flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-xl text-center space-y-8">
        {/* Success Animation */}
        <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 animate-pulse">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">
            {data.appName || 'Your app'} is ready!
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            We've captured your vision. Now let's validate the strategy and make sure you're building something people actually want.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">App Type</span>
              <span className="text-white font-medium">{data.appType ? CATEGORY_LABELS[data.appType] : '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">Monetization</span>
              <span className="text-white font-medium capitalize">{data.monetization || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">App Name</span>
              <span className="text-white font-medium">{data.appName || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-zinc-500">Original Idea</span>
              <span className="text-white font-medium text-right max-w-[200px] truncate">{data.idea}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onComplete}
          className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all text-lg"
        >
          <span>Looks Good</span>
          <span>✨</span>
        </button>
      </div>
    </div>
  );
}
