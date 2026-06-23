# Technical Architecture Design: LingoQuest (Anki Story Adventure)

This Technical Design Document (TDD) details the implementation structure, interfaces, schemas, and configurations for LingoQuest. It establishes a robust separation of concerns between a Dockerized Flask backend and a modern clientside Single-Page Application (SPA) frontend.

---

## 1. Project Directory & File Layout

All development will take place in the `language_tool/` directory:

```text
language_tool/
├── app.py                     # Flask API server, deck parsing, and Gemini integration
├── requirements.txt           # Python application dependencies
├── Dockerfile                 # Multi-stage production container build
├── .env                       # Local environment configurations (API keys)
├── templates/
│   └── index.html             # HTML5 skeleton and responsive layout container
└── static/
    ├── index.css              # Custom styling, variable overrides, and glassmorphic aesthetics
    └── index.js               # Central state machine, API clients, game loops, and localStorage
```

---

## 2. API & Service Interface Specification

The frontend communicates with the Flask backend via two main JSON REST endpoints:

### Endpoint 1: Upload Anki Deck
*   **Path**: `POST /api/upload`
*   **Content-Type**: `multipart/form-data`
*   **Request Params**:
    *   `file`: Binary file upload (must end with `.apkg`).
*   **Response Schema (Success - `200 OK`)**:
    ```json
    {
      "status": "success",
      "vocabulary": [
        { "id": "card_id_1", "front": "sombrío", "back": "gloomy / dark" },
        { "id": "card_id_2", "front": "el ferrocarril", "back": "the railway" }
      ]
    }
    ```
*   **Response Schema (Error - `400 Bad Request` or `500 Internal Error`)**:
    ```json
    {
      "status": "error",
      "message": "Detailed error description here"
    }
    ```

### Endpoint 2: Generate Story & Challenges
*   **Path**: `POST /api/generate-story`
*   **Content-Type**: `application/json`
*   **Request Schema**:
    ```json
    {
      "genre": "Noir Mystery",
      "difficulty": "Apprentice",
      "vocabulary": [
        { "id": "sp1", "front": "el ferrocarril", "back": "the railway" },
        { "id": "sp2", "front": "susurrar", "back": "to whisper" }
      ]
    }
    ```
*   **Response Schema (Success - `200 OK`)**:
    ```json
    {
      "status": "success",
      "paragraphs": [
        "La noche era fría. Caminaba cerca del viejo <vocab id=\"sp1\">ferrocarril</vocab> abandonado.",
        "De repente, escuché a alguien <vocab id=\"sp2\">susurrar</vocab> mi nombre."
      ],
      "questions": [
        {
          "question": "¿Dónde caminaba el protagonista?",
          "options": [
            "En una playa soleada",
            "Cerca del ferrocarril abandonado",
            "En una biblioteca",
            "En la azotea de un hotel"
          ],
          "answer": "Cerca del ferrocarril abandonado",
          "explanation": "El protagonista menciona explícitamente caminar cerca del viejo ferrocarril abandonado."
        }
      ]
    }
    ```
*   **Response Schema (Error - `500 Internal Error` or `502 Bad Gateway`)**:
    ```json
    {
      "status": "error",
      "message": "Gemini API failed to generate story"
    }
    ```

---

## 3. Backend Implementation & SQLite Parsing

The Flask backend handles uploaded files securely by extracting, decompressing, and querying SQLite databases.

### A. Anki Package Extraction Flow
1.  Verify the uploaded file has an `.apkg` extension.
2.  Decompress the `.apkg` file (which is a standard ZIP) to a temporary folder.
3.  Check for the existence of `collection.anki21b`. If present, decompress it using Python's `zstandard` library to output `collection.anki21`.
4.  Prioritize connection to `collection.anki21` (modern SQL database). Fall back to `collection.anki2` (older database).
5.  If neither database is present, raise a validation error.

### B. Database Querying Logic
Connect to the database via Python's built-in `sqlite3` package and extract cards.

```python
# Query to extract "learning" or "young" cards (interval < 21 days)
QUERY_LEARNING_CARDS = """
SELECT n.id, n.flds
FROM cards c
JOIN notes n ON c.nid = n.id
WHERE c.type IN (1, 2) AND c.ivl < 21
ORDER BY RANDOM()
LIMIT 12
"""

# Fallback query if no learning cards are available (selects any random active cards)
QUERY_ALL_CARDS = """
SELECT n.id, n.flds
FROM cards c
JOIN notes n ON c.nid = n.id
ORDER BY RANDOM()
LIMIT 12
"""
```

*   **Field Parsing**: The card details in the `notes.flds` column are separated by the Unicode Unit Separator (`\x1f`). The backend splits the string by this character. The first element acts as the `front` of the card, and the second element acts as the `back`.
*   **Safety & Clean-up**: All extracted directories and temporary zip assets must be deleted in a `finally` block to prevent disk space exhaustion.

---

## 4. Gemini API Structured JSON Generation

To ensure reliable structure, the backend calls the Gemini API (`gemini-2.5-flash` or `gemini-1.5-flash`) using Structured Outputs (`responseMimeType: "application/json"`).

### A. Prompt Configuration
The request prompt includes instructions for story parameters, difficulty scales, and embedding constraints:

```text
You are an expert language teacher and writer. Write an engaging story in the target language (e.g. Spanish, Japanese, etc.) matching the genre: {genre} and difficulty: {difficulty}.

The story must incorporate the following vocabulary items:
{vocabulary_list_as_json}

Strict Formatting Rules:
1. Divide the story into 2 to 4 paragraphs.
2. For each vocabulary word incorporated in the story, wrap it in a custom tag like: <vocab id="card_id">inflected_word_in_story</vocab>. The 'id' attribute must match the exact 'id' from the vocabulary list.
3. Generate 3 multiple-choice comprehension questions in the target language based on the story. Each question must have exactly 4 options, a correct answer that matches one of the options verbatim, and a brief explanation.

Return the result as a JSON object matching the defined schema.
```

### B. Response Schema Constraint (JSON Schema)
The Google Generative Language API payload uses the `generationConfig` block to enforce the output structure:

```json
{
  "responseMimeType": "application/json",
  "responseSchema": {
    "type": "object",
    "properties": {
      "paragraphs": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Story paragraphs. Embed vocabulary using <vocab id=\"card_id\">word</vocab>."
      },
      "questions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "question": { "type": "string" },
            "options": {
              "type": "array",
              "items": { "type": "string" }
            },
            "answer": { "type": "string" },
            "explanation": { "type": "string" }
          },
          "required": ["question", "options", "answer", "explanation"]
        }
      }
    },
    "required": ["paragraphs", "questions"]
  }
}
```

---

## 5. Frontend State Machine & Caching

The frontend is implemented as a lightweight, framework-free reactive Single-Page Application (SPA).

### A. State Interface (Global App State Object)
```javascript
const AppState = {
  // Persistent Player Stats (Sync to localStorage)
  stats: {
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    lastActive: null // YYYY-MM-DD
  },
  
  // App State State Machine
  gameState: 'LANDING', // LANDING, LOADING_STORY, READING_STORY, CHALLENGE_CLOZE, CHALLENGE_COMPREHENSION, CHALLENGE_SPEED_MATCH, VICTORY
  
  // Configuration State
  config: {
    genre: 'Daily Life',
    difficulty: 'Novice'
  },
  
  // Session Vocabulary & Deck Data
  vocabulary: [], // Array of { id, front, back }
  
  // Active Generated Story Details
  story: {
    paragraphs: [], // Array of strings containing <vocab> tags
    questions: []   // Array of { question, options[], answer, explanation, selectedIndex }
  },

  // Speed Match Data
  speedMatch: {
    cards: [], // Scrambled matching cards
    selectedId: null,
    timer: 20, // seconds remaining
    timerInterval: null
  }
};
```

### B. View Rendering (DOM Toggling)
The frontend uses standard IDs to manage view containers. The state machine triggers views by setting `display: none` or adding/removing the `.active` CSS class:

*   `#screen-landing`: Main dashboard and deck setup.
*   `#screen-loading`: Pulsing load screen with learning hints.
*   `#screen-reading`: Focused text container with keyword definitions.
*   `#screen-cloze`: Story text with target slots, drag/drop elements.
*   `#screen-comprehension`: Lore questions card slider.
*   `#screen-speed-match`: Card grid with timer trial.
*   `#screen-victory`: Confetti, rewards, and return action buttons.

### C. Persistent Storage Keys
*   `lingoquest_player_stats`: Caches `{ level, xp, coins, streak, lastActive }`.
*   `lingoquest_stored_vocab`: Caches the last parsed vocabulary list for offline/immediate replay.

---

## 6. Dockerization Specification

The production image will compile dependencies and run Flask securely using `gunicorn`:

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

EXPOSE 8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
```

`requirements.txt` dependencies:
```text
Flask==3.0.2
gunicorn==21.2.0
zstandard==0.22.0
werkzeug==3.0.1
```

---

## 7. Verification & QA Requirements

Prior to handoff, validation tests must ensure:
1.  **Deck upload robustness**: Success with standard `.apkg` files and proper database resource clean-up in the temp folder.
2.  **Schema adherence**: The Gemini structured output matches the schema exactly and fails gracefully if rate limited.
3.  **Visual standards**: Full glassmomorphic responsive display tested down to `375px` width.
4.  **Persistence**: XP, level progress bars, and streak counters increment and persist correctly upon reloading.
