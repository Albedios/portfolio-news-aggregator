---
name: Briefly
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#414754'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#717786'
  outline-variant: '#c0c6d6'
  surface-tint: '#005db8'
  primary: '#005ab3'
  on-primary: '#ffffff'
  primary-container: '#0073e0'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#4c4aca'
  on-secondary: '#ffffff'
  secondary-container: '#6664e4'
  on-secondary-container: '#fffbff'
  tertiary: '#9a4100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c25300'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3631b4'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Hanken Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style
The design system is centered on the concept of "Distilled Intelligence." It targets a sophisticated audience that values precision, speed, and depth without the clutter of traditional news feeds. 

The aesthetic is a hybrid of **Modern Minimalism** and **Editorial Precision**. It leverages high-quality typography and a restricted color palette to minimize cognitive load, allowing the information to take center stage. The interface should feel like a premium reading tool—reliable, calm, and authoritative. Visual interest is generated through meticulous alignment and subtle micro-interactions rather than heavy ornamentation.

## Colors
The color strategy employs "Intelligence Blue" as the primary action color to denote interactivity and AI-driven insights. 

- **Primary:** Used for active states, primary buttons, and LLM selection indicators.
- **Neutrals:** A range of grays from deep charcoal (#1C1C1E) for body text to soft off-whites (#F2F2F7) for container backgrounds, ensuring optimal contrast and reduced eye strain.
- **Semantic Tones:** Functional colors are used sparingly to tag news sentiment. Success (Green) for optimistic/positive breakthroughs, Warning (Amber) for neutral/developing stories, and Error (Red) for critical/urgent alerts.

## Typography
This design system utilizes a high-contrast typographic pairing to establish a clear hierarchy between content and interface.

- **Newsreader** is the editorial voice. It is used for article headlines and long-form quotes to provide a traditional, trustworthy journalistic feel.
- **Inter** is the functional workhorse, used for article summaries and body text to ensure maximum legibility across all screen densities.
- **Hanken Grotesk** is used for metadata, labels, and UI controls. Its sharp, contemporary geometry helps distinguish interface elements from the narrative content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict vertical rhythm based on a 4px baseline. 

- **Desktop:** A 12-column grid with a maximum content width of 1200px. AI summary sidebars or source lists should occupy a 3-column span, while the main feed occupies 6 to 9 columns.
- **Mobile:** A single-column layout with 16px side margins. 
- **Information Density:** Content density is high but balanced by generous 40px (xl) vertical spacing between distinct news modules to prevent visual overwhelming. Use 12px (sm) for internal card padding to maintain a compact, data-rich feel.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** Pure white (#FFFFFF) for the main reading surface.
- **Level 1 (Cards/Summaries):** Off-white surface (#F2F2F7) with a subtle 1px border (#E5E5EA). No shadow is used in resting states.
- **Level 2 (Hover/Active):** A very soft, diffused ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) is applied when a user interacts with a card.
- **Dividers:** Use 1px solid lines in #E5E5EA to separate feed items, maintaining a structured, grid-like appearance reminiscent of a newspaper.

## Shapes
The shape language is disciplined and "Soft" (0.25rem). This slight rounding removes the harshness of a purely brutalist grid while maintaining a professional, structured look.

- **Standard Elements:** Buttons, input fields, and news cards use a 4px corner radius.
- **Pill Elements:** Tone badges and LLM selection toggles use a fully rounded (pill) shape to distinguish them as interactive metadata or status indicators.

## Components

### AI Summary Cards
Summaries are housed in containers with a light blue tint background (#F0F7FF) and a 1px dashed border in the primary color to signify "AI-generated" content. These should always include a "Source Verified" icon.

### Tone Badges
Small, pill-shaped indicators using the functional color palette. They feature a low-opacity background (10%) and a high-opacity text (100%) of the same hue (e.g., Green text on light green background for "Optimistic").

### RSS Source Indicators
Text-based labels using `label-xs` typography. They should be accompanied by a 16px grayscale favicon of the source to maintain a clean, non-distracting UI.

### LLM Selection Toggles
A segmented control (button group) that allows users to switch between summary models (e.g., "Fast," "Deep," "Balanced"). The active state is indicated by a solid "Intelligence Blue" fill with white text.

### Buttons
- **Primary:** Solid #0A84FF with white text, 4px radius.
- **Secondary:** Ghost style with a 1px #0A84FF border and no fill.
- **Tertiary/Icon:** Plain text or icon-only, appearing gray until hovered.

### Input Fields
Clean, 1px bordered boxes with `body-md` text. Focus state uses a 1px solid primary color border with a subtle outer glow.