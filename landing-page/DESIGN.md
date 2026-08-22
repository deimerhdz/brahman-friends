---
name: Atelier Precise
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#434656'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#952200'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf3003'
  on-tertiary-container: '#ffddd5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#891e00'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 128px
---

## Brand & Style

The design system is rooted in **Modern Minimalism** with a focus on high-end craftsmanship and technical precision. It targets a discerning audience that values bespoke quality, from individual collectors to luxury corporate clients.

The aesthetic is "Architectural Elegance"—utilizing vast whitespace to allow product photography to serve as the primary visual driver. The interface remains unobtrusive, employing sharp geometry and a restricted palette to evoke a sense of exclusivity and professional reliability. The emotional response is one of calm, deliberate luxury and confidence in the customization process.

## Colors

The palette is anchored by a high-contrast relationship between deep blacks and pristine whites, punctuated by a single, high-chroma **Electric Blue** (represented here in OKLCH for maximum perceptual vibrance).

- **Primary (Electric Blue):** Used exclusively for high-priority actions, progress indicators in the hat configurator, and critical brand touchpoints.
- **Surface (Neutral):** A range of cool-toned greys and whites. Backgrounds use a subtle off-white to reduce eye strain and provide a "gallery" feel.
- **Content (Secondary):** Rich blacks for typography and structural borders to ensure maximum legibility and a premium "ink-on-paper" quality.

## Typography

This design system utilizes **Inter** for its systematic, tech-forward clarity. Headlines feature tight letter-spacing and substantial weight to create a rhythmic hierarchy. 

To emphasize the "custom/technical" nature of the product, **JetBrains Mono** is introduced for labels, measurements, and SKU data, providing a subtle nod to the precision of the manufacturing process. All body text maintains generous line-height to preserve the spacious, premium feel.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop, centering the content within a 1440px max-width container to maintain a controlled editorial look. 

- **Desktop:** 12-column grid with 24px gutters and 64px outer margins.
- **Tablet:** 8-column grid with 24px gutters and 40px outer margins.
- **Mobile:** 4-column grid with 16px gutters and 20px outer margins.

Spacing is based on a **4px base unit**. Section transitions should be aggressive, utilizing the `section-gap` token to create distinct "chapters" in the user journey, particularly between the product showcase and the technical configurator.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and highly diffused **Ambient Shadows**.

1.  **Level 0 (Base):** Subtle off-white (`#F9F9F9`) background.
2.  **Level 1 (Cards/Drawers):** Pure white surfaces with a "Ghost Border" (1px solid `#EEEEEE`).
3.  **Floating Elements:** Use a singular, ultra-soft shadow: `0 20px 40px rgba(0,0,0,0.04)`. 

Avoid multiple layers of shadows. If an element needs to feel "above," use the Electric Blue accent color for its border or a subtle backdrop blur (Glassmorphism) for overlays and drawers to maintain context of the underlying product.

## Shapes

The shape language is primarily **Sharp**, with very subtle rounding (`0.25rem`) applied only to interactive components like buttons and input fields to make them feel tactile. Larger structural containers and images should remain perfectly sharp (0px) to reinforce the architectural and high-end aesthetic.

## Components

### Configurator Steppers
The custom hat configurator uses a "Progressive Disclosure" stepper. Each step is represented by a technical label (JetBrains Mono) and a thin vertical line. Completed steps highlight in Electric Blue.

### Primary Buttons
Large, high-contrast blocks.
- **Style:** Black background, white text, 4px border radius.
- **Interaction:** On hover, the background shifts to Electric Blue. 

### Input Fields (Personalization)
- **Style:** Minimalist underline or 1px border. 
- **Focus:** The border transitions to Electric Blue with a subtle 2px outer glow of the same color. 
- **Typography:** Placeholder text in light grey, input text in JetBrains Mono.

### Collection Cards
- **Structure:** Full-bleed imagery with a sharp-edged container. 
- **Details:** Price and title appear on a pure white "shelf" below the image, utilizing the `label-caps` style for categories.

### Drawers (B2B Bulk Orders)
Side-panels for bulk SKU entry should use a backdrop blur (`blur(10px)`) over the main shop view. Tables within drawers should be dense and monospaced to reflect professional utility.