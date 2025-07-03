# Task 02-02: UI/UX Wireframes & Layout

**Version**: 1.0  
**Status**: ✅ COMPLETED - Wireframes and UX specifications ready for development  
**Last Updated**: January 2024

## Objective
Design comprehensive wireframes and user experience flow for the Oktholm Syndrome website that balances medical professionalism with accessible humor

## Deliverable
Complete wireframes, user flow documentation, and design specifications for all pages

## Dependencies
- [02-01: Website Copy](../../tasks/review/02-01-website-copy.md) (completed - provides content structure)
- [01-03: Logo Design](../../tasks/review/01-03-logo-design.md) (completed - provides visual identity)

## Review & Signoff

### UX/UI Review
- [ ] **UX Designer**: _____________________ Date: _________
- [ ] User flow logic and wireframe completeness verified
- [ ] Accessibility and usability requirements confirmed
- [ ] Mobile responsiveness and touch optimization validated

### Technical Review
- [ ] **Frontend Developer**: _____________________ Date: _________
- [ ] Implementation feasibility and technical constraints assessed
- [ ] Component architecture and development efficiency confirmed
- [ ] Performance and loading optimization considered

### Brand Review
- [ ] **Brand Manager**: _____________________ Date: _________
- [ ] Visual design aligns with brand strategy and aesthetic
- [ ] Satirical elements balanced with professional appearance
- [ ] User experience supports brand messaging and community goals

### Final Approval
- [ ] **Project Manager**: _____________________ Date: _________
- [ ] Ready for design implementation and development
- [ ] User testing plan and success metrics defined
- [ ] Timeline and resource allocation approved

**Review Notes**: _________________________________________________

## Design Philosophy

### Visual Approach
- **Medical Professional**: Clean, sterile, trustworthy aesthetic
- **Subtle Subversion**: Glitchy elements that reveal the satire
- **Accessibility First**: Clear hierarchy, readable fonts, good contrast
- **Mobile Responsive**: Touch-friendly, thumb-optimized navigation

### User Experience Goals
- **Immediate Understanding**: Clear value proposition within 5 seconds
- **Progressive Engagement**: Multiple entry points for different user types
- **Community Focus**: Easy path to join and participate
- **Satirical Discovery**: Humor emerges through interaction, not immediately obvious

## Page Layout Specifications

### Homepage Wireframe

#### Desktop Layout (1200px+ width)
```
[HEADER: Logo | Navigation Menu | Join Community CTA]
═══════════════════════════════════════════════════════

[HERO SECTION]
┌─ Medical-style banner image (subtle glitch effect) ─┐
│  Are You Suffering from Oktholm Syndrome?          │
│  [Subheading text]                                 │
│  [Take Assessment Button] [Join Community Button]   │
└─────────────────────────────────────────────────────┘

[SYMPTOMS CHECKLIST - 2 columns]
┌─ Do You Experience These Symptoms? ─────────────────┐
│ ☐ Symptom 1          ☐ Symptom 5                  │
│ ☐ Symptom 2          ☐ Symptom 6                  │
│ ☐ Symptom 3          ☐ Symptom 7                  │
│ ☐ Symptom 4          ☐ Symptom 8                  │
│              [Join Support Group CTA]               │
└─────────────────────────────────────────────────────┘

[SOCIAL PROOF SECTION - 3 columns]
┌─ Testimonial 1 ─┐ ┌─ Testimonial 2 ─┐ ┌─ Stats Panel ─┐
│ User quote      │ │ User quote      │ │ 10,847 Members│
│ - Name, Title   │ │ - Name, Title   │ │ 89% Happier   │
└─────────────────┘ └─────────────────┘ └───────────────┘

[FOOTER: Links | Legal | Social Media]
```

#### Mobile Layout (320px+ width)
```
[HEADER: ☰ Logo                    Join]
════════════════════════════════════════

[HERO - Full width, stacked]
┌─ Hero Image ─────────────────────────┐
│ Are You Suffering from              │
│ Oktholm Syndrome?                   │
│ [Subheading]                        │
│ [Take Assessment - Full Width]      │
│ [Join Community - Full Width]       │
└─────────────────────────────────────┘

[SYMPTOMS - Single column]
┌─ Symptoms Checklist ────────────────┐
│ ☐ Symptom 1                        │
│ ☐ Symptom 2                        │
│ ☐ Symptom 3                        │
│ [View All Symptoms]                 │
│ [Join Support Group]                │
└─────────────────────────────────────┘

[TESTIMONIALS - Carousel]
┌─ Testimonial Slider ────────────────┐
│ • • ○                              │
│ "User quote..."                     │
│ - Name, Title                       │
│ [< Previous] [Next >]               │
└─────────────────────────────────────┘
```

### Assessment Page Wireframe

#### Question Layout
```
[PROGRESS BAR: ████████░░ 8/10]
═══════════════════════════════════════

┌─ Question Container ─────────────────────────────────┐
│ Question 8 of 10                                    │
│                                                     │
│ How long is your average login process?             │
│                                                     │
│ ○ Under 30 seconds (0 points)                      │
│ ○ 1-2 minutes (1 point)                           │
│ ○ 3-5 minutes (2 points)                          │
│ ○ 5+ minutes (3 points)                           │
│ ○ "What's a quick login?" (4 points)               │
│                                                     │
│ [Back] [Next Question]                              │
└─────────────────────────────────────────────────────┘

[SIDEBAR: Encouraging message or community stats]
```

#### Results Page Layout
```
[RESULTS HEADER]
═══════════════════════════════════════

┌─ Results Card ──────────────────────────────────────┐
│ Your Score: 23/40                                  │
│                                                     │
│ MODERATE OKTHOLM SYNDROME                          │
│                                                     │
│ [Results description text]                          │
│                                                     │
│ [Join Recovery Community] [Share Results]           │
│                                                     │
│ Next Steps:                                         │
│ • Join our support community                       │
│ • Take the advanced assessment                      │
│ • Read recovery stories                             │
└─────────────────────────────────────────────────────┘
```

### Community Page Layout

#### Community Hub Design
```
[COMMUNITY HEADER]
═══════════════════════════════════════

[PLATFORM SELECTION - Cards]
┌─ Discord ────┐ ┌─ Reddit ─────┐ ┌─ LinkedIn ───┐
│ Real-time    │ │ Discussions  │ │ Professional │
│ Support      │ │ & Memes      │ │ Network      │
│ [Join Now]   │ │ [Join Now]   │ │ [Join Now]   │
└──────────────┘ └──────────────┘ └──────────────┘

[RECENT ACTIVITY FEED]
┌─ Community Updates ──────────────────────────────────┐
│ • New member introduction from Sarah K.             │
│ • Recovery story: "How I escaped my login loop"     │
│ • Weekly support group - 47 attendees               │
│ • Meme contest: "Identity Provider Horror Stories"  │
└─────────────────────────────────────────────────────┘

[UPCOMING EVENTS]
┌─ Virtual Support Groups ─────────────────────────────┐
│ Mon 7PM EST: Authentication Trauma Support          │
│ Wed 6PM EST: New Member Orientation                 │
│ Fri 8PM EST: Vendor Alternatives Workshop           │
└─────────────────────────────────────────────────────┘
```

## Interactive Elements

### Micro-Interactions

#### Button States
- **Default**: Clean medical button styling
- **Hover**: Subtle glitch effect (2px offset, brief)
- **Active**: Deeper glitch with color shift
- **Loading**: "Diagnosing..." with animated dots

#### Form Elements
- **Input Focus**: Clean blue outline with subtle glow
- **Validation**: Green checkmark or red error icon
- **Assessment Progress**: Animated progress bar with encouraging messages

#### Navigation States
- **Current Page**: Underline with medical blue
- **Hover**: Subtle color shift and underline
- **Mobile Menu**: Slide-in from left with overlay

### Error States & 404 Page

#### 404 Page Design
```
┌─ Error Page ─────────────────────────────────────────┐
│                                                     │
│               ERROR 404                             │
│                                                     │
│        Page Not Found Syndrome                      │
│                                                     │
│ Symptoms: Clicking links that go nowhere            │
│ Diagnosis: The page you're looking for has          │
│           developed separation anxiety               │
│                                                     │
│ Treatment: [Return to Homepage]                     │
│           [Take Assessment Instead]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Design System Specifications

### Typography Hierarchy
```
H1: 48px/56px Inter Bold (Desktop), 32px/40px (Mobile)
H2: 36px/44px Inter Bold (Desktop), 28px/36px (Mobile)
H3: 24px/32px Inter Medium
H4: 20px/28px Inter Medium
Body: 16px/24px Source Sans Pro Regular
Caption: 14px/20px Source Sans Pro Regular
Button: 16px/24px Inter Medium
```

### Color Application
- **Primary Actions**: Medical Blue (#2E86AB)
- **Error/Alert**: Digital Red (#F24236)
- **Success**: Recovery Green (#38A169)
- **Warning**: Orange (#FF8C42)
- **Text**: Charcoal (#2D3748)
- **Background**: White (#FFFFFF)
- **Secondary**: Soft Gray (#EDF2F7)

### Spacing System
- **Base Unit**: 8px
- **Component Padding**: 16px (mobile), 24px (desktop)
- **Section Margins**: 32px (mobile), 64px (desktop)
- **Element Spacing**: 8px, 16px, 24px, 32px

### Responsive Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

## Accessibility Specifications

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Alt Text**: Descriptive alt text for all images
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Semantic HTML and ARIA labels

### Performance Requirements
- **Page Load**: <3 seconds on 3G
- **First Contentful Paint**: <1.5 seconds
- **Largest Contentful Paint**: <2.5 seconds
- **Cumulative Layout Shift**: <0.1

## Animation Guidelines

### Subtle Glitch Effects
- **Trigger**: Hover on key elements
- **Duration**: 200ms max
- **Easing**: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- **Properties**: transform: translateX(2px), opacity shift

### Loading States
- **Assessment**: Progress bar with medical pulse animation
- **Page Transitions**: Fade in/out, 300ms
- **Form Submission**: Button text change + spinner

## Development Notes

### Framework Recommendations
- **Frontend**: React/Next.js for SEO and performance
- **Styling**: Tailwind CSS for rapid development
- **Animation**: Framer Motion for sophisticated interactions
- **Forms**: React Hook Form for assessment functionality

### Component Architecture
```
/components
  /layout
    Header.jsx
    Footer.jsx
    Navigation.jsx
  /assessment
    Question.jsx
    Results.jsx
    ProgressBar.jsx
  /community
    PlatformCard.jsx
    ActivityFeed.jsx
    EventList.jsx
  /ui
    Button.jsx
    Card.jsx
    Glitch.jsx
```

## Success Metrics

### UX Performance
- **Assessment Completion**: >60% start-to-finish
- **Community Conversion**: >25% homepage to signup
- **Mobile Usability**: >4.0 Google PageSpeed score
- **Accessibility**: 100% WCAG 2.1 AA compliance

### User Behavior
- **Session Duration**: >2 minutes average
- **Bounce Rate**: <40% homepage
- **Return Visits**: >30% within 30 days
- **Social Sharing**: >5% share rate on assessment results

## Next Steps
- [ ] Create high-fidelity mockups in Figma
- [ ] Develop interactive prototype for testing
- [ ] Conduct user testing with target audience
- [ ] Refine based on feedback and analytics 