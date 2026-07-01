# Technical Architecture Design: Smallest Step

This Technical Design Document (TDD) details the implementation structure, interfaces, schemas, and configurations for the "Smallest Step" application. It establishes a separation of concerns between a Flask backend (handling Gemini API and persistence) and a clientside Single-Page Application (SPA) frontend.

---

## 1. Project Directory & File Layout

All development will take place in the `smallest_step/` directory:

```text
smallest_step/
├── app.py                     # Flask API server, database models, and Gemini integration
├── requirements.txt           # Python application dependencies
├── Dockerfile                 # Multi-stage production container build
├── .env                       # Local environment configurations (API keys)
├── templates/
│   └── index.html             # HTML5 skeleton and responsive layout container
└── static/
    ├── index.css              # Custom styling, "fading future" UI, and animations
    └── index.js               # Central state machine, API clients, timeline loops, and local logic
```

---

## 2. API & Service Interface Specification

The frontend communicates with the Flask backend via REST endpoints:

### Endpoint 1: Generate Initial Steps
*   **Path**: `POST /api/generate-steps`
*   **Content-Type**: `application/json`
*   **Request Schema**:
    ```json
    {
      "goal": "Build a mobile app"
    }
    ```
*   **Response Schema (Success - `200 OK`)**:
    ```json
    {
      "status": "success",
      "steps": [
        { "id": "uuid-1", "title": "Create a new folder on your desktop called 'App Project'.", "level": 1, "completed": false },
        { "id": "uuid-2", "title": "Open a text editor and create a file named 'ideas.txt'.", "level": 1, "completed": false },
        { "id": "uuid-3", "title": "Write down 3 core features of your app.", "level": 2, "completed": false }
      ]
    }
    ```

### Endpoint 2: Refine / Break Down Further
*   **Path**: `POST /api/refine-step`
*   **Content-Type**: `application/json`
*   **Request Schema**:
    ```json
    {
      "step_id": "uuid-3",
      "step_title": "Write down 3 core features of your app."
    }
    ```
*   **Response Schema (Success - `200 OK`)**:
    ```json
    {
      "status": "success",
      "sub_steps": [
        { "id": "uuid-4", "title": "Think of the main problem your app solves.", "level": 3, "completed": false },
        { "id": "uuid-5", "title": "Identify your target user.", "level": 3, "completed": false }
      ]
    }
    ```

### Endpoint 3: Assistant Chat
*   **Path**: `POST /api/assistant-chat`
*   **Content-Type**: `application/json`
*   **Request Schema**:
    ```json
    {
      "step_title": "Write down 3 core features of your app.",
      "message": "I don't know where to start."
    }
    ```
*   **Response Schema (Success - `200 OK`)**:
    ```json
    {
      "status": "success",
      "reply": "No problem! Let's start with this: What is the main thing you want your app to do?"
    }
    ```

---

## 3. Backend Implementation & Database

The backend manages goals and users (if any) while proxying to the Gemini API securely.

### A. Database (SQLite via SQLAlchemy)
To keep the setup lightweight and compliant, we will use SQLite for initial data persistence (like streaks, but core functionality can run stateless using `localStorage` for guest mode as defined in the Risk Audit).

*   **Models**:
    *   `User`: id, created_at, current_streak
    *   `Goal`: id, user_id, title, created_at
    *   `Step`: id, goal_id, title, level, completed, order_index

### B. Gemini API Integration
The backend uses `google-generativeai` to construct prompts that break down goals. The prompts must explicitly enforce breaking tasks into *ultra-small, micro-actions* (e.g., "Open a browser tab" instead of "Research competitors").

---

## 4. Frontend State Machine & Caching

The frontend is a vanilla JS SPA.

### A. State Interface (Global App State Object)
```javascript
const AppState = {
  // App State State Machine
  appState: 'INPUT_GOAL', // INPUT_GOAL, GENERATING_STEPS, TIMELINE_ACTIVE, ASSISTANT_ACTIVE

  currentGoal: null,
  currentStreak: 0,

  // Timeline Data
  timelineSteps: [], // Array of { id, title, completed, level }
  currentActiveStepIndex: 0,
};
```

### B. View Rendering (DOM Toggling)
*   `#screen-input`: The goal entry field.
*   `#screen-loading`: Generating state.
*   `#screen-timeline`: The fading vertical timeline.
*   `#modal-assistant`: The AI assistant overlay.

### C. Styling (Fading Future UI)
Upcoming steps will use CSS classes mapped to their index relative to `currentActiveStepIndex`:
```css
.step-future-1 { opacity: 0.7; transform: scale(0.95); filter: blur(1px); }
.step-future-2 { opacity: 0.4; transform: scale(0.90); filter: blur(2px); }
.step-future-3 { opacity: 0.1; transform: scale(0.85); filter: blur(4px); }
```

---

## 5. Dockerization Specification

The production image will compile dependencies and run Flask:

```dockerfile
# Stage 1: Build dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final Image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
ENV FLASK_ENV=production

# Ensure data persistence volume
VOLUME /app/data

EXPOSE 8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
```

---

## 6. Security & Rate Limiting
*   Apply basic rate limiting (e.g., using `Flask-Limiter`) on the `/api/*` endpoints to prevent API abuse.
*   Implement strict validation on input fields to prevent injection.