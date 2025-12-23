'use client';

import { useEffect, useRef } from 'react';

/**
 * High-quality pixel art background inspired by moody landscape aesthetics
 * Features: Mountains, forests, atmospheric depth, pixel-perfect rendering
 */
export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Pixel size for that authentic retro feel
    const pixelSize = 6;

    // Color palette - moody, atmospheric
    const colors = {
      // Sky layers - deep blues and purples
      skyDeep: '#0a0a1e',
      skyMid: '#1a1a3e',
      skyLight: '#2a2a5e',
      skyHorizon: '#3a3a7e',
      
      // Mountain layers - silhouettes getting lighter
      mountainFar: '#1a1a2e',
      mountainMid: '#252542',
      mountainNear: '#303052',
      mountainFront: '#3a3a62',
      
      // Forest/trees
      treeDark: '#1a2a1a',
      treeMid: '#2a3a2a',
      treeLight: '#3a4a3a',
      
      // Accent colors
      starWhite: '#ffffff',
      starBlue: '#7f9fff',
      starPurple: '#9f7fff',
      glowPurple: '#8b5cf6',
      glowBlue: '#3b82f6',
      glowPink: '#ec4899',
    };

    // Generate starfield
    const stars: { x: number; y: number; size: number; color: string; twinkleSpeed: number; twinkleOffset: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * (H * 0.5), // Stars only in upper half
        size: Math.random() > 0.8 ? 2 : 1,
        color: Math.random() > 0.7 ? colors.starBlue : Math.random() > 0.5 ? colors.starPurple : colors.starWhite,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // Generate mountain ranges (multiple layers for depth)
    const generateMountainRange = (
      baseY: number, 
      amplitude: number, 
      frequency: number, 
      jaggedness: number
    ): number[] => {
      const points: number[] = [];
      const steps = Math.ceil(W / pixelSize) + 2;
      
      for (let i = 0; i < steps; i++) {
        const x = i * pixelSize;
        let y = baseY;
        
        // Smooth mountain curve
        y += Math.sin(x * frequency) * amplitude;
        y += Math.sin(x * frequency * 2.3 + 10) * (amplitude * 0.5);
        y += Math.sin(x * frequency * 0.7 + 30) * (amplitude * 0.3);
        
        // Add jaggedness for peaks
        if (Math.random() < jaggedness) {
          y += (Math.random() - 0.5) * pixelSize * 2;
        }
        
        // Snap to pixel grid
        y = Math.round(y / pixelSize) * pixelSize;
        points.push(y);
      }
      
      return points;
    };

    // Create 4 mountain layers for depth
    const mountains = [
      {
        points: generateMountainRange(H * 0.45, 80, 0.008, 0.05),
        color: colors.mountainFar,
      },
      {
        points: generateMountainRange(H * 0.52, 100, 0.012, 0.08),
        color: colors.mountainMid,
      },
      {
        points: generateMountainRange(H * 0.62, 120, 0.015, 0.12),
        color: colors.mountainNear,
      },
      {
        points: generateMountainRange(H * 0.72, 90, 0.018, 0.15),
        color: colors.mountainFront,
      },
    ];

    // Generate tree silhouettes for foreground
    const trees: { x: number; height: number; width: number }[] = [];
    for (let i = 0; i < 30; i++) {
      trees.push({
        x: Math.random() * W,
        height: 40 + Math.random() * 80,
        width: 15 + Math.random() * 25,
      });
    }

    let frame = 0;

    const draw = () => {
      // Sky gradient - multiple layers for atmosphere
      const skyGradient = ctx.createLinearGradient(0, 0, 0, H);
      skyGradient.addColorStop(0, colors.skyDeep);
      skyGradient.addColorStop(0.3, colors.skyMid);
      skyGradient.addColorStop(0.6, colors.skyLight);
      skyGradient.addColorStop(0.85, colors.skyHorizon);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, W, H);

      // Atmospheric glow near horizon
      const glowGradient = ctx.createRadialGradient(W * 0.5, H * 0.6, 0, W * 0.5, H * 0.6, W * 0.6);
      glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, W, H);

      // Draw stars with twinkling
      stars.forEach((star) => {
        const twinkle = (Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.5;
        ctx.globalAlpha = 0.3 + twinkle * 0.6;
        ctx.fillStyle = star.color;
        
        // Pixelated stars
        const starX = Math.floor(star.x / pixelSize) * pixelSize;
        const starY = Math.floor(star.y / pixelSize) * pixelSize;
        ctx.fillRect(starX, starY, pixelSize * star.size, pixelSize * star.size);
        
        // Add subtle glow to some stars
        if (star.size > 1 && twinkle > 0.7) {
          ctx.globalAlpha = (twinkle - 0.7) * 0.3;
          ctx.fillRect(starX - pixelSize, starY, pixelSize, pixelSize);
          ctx.fillRect(starX + pixelSize * star.size, starY, pixelSize, pixelSize);
          ctx.fillRect(starX, starY - pixelSize, pixelSize * star.size, pixelSize);
          ctx.fillRect(starX, starY + pixelSize * star.size, pixelSize * star.size, pixelSize);
        }
      });
      ctx.globalAlpha = 1;

      // Draw mountain layers (back to front)
      mountains.forEach((mountain, layerIndex) => {
        ctx.fillStyle = mountain.color;
        ctx.beginPath();
        ctx.moveTo(0, H);
        
        mountain.points.forEach((y, i) => {
          const x = i * pixelSize;
          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            // Snap to pixel grid for that authentic pixel art look
            ctx.lineTo(x, y);
          }
        });
        
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Add subtle highlight on mountain peaks (front layers only)
        if (layerIndex >= 2) {
          ctx.globalAlpha = 0.05;
          ctx.fillStyle = colors.starWhite;
          ctx.beginPath();
          ctx.moveTo(0, H);
          
          mountain.points.forEach((y, i) => {
            const x = i * pixelSize;
            ctx.lineTo(x, y - pixelSize);
          });
          
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Draw tree silhouettes in foreground
      trees.forEach((tree) => {
        ctx.fillStyle = colors.treeDark;
        const treeX = Math.floor(tree.x / pixelSize) * pixelSize;
        const treeY = H - tree.height;
        
        // Simple tree shape - triangle for leaves, rectangle for trunk
        ctx.beginPath();
        ctx.moveTo(treeX, H);
        ctx.lineTo(treeX, treeY + tree.height * 0.3);
        ctx.lineTo(treeX - tree.width * 0.5, treeY + tree.height * 0.5);
        ctx.lineTo(treeX, treeY);
        ctx.lineTo(treeX + tree.width * 0.5, treeY + tree.height * 0.5);
        ctx.lineTo(treeX, treeY + tree.height * 0.3);
        ctx.lineTo(treeX, H);
        ctx.closePath();
        ctx.fill();
      });

      // Ambient particles/fireflies (subtle)
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const particleX = (frame * (1 + i * 0.3)) % W;
        const particleY = H * 0.6 + Math.sin(frame * 0.02 + i) * 50;
        const particleAlpha = (Math.sin(frame * 0.05 + i * 2) + 1) * 0.5;
        
        ctx.globalAlpha = particleAlpha * 0.3;
        ctx.fillStyle = i % 2 === 0 ? colors.glowBlue : colors.glowPurple;
        ctx.fillRect(
          Math.floor(particleX / pixelSize) * pixelSize,
          Math.floor(particleY / pixelSize) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
      ctx.globalAlpha = 1;

      frame++;
      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        imageRendering: 'pixelated',
        opacity: 0.25, // Reduced from 0.5 to 0.25 for better readability
        zIndex: 0,
      }}
    />
  );
}
