'use client';

/**
 * SimplePixelBackground - A lightweight alternative to the animated pixel background
 * Use this if you prefer better performance or a more subtle effect
 */

export default function SimplePixelBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Pixel grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          imageRendering: 'pixelated',
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* Static pixel art cityscape silhouette */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              rgba(31, 41, 55, 0.4) 0px,
              rgba(31, 41, 55, 0.4) 32px,
              transparent 32px,
              transparent 40px,
              rgba(55, 65, 81, 0.3) 40px,
              rgba(55, 65, 81, 0.3) 72px,
              transparent 72px,
              transparent 80px,
              rgba(31, 41, 55, 0.5) 80px,
              rgba(31, 41, 55, 0.5) 120px,
              transparent 120px,
              transparent 128px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(31, 41, 55, 0.6) 0px,
              rgba(31, 41, 55, 0.6) 100%
            )
          `,
          backgroundSize: '128px 100%',
          imageRendering: 'pixelated',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
        }}
      >
        {/* Window lights */}
        <div className="absolute inset-0 animate-pulse" style={{ animationDuration: '3s' }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `${20 + Math.random() * 60}%`,
                backgroundColor: Math.random() > 0.5 ? '#fbbf24' : '#60a5fa',
                opacity: 0.3 + Math.random() * 0.4,
                boxShadow: '0 0 4px currentColor',
              }}
            />
          ))}
        </div>
      </div>

      {/* Animated stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              opacity: 0.2 + Math.random() * 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

