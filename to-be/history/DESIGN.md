---
name: Vibrant Emerald Eco-Play
colors:
  surface: '#e7fff3'
  surface-dim: '#a8e7cd'
  surface-bright: '#e7fff3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#cbffe8'
  surface-container: '#bbfbe1'
  surface-container-high: '#b6f6db'
  surface-container-highest: '#b0f0d6'
  on-surface: '#002117'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#003829'
  inverse-on-surface: '#befee3'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#ffc329'
  on-secondary-container: '#6f5100'
  tertiary: '#6d3bd7'
  on-tertiary: '#ffffff'
  tertiary-container: '#b090ff'
  on-tertiary-container: '#4600a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#e7fff3'
  on-background: '#002117'
  surface-variant: '#b0f0d6'
typography:
  headline-xl:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base_unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1200px
---

## Brand & Style

The brand personality is energetic, optimistic, and deeply approachable, designed to transform sustainability from a serious chore into a playful, rewarding experience. The target audience includes eco-conscious younger demographics and families who value transparency and "joyful activism."

The design style is **Bubbly Neo-Brutalism**. It merges the raw, structural energy of Neo-Brutalism (using hard shadows and bold strokes) with a soft, toy-like aesthetic characterized by extreme roundedness and high-saturation colors. Every interaction should feel tactile and "squishy," evoking a sense of lightness and fun while maintaining the professional reliability of the sustainability sector.

## Colors

The palette is anchored by a vibrant **Emerald Green** (Primary) that signals growth and environmental health. This is supported by an **Amber Yellow** (Secondary) to inject warmth and a **Vibrant Violet** (Tertiary) for specialized accents and gamified elements. 

The neutral palette avoids muddy greys, instead using a very deep **Forest Green** for text and "ink" colors to maintain the emerald core throughout. Backgrounds should primarily be a crisp off-white or very faint mint to ensure the high-contrast elements pop. Use the primary color for main actions and the secondary color for celebratory moments or rewards.

## Typography

This design system utilizes **Quicksand** exclusively to ensure a friendly, rounded terminal feel across all interfaces. The weight scale is intentionally pushed toward the heavier side (Medium to Bold) to maintain legibility against the "cartoony" UI elements and thick borders. 

Headlines use tight line heights and negative letter-spacing for a punchy, editorial look. Body text remains generous in line height to ensure accessibility and a breezy reading experience. Labels and buttons should always use the bolder weights to stand up against the heavy illustrative shadows.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a "chunky" spacing rhythm. Because elements are highly rounded and have hard shadows, they require more breathing room (negative space) than traditional corporate layouts to avoid visual clutter.

- **Mobile:** Single column with 16px margins. Elements span the full width.
- **Tablet:** 8-column grid with 24px gutters.
- **Desktop:** 12-column grid. Components should be grouped in "islands" or cards rather than stretching across the full screen width to maintain the toy-like, contained aesthetic. 

Always use multiples of 8px for padding and margins to maintain a consistent mathematical rhythm.

## Elevation & Depth

This design system rejects soft, ambient shadows in favor of **2D Illustrative Shadows**. 

- **Shadow Style:** 100% opacity, 0px blur, offset to the bottom-right (typically 4px for small elements, 8px for large cards).
- **Shadow Color:** Use the "Neutral" deep Forest Green or a darker shade of the element's background color.
- **Depth Levels:**
    - **Level 0 (Flat):** Interactive elements in a "pressed" state or background containers.
    - **Level 1 (Raised):** Standard buttons and small cards. 4px offset.
    - **Level 2 (Floating):** Primary CTA buttons and feature cards. 8px offset.

The "pressed" state of any button should physically move the element $(x+n, y+n)$ to cover the shadow, creating a mechanical "click" feel.

## Shapes

The shape language is defined by extreme **Pill-shaped** geometry. All interactive elements must feel soft to the touch. 

Standard components use a 1rem (16px) radius, while larger containers and featured cards use 2rem or 3rem to create a "bubble" effect. Every container, button, and input field should be wrapped in a thick, solid border (minimum 2px) that matches the shadow color to give the 2D illustration its structure.

## Components

- **Buttons:** Use the "Pill" shape with a 2px solid border and a hard 4px shadow. On hover, the shadow increases to 6px; on active (press), the element shifts down and right to hide the shadow entirely.
- **Input Fields:** Thick borders with a 1rem radius. Focus states should swap the border color to the Primary Emerald and add a subtle, colored hard-shadow.
- **Cards:** Use a 2rem radius. Ensure cards have a white background with a colored hard-shadow to differentiate content blocks.
- **Chips/Badges:** Fully circular ends (pill). Use high-contrast background colors with the deep neutral text for maximum legibility.
- **Checkboxes & Radios:** Must be oversized and bubbly. Checkmarks should be thick and hand-drawn in style.
- **Progress Bars:** Extra thick (16px+ height) with a "track" that has an inset hard shadow and a "fill" that is a vibrant, solid color.
- **Illustrative Accents:** Incorporate simple 2D icons with the same border-weight as the UI components to maintain a cohesive "Eco-World" look.