# UX Improvements TODO

**Target User:** Non-technical project managers monitoring multiple websites who want to easily create experiments and view results to make data-driven decisions.

---

## 🚀 Phase 1: High Impact Quick Wins

### ✅ Completed
- [x] Modern Supabase-inspired styling
- [x] Visual element selector with SDK integration
- [x] Dark mode support

### 🎯 In Progress
- [ ] None

### 📋 To Do

#### 1.1 Enhanced Experiment List
- [ ] Add search bar to filter experiments by name
- [x] Add filter dropdown (Status: All/Active/Paused/Stopped)
- [x] Show inline metrics in experiment cards (views, conversions, rate)
- [x] Add status badges with colors (Active=green, Paused=yellow, Stopped=gray)
- [x] Add sort dropdown (Recent, Performance, Alphabetical, Status)
- [x] Show winner indicator (star) on performing experiments
- [x] Add visual performance indicator (↑/↓ with percentage)

#### 1.2 Improved Empty States
- [ ] Design friendly empty state for "No experiments"
- [ ] Add "Create your first experiment" CTA with illustration
- [ ] Add empty state for "No results" when filtering
- [ ] Add empty state for analytics with guidance

#### 1.3 Experiment Templates
- [ ] Create templates system/data structure
- [ ] Design template selection UI
- [ ] Implement common templates:
  - [ ] Change Button Color
  - [ ] Test Headline Text
  - [ ] Hero Image A/B Test
  - [ ] CTA Button Text
  - [ ] Pricing Display
- [ ] Add "Start from template" option in experiment builder

#### 1.4 Quick Actions
- [ ] Add "Duplicate Experiment" button
- [ ] Add "Archive" action for old experiments
- [ ] Add quick Pause/Resume toggle from list view
- [ ] Add confirmation dialogs for destructive actions

#### 1.5 Better Visual Feedback
- [ ] Add loading states for all async operations
- [ ] Add success toasts for actions (saved, duplicated, etc.)
- [ ] Add error handling with friendly messages
- [ ] Add skeleton loaders instead of "Loading..."

---

## 🎨 Phase 2: Core UX Improvements

### 2.1 Multi-Website Organization
- [ ] Add "Projects" or "Websites" data model
- [ ] Create website/project selector in header
- [ ] Add website configuration page
- [ ] Color-code experiments by website
- [ ] Add website-specific API keys
- [ ] Create dashboard view showing all websites
- [ ] Add ability to switch between websites

### 2.2 Simplified Experiment Creation
- [ ] Replace technical terms with plain language:
  - [ ] "Variations" → "Versions"
  - [ ] "DOM Changes" → "Changes" or "What to change"
  - [ ] "Traffic Allocation" → "% of visitors to include"
- [ ] Create wizard-style experiment builder:
  - [ ] Step 1: What do you want to test?
  - [ ] Step 2: Pick the element (visual selector)
  - [ ] Step 3: Create versions
  - [ ] Step 4: Set goal & launch
- [ ] Add helper text and tooltips throughout
- [ ] Add preview before launch feature
- [ ] Add "Save as draft" option

### 2.3 Enhanced Analytics Dashboard
- [x] Add winner callout cards ("Variation A is winning by 25%!")
- [ ] Add line charts showing performance over time (future enhancement)
- [x] Add statistical significance indicator (Z-test with 95%/90%/80% confidence)
- [x] Add confidence score display
- [x] Add actionable insights/recommendations
- [ ] Add date range picker (Last 7/30 days, custom) (future enhancement)
- [ ] Add export functionality (PDF/CSV) (future enhancement)
- [x] Add comparison view for multiple experiments (side-by-side comparison modal)

### 2.4 Improved Experiment Detail View
- [ ] Add status timeline (Created → Running → Results Ready)
- [ ] Add goals & targets section
- [ ] Add progress indicators
- [ ] Add quick actions bar (Start, Pause, Duplicate, Archive)
- [ ] Add notes/comments section for PMs
- [ ] Add shareable links for results
- [ ] Add change history/audit log

### 2.5 Side-by-Side Comparison
- [x] Create comparison view component
- [x] Show variations visually side-by-side
- [x] Add performance comparison table
- [x] Highlight winner clearly (winner ribbon)
- [x] Add "Make it permanent" action
- [x] Add impact calculator projection

---

## 🔔 Phase 3: Advanced Features

### 3.1 Onboarding & Help
- [ ] Create welcome tour (3-step walkthrough)
- [ ] Add sample/demo experiment pre-loaded
- [ ] Add contextual tooltips (? icons)
- [ ] Create help center/documentation
- [ ] Add video tutorial embeds
- [ ] Create success checklist for new users
- [ ] Add interactive guides for common tasks

### 3.2 Smart Notifications
- [ ] Design notification system
- [ ] Add in-app notification center
- [ ] Implement notifications:
  - [ ] "Test ready for review"
  - [ ] "Winning variation found"
  - [ ] "Statistical significance reached"
  - [ ] "Traffic anomaly detected"
- [ ] Add email digest system
- [ ] Add notification preferences

### 3.3 Visual Selector Enhancements
- [ ] Add guided SDK setup flow
- [ ] Show visual SDK detection confirmation
- [ ] Create popular selectors library
- [ ] Add element inspector/details view
- [ ] Add "Recently used elements" section
- [ ] Improve error messages and guidance

### 3.4 Power User Features
- [ ] Add tags/labels for organization
- [ ] Add favorites/starred experiments
- [ ] Add keyboard shortcuts
- [ ] Add bulk operations (archive, tag, export)
- [ ] Add custom fields/metadata
- [ ] Add experiment scheduling

### 3.5 Reporting & Analytics
- [ ] Create custom report builder
- [ ] Add saved report templates
- [ ] Add scheduled reports
- [ ] Add team collaboration features
- [ ] Add comment/annotation system
- [ ] Add performance benchmarks

---

## 🐛 Bug Fixes & Polish

### UI Polish
- [ ] Ensure all colors use CSS variables
- [ ] Audit and fix any remaining hardcoded colors
- [ ] Add loading skeletons everywhere
- [ ] Improve mobile responsiveness
- [ ] Add animations and transitions
- [ ] Improve focus states for accessibility

### Technical Debt
- [ ] Add proper error boundaries
- [ ] Improve API error handling
- [ ] Add request caching/optimization
- [ ] Add proper TypeScript types everywhere
- [ ] Add unit tests for critical paths
- [ ] Add E2E tests for main flows

### Accessibility
- [ ] Audit for WCAG 2.1 AA compliance
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Improve color contrast where needed

---

## 📊 Success Metrics

**How we'll measure success:**
- Time to create first experiment (target: < 5 minutes)
- % of users who complete experiment setup (target: > 80%)
- Average experiments per user (target: > 3)
- Time spent in analytics (target: increase by 50%)
- User satisfaction score (target: > 4/5)
- Support requests about UI (target: decrease by 60%)

---

## 🎯 Current Sprint

**Sprint Goal:** Complete Phase 1 Quick Wins

**Focus Areas:**
1. Enhanced experiment list with search & filters
2. Inline metrics display
3. Improved empty states
4. Basic templates system
5. Quick actions (duplicate, archive)

**Estimated Completion:** 2-3 days

---

## Notes

- All features should maintain the modern Supabase-inspired design
- Keep non-technical users in mind - avoid jargon
- Add help text and examples everywhere
- Prioritize clarity over complexity
- Test with actual PMs before finalizing

