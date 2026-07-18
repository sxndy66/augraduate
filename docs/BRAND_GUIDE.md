# AU Track — Brand Guide

## Brand Identity

### Name
**AU Track** — short for "Anna University Track." The name communicates tracking, monitoring, and staying on top of academic performance. "AU" is the universally recognized abbreviation for Anna University among students.

### Tagline
**"Your grades. Your goals. One app."**

### Alternate Taglines
- "Track smarter. Study better."
- "The academic companion for Anna University students."
- "From screenshot to CGPA in seconds."

## Brand Personality

| Trait | Expression |
|-------|------------|
| Trustworthy | Privacy-first, non-affiliated disclaimers, transparent data handling |
| Student-first | Built by a student, for students — every feature solves a real pain point |
| Fast | Quick OCR, instant GPA calculation, no unnecessary steps |
| Approachable | Clear language, no jargon, helpful empty states and error messages |
| Modern | Dark UI, smooth animations, mobile-first design |

## Tone of Voice

- **Direct and helpful** — no fluff, no corporate speak
- **Encouraging** — "You're on track!" not "Your CGPA is below average"
- **Transparent** — clear about what data is collected and how it's used
- **Student-friendly** — uses terms students actually use ("arrears", "reval", "regs")
- **Not authoritative** — always recommends verifying with official sources

### Do Say
- "Upload your grade screenshot and we'll extract the grades for you."
- "You need a GPA of 8.5 next semester to hit your target CGPA of 8.0."
- "This notification is from annauniv.edu — tap to view the original."

### Don't Say
- "Utilize our proprietary OCR algorithm to digitize your academic transcript."
- "Your CGPA of 6.2 is below the 75th percentile."
- "We guarantee accuracy of all university notifications."

## Color Palette

### Primary Colors

| Color | Hex | Tailwind Token | Usage |
|-------|-----|----------------|-------|
| Navy | `#0a0e27` | `navy` | Background, dark base |
| Electric Blue | `#3b82f6` | `electric-blue` | Primary actions, links, highlights |
| Royal Indigo | `#6366f1` | `royal-indigo` | Gradients, secondary accents |

### Semantic Colors

| Color | Hex | Tailwind Token | Usage |
|-------|-----|----------------|-------|
| Success Green | `#22c55e` | `success-green` | Success states, verified badges, pass grades |
| Amber | `#f59e0b` | `amber` | Warnings, pending states, mid-range grades |
| Error Red | `#ef4444` | `error-red` | Errors, fail grades (U/RA), delete actions |

### Color Scale
Each color has a full 50–950 scale for gradients, hovers, and subtle backgrounds. See `tailwind.config.ts` for the complete scale.

### Usage Rules
- **Background:** Navy 900 (`#0a0e27`) as the base, with subtle gradient blobs in electric-blue/10 and royal-indigo/10
- **Cards:** Glass-morphism effect (`glass-card` class) with navy-800/50 background
- **Primary buttons:** Gradient from electric-blue to royal-indigo
- **Text:** White for headings, gray-300/400 for body, gray-500 for hints
- **Badges:** 15% opacity background with full-color text and 30% opacity border

## Typography

### Font Family
**Inter** — loaded via `next/font/google` with `--font-inter` CSS variable.

### Type Scale

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Page title (h1) | text-xl / text-2xl | font-bold | `text-xl font-bold text-white sm:text-2xl` |
| Section title (h2) | text-base / text-lg | font-semibold | `text-base font-semibold text-white` |
| Card title (h3) | text-sm / text-base | font-semibold | `text-sm font-semibold text-white` |
| Body text | text-sm | font-normal | `text-sm text-gray-400` |
| Hint text | text-xs | font-normal | `text-xs text-gray-500` |
| Button text | text-sm | font-semibold | `text-sm font-semibold` |
| Badge text | text-xs | font-medium | `text-xs font-medium` |
| Stat numbers | text-2xl | font-bold | `text-2xl font-bold text-white` |

## Logo & Icon

### App Icon
- Rounded square with gradient (electric-blue → royal-indigo)
- Contains a chart/track line icon in white
- Used in navbar, favicon, and PWA manifest

### Icon Style
- **Library:** Lucide React
- **Style:** Outline icons, 1.5px stroke
- **Sizes:** 16px (h-4 w-4), 20px (h-5 w-5), 24px (h-6 w-6), 32px (h-8 w-8)
- **Color:** Inherits from parent text color or uses semantic colors

## UI Components

### Cards
- Rounded 2xl (16px radius)
- Glass-morphism background
- Optional gradient border (electric-blue → royal-indigo → transparent)
- Subtle hover shadow with electric-blue glow

### Buttons
- 5 variants: primary (gradient), secondary (navy), outline, ghost, danger
- 3 sizes: sm, md, lg
- Framer Motion spring animation on hover/tap
- Loading state with spinner

### Inputs
- Rounded xl (12px radius)
- Navy-800/50 background with navy-600 border
- Electric-blue focus ring
- Error state with red border and message

## Dark Mode

- **Default:** Dark mode is the default (`<html className="dark">`)
- **Strategy:** Tailwind `darkMode: "class"` — explicit toggle, not media query
- **All components** have dark mode styles as their primary design
- Light mode support is planned for Phase 4

## Imagery

- No stock photos — the brand is clean and UI-focused
- Gradient backgrounds with blurred color blobs for ambient depth
- Icons and illustrations only (no photographic imagery)
- Screenshots in marketing materials show the actual app UI
