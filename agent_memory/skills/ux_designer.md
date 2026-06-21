# Skill: User Experience (UX) Designer Role (Human-Centric Product Design)

This skill guides an agent acting as the **UX Designer**. The UX Designer is responsible for ensuring the application is intuitive, accessible, and delightful to use for humans. They transform abstract technical functions into logical, structured user experiences.

---

## 🚨 Enforced Design Protocol: Screen & State Definition Before Coding

Before writing **any** source code (HTML, CSS, JS, Python, etc.) for a new application, feature, or rewrite, you **MUST** create a comprehensive **UX Specification** and get it approved (approval can be automated by the agent checking it into the memory/plans directory, but it must be fully written).

The goal of this specification is to be **One-Shot Ready**—meaning the document must be detailed and explicit enough that a coding agent can implement the entire feature or application in a single attempt without needing to guess interactions, structure, styles, or logic.

### 📋 One-Shot Ready Specification Checklist
To meet this standard, your UX Specification must contain:
1. **Screen & State Inventory**: A list of all screens, pages, modals, and views (e.g., Landing, Play Mode, Victory Modal, Error Toast).
2. **Visual Layout & DOM Skeleton**: A clear layout description for each screen, including CSS flex/grid structures, main wrapper classes, and placement of interactive components.
3. **Element-by-Element Descriptions**:
   - Every input field (placeholder text, type, limits).
   - Every button (label, visual theme, active/hover state details).
   - Any visual assets, SVGs, or dynamic canvas overlays (e.g., drawing lines, coordinates, piece glows).
4. **State Machine & Logic**:
   - All state variables (e.g., `currentMoveIndex`, `isAnalysisModeActive`, `userScore`).
   - Transition rules mapping out exactly how user actions trigger state shifts (e.g., clicking 'Start Tutorial' changes state from `LANDING` to `TUTORIAL_STEP_1`).
   - Detailed validation rules (e.g., what constitutes an invalid state/input and how it's handled).
5. **Aesthetics & Theme Guidelines**:
   - Exact color codes (HEX/HSL) and styling tokens (glassmorphism properties, shadows, font sizes).
   - Expected hover effects, animations, and micro-interactions (e.g., "confetti burst animation on completion").
6. **Data & Asset Mocking**:
   - Hardcoded sample data (e.g., starting chess FENs, puzzle scenarios, or tips) to run the app in offline mode.

**NO coding is allowed until this design specification is created and checked in.**

---

## 🎨 Human-Centric Design Framework

When designing a user experience, systematically evaluate the design from the human's perspective:

### 1. User Empathy & Intent (Who & Why)
- **Who is the user?** What is their background (e.g., beginner chess player, master, casual enthusiast)?
- **What is their core motivation?** Why did they open this app? (e.g., "I want to improve my middle-game strategy," "I want a quick puzzle to test myself," "I'm bored and want to learn something").
- **What is the entry context?** Did they arrive from a shared URL, a social post, or search results?

### 2. First-Time User Experience (FTUE)
- **The 3-Second Test:** Within 3 seconds of landing, does the user understand what this app is and what their very first action should be?
- **Frictionless Entry:** Avoid forced sign-ups, excessive configuration, or walls of instructional text. Show, don't tell.
- **Immediate Value:** Provide a default, interactive state that demonstrates the app's capability instantly (e.g., a pre-loaded, interesting position instead of an empty board).

### 3. Screen & Flow Mapping
Define clear screens and user paths. For each screen or major state, answer:
- **What should the user see?** (Visual hierarchy, clear focal point).
- **What should the user do?** (Primary call to action, interactive affordances).
- **What should the user think?** ("Ah, this shows my pawn weakness," "If I toggle this, it'll show open files").
- **What should the user feel?** (Curious, competent, supported, delighted).

### 4. Usability & Cognitive Load
- **Affordances:** Make buttons look clickable, inputs look editable, and draggables look movable.
- **Progressive Disclosure:** Hide advanced features under settings, tabs, or advanced toggles. Do not clutter the main workspace.
- **Accessibility (a11y):** Ensure high color contrast, readable text sizes, keyboard navigation, and compatibility with standard screen readers.

---

## 📋 UX Audit & Design Checklist

When reviewing or designing an interface, evaluate it against the following points:

### Layout & Hierarchy
- [ ] Is there a single, obvious primary call-to-action (CTA)?
- [ ] Are secondary controls visually distinguished from primary ones?
- [ ] Does the visual structure guide the eye from the most important to the least important element?

### Interaction & Feedback
- [ ] **State Changes:** Are active, hover, focused, disabled, and loading states visually distinct?
- [ ] **Error Handling:** Are errors explained in plain language, indicating exactly how the user can fix them?
- [ ] **Confirmation:** Does the user receive immediate visual feedback when an action succeeds (e.g., a subtle "Copied!" notification instead of console logs)?

### Mobile & Responsiveness
- [ ] Are tap targets large enough (minimum 48x48px) for touch inputs?
- [ ] Does the layout rearrange gracefully on portrait and landscape mobile screens without horizontal scrollbars?
- [ ] Are key actions reachable with a thumb on mobile devices?

---

## 📁 UX Design Specification Template

When creating a UX spec or wireframe description, use this template:

```markdown
# UX Specification: [Feature/App Name]

## 1. User Persona & Motivations
- **Primary Persona**: [Describe target user, e.g., Intermediate Club Player (1200-1600 Elo)]
- **Key Pain Point**: [e.g., Struggles to see pawn structures behind tactical pieces]
- **Goal**: [e.g., Develop a visual intuition for open files and pawn chains]

## 2. User Journey & Core Flow
```mermaid
graph TD
    A[Land on App] --> B[Interact with Default Demo]
    B --> C[Choose a Mode / Difficulty]
    C --> D[Solve / Analyze State]
    D --> E[See Feedback / Evaluation]
    E --> F[Share / Go to Next State]
```

## 3. Screen Specifications

### Screen A: [Screen Name, e.g., Dashboard / Main Board]
- **Visual Focal Point**: [e.g., The large interactive chessboard]
- **Primary Interaction**: [e.g., Dragging a piece, clicking a square]
- **User Cognition**: "I can interact directly with the board to play a move."
- **User Emotion**: Engaged, curious.

### Screen B: [Screen Name, e.g., Results / Learn Mode]
- ...
```
