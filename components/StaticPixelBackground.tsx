'use client';

/**
 * Ultra high-quality STATIC pixel art background
 * No animation - pure CSS for maximum quality and performance
 * Moody landscape aesthetic with mountains and atmosphere
 */
export default function StaticPixelBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base dark sky */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 30%, #2a2a5e 60%, #3a3a7e 85%, #4a4a8e 100%)',
        }}
      />

      {/* Atmospheric glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 70%, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
        }}
      />

      {/* Pixel grid overlay for texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 5px,
              rgba(255, 255, 255, 0.03) 5px,
              rgba(255, 255, 255, 0.03) 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 5px,
              rgba(255, 255, 255, 0.03) 5px,
              rgba(255, 255, 255, 0.03) 6px
            )
          `,
          imageRendering: 'pixelated',
        }}
      />

      {/* Stars - multiple layers */}
      <div className="absolute inset-0">
        {/* Large stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`star-lg-${i}`}
            className="absolute w-2 h-2 bg-white rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              opacity: 0.4 + Math.random() * 0.4,
              boxShadow: '0 0 4px rgba(255,255,255,0.5)',
              imageRendering: 'pixelated',
            }}
          />
        ))}
        
        {/* Small stars */}
        {[...Array(60)].map((_, i) => (
          <div
            key={`star-sm-${i}`}
            className="absolute w-1 h-1 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              backgroundColor: Math.random() > 0.5 ? '#7f9fff' : '#9f7fff',
              opacity: 0.3 + Math.random() * 0.3,
              imageRendering: 'pixelated',
            }}
          />
        ))}
      </div>

      {/* Far mountains (lightest silhouette) */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '55%',
          background: `
            radial-gradient(ellipse at 20% 55%, #1a1a2e 0%, transparent 25%),
            radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, transparent 30%),
            radial-gradient(ellipse at 80% 58%, #1a1a2e 0%, transparent 28%)
          `,
          clipPath: 'polygon(0% 65%, 10% 55%, 15% 58%, 25% 48%, 35% 52%, 40% 45%, 50% 50%, 60% 42%, 70% 48%, 80% 40%, 90% 50%, 100% 45%, 100% 100%, 0% 100%)',
          imageRendering: 'pixelated',
        }}
      />

      {/* Mid mountains */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '48%',
          background: '#252542',
          clipPath: 'polygon(0% 72%, 8% 68%, 15% 62%, 22% 65%, 30% 58%, 38% 62%, 45% 55%, 52% 60%, 60% 52%, 68% 58%, 75% 50%, 82% 56%, 90% 48%, 95% 52%, 100% 48%, 100% 100%, 0% 100%)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Subtle highlight on peaks */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 15%)',
          }}
        />
      </div>

      {/* Near mountains */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '38%',
          background: '#303052',
          clipPath: 'polygon(0% 80%, 5% 75%, 12% 70%, 18% 68%, 25% 62%, 32% 66%, 40% 58%, 48% 62%, 55% 55%, 62% 60%, 70% 52%, 78% 58%, 85% 50%, 92% 55%, 98% 50%, 100% 52%, 100% 100%, 0% 100%)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Highlight on peaks */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 20%)',
          }}
        />
      </div>

      {/* Front mountains */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '28%',
          background: '#3a3a62',
          clipPath: 'polygon(0% 85%, 8% 78%, 15% 75%, 22% 70%, 30% 68%, 38% 62%, 45% 66%, 52% 58%, 60% 62%, 68% 55%, 75% 60%, 82% 52%, 90% 58%, 95% 54%, 100% 58%, 100% 100%, 0% 100%)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Strong highlight */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 25%)',
          }}
        />
      </div>

      {/* Forest silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-24">
        {/* Tree clusters */}
        {[
          { left: '5%', height: '80px' },
          { left: '15%', height: '70px' },
          { left: '22%', height: '90px' },
          { left: '35%', height: '65px' },
          { left: '45%', height: '85px' },
          { left: '58%', height: '75px' },
          { left: '68%', height: '95px' },
          { left: '78%', height: '70px' },
          { left: '88%', height: '80px' },
          { left: '95%', height: '75px' },
        ].map((tree, i) => (
          <div
            key={`tree-${i}`}
            className="absolute bottom-0"
            style={{
              left: tree.left,
              width: '40px',
              height: tree.height,
              background: '#1a2a1a',
              clipPath: 'polygon(50% 0%, 70% 20%, 60% 20%, 75% 40%, 65% 40%, 80% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 20% 60%, 35% 40%, 25% 40%, 40% 20%, 30% 20%)',
              imageRendering: 'pixelated',
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Foreground mist/atmosphere */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 30, 0.3) 100%)',
        }}
      />

      {/* Subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Overall opacity control */}
      <div className="absolute inset-0 bg-black opacity-20" />
    </div>
  );
}

