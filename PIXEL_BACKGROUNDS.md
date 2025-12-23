# Pixel Art Backgrounds Guide

Your onboarding now has **cool pixel art backgrounds** like the reference images! 🎨

## What's Implemented

I've added two pixel background options to your app:

### 1. **PixelBackground** (Currently Active) 
- **Animated cityscape** with buildings, windows, stars
- **Dynamic lighting effects** - windows flicker and glow
- **Retro cyberpunk aesthetic** - neon colors and pixel art style
- Canvas-based rendering for smooth animations
- Located: `components/PixelBackground.tsx`

### 2. **SimplePixelBackground** (Performance Alternative)
- **Lightweight CSS-based** pixel effects
- **Static cityscape silhouette** with glowing windows
- **Better performance** - no canvas animations
- Perfect for mobile or lower-end devices
- Located: `components/SimplePixelBackground.tsx`

## Switching Between Backgrounds

### To Use the Simple Background

Replace the import in your pages:

```typescript
// Change this:
import PixelBackground from '../../components/PixelBackground';

// To this:
import SimplePixelBackground from '../../components/SimplePixelBackground';

// And update the component:
<SimplePixelBackground />
```

## Using Your Own Pixel Art Images

Want to use actual pixel art images (like in your reference screenshots)? Here's how:

### Option A: Static Image Background

1. **Add your pixel art image** to `/public/` folder (e.g., `pixel-cityscape.png`)

2. **Create a custom background component**:

```tsx
// components/ImagePixelBackground.tsx
'use client';

export default function ImagePixelBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none bg-cover bg-center"
      style={{
        backgroundImage: 'url(/pixel-cityscape.png)',
        imageRendering: 'pixelated', // Keeps pixel art crisp
        opacity: 0.4, // Adjust for readability
        filter: 'brightness(0.7)', // Optional: darken for contrast
      }}
    />
  );
}
```

3. **Use it in your pages** by importing it instead of `PixelBackground`

### Option B: Multiple Random Backgrounds

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function RandomPixelBackground() {
  const backgrounds = [
    '/pixel-city-1.png',
    '/pixel-city-2.png',
    '/pixel-city-3.png',
  ];
  
  const [bg, setBg] = useState(backgrounds[0]);
  
  useEffect(() => {
    setBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
  }, []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none bg-cover bg-center transition-opacity duration-1000"
      style={{
        backgroundImage: `url(${bg})`,
        imageRendering: 'pixelated',
        opacity: 0.4,
      }}
    />
  );
}
```

## Customizing the Current Backgrounds

### Adjust Opacity

Make the background more/less visible:

```tsx
<PixelBackground />

// In PixelBackground.tsx, change this line:
style={{ 
  imageRendering: 'pixelated',
  opacity: 0.4, // Change this value (0.1 - 0.8)
  zIndex: 0,
}}
```

### Change Colors

Edit the palette in `PixelBackground.tsx`:

```typescript
const palette = {
  sky: ['#0a0e27', '#1a1e3a', '#2a2e4a'], // Night sky colors
  buildings: ['#1f2937', '#374151', '#4b5563', '#6b7280'], // Building grays
  windows: ['#fbbf24', '#f59e0b', '#3b82f6', '#60a5fa'], // Window lights
  neon: ['#ec4899', '#8b5cf6', '#10b981', '#fbbf24'], // Neon signs
};
```

### Adjust Animation Speed

```typescript
// In the draw() function:
frame++;
requestAnimationFrame(draw);

// Change to slower animation:
if (frame % 2 === 0) { // Only update every 2nd frame
  requestAnimationFrame(draw);
}
frame++;
```

## Free Pixel Art Resources

If you need pixel art images:

- **OpenGameArt.org** - Free pixel art assets
- **itch.io** - Pixel art asset packs (many free)
- **Piskel** - Free pixel art editor (create your own!)
- **Aseprite** - Professional pixel art tool ($20)

## Performance Notes

- **PixelBackground**: ~60 FPS, uses canvas API, may impact mobile performance
- **SimplePixelBackground**: Minimal performance impact, pure CSS
- **Image backgrounds**: Best performance, static assets

## Troubleshooting

### Background not showing?
- Check that the component is imported correctly
- Verify `z-index` values (background should be 0, content should be 10+)
- Make sure `relative` class is on the parent container

### Background too bright/dark?
- Adjust the `opacity` value in the component's style
- Add/remove `filter: 'brightness(0.7)'` or similar

### Text hard to read?
- Increase backdrop blur on content areas: `backdrop-blur-lg`
- Add semi-transparent backgrounds to cards: `bg-black/80`
- Reduce background opacity

## Current Implementation

Your app now has pixel backgrounds on:
- ✅ Main landing page (`app/page.tsx`)
- ✅ Onboarding flow (`app/onboarding/page.tsx`)
- ✅ Loading screen
- ✅ Summary screen

All content has proper z-indexing and backdrop blur for readability!

