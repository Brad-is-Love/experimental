import {
  OBLIQUE_STRATEGIES,
  PHYSICAL_OBJECTS,
  SENSORY_DETAILS,
  LOCATIONS,
  ACTIONS
} from './database.js';

// Fallback sparks if offline or API fails
const FALLBACK_SPARKS = [
  {
    title: "Svalbard Global Seed Vault",
    extract: "A secure backup facility for the world's crop diversity on the Norwegian island of Spitsbergen in the remote Arctic Svalbard archipelago. It is designed to withstand natural and human disasters.",
    link: "https://en.wikipedia.org/wiki/Svalbard_Global_Seed_Vault"
  },
  {
    title: "Voyager 1",
    extract: "A space probe launched by NASA in 1977 to study the outer Solar System and interstellar space. It is the most distant artificial object from Earth, continuing to transmit scientific data.",
    link: "https://en.wikipedia.org/wiki/Voyager_1"
  },
  {
    title: "Antikythera mechanism",
    extract: "An ancient Greek hand-powered orrery, described as the oldest example of an analogue computer, used to predict astronomical positions and eclipses decades in advance.",
    link: "https://en.wikipedia.org/wiki/Antikythera_mechanism"
  },
  {
    title: "Tulip mania",
    extract: "A period during the Dutch Golden Age when contract prices for some bulbs of the recently introduced and fashionable tulip reached extraordinarily high levels, and then dramatically collapsed.",
    link: "https://en.wikipedia.org/wiki/Tulip_mania"
  },
  {
    title: "Kintsugi",
    extract: "The Japanese art of repairing broken pottery by mending the areas of breakage with lacquer dusted or mixed with powdered gold, silver, or platinum. It treats breakage as part of the object's history.",
    link: "https://en.wikipedia.org/wiki/Kintsugi"
  }
];

// App State
const state = {
  wiki: {
    title: '',
    extract: '',
    link: '',
    words: []
  },
  oblique: '',
  physical: {
    object: '',
    action: ''
  },
  sensory: {
    detail: '',
    location: ''
  },
  settings: {
    apiKey: '',
    model: 'gemini-2.5-flash',
    temp: 1.0,
    style: 'physical',
    whimsy: 3,
    cost: 'under20',
    customContext: '',
    goal: 'make money, starting at $2, in ethical ways that are net positive for humanity'
  },
  savedIdeas: [],
  promptTemplate: ''
};

// Common English stop words to filter out when extracting Wikipedia spark words
const STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot',
  'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed',
  'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i',
  'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more',
  'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes',
  'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well',
  'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who',
  'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
  'your', 'yours', 'yourself', 'yourselves', 'species', 'family', 'known', 'first', 'called', 'found', 'often'
]);

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Load State from LocalStorage
  loadSettings();
  loadSavedIdeas();
  
  // Load Prompt Template
  await loadPromptTemplate();
  
  // Bind Event Listeners
  bindEvents();
  
  // Initial Seeds Generation
  rollAllSeeds();
});

// Event Binding
function bindEvents() {
  // Sidebar/Settings toggles
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');
      state.settings.style = activeBtn.dataset.style;
      updatePrompt();
    });
  });

  // Whimsy slider
  const whimsySlider = document.getElementById('whimsy-slider');
  const whimsyValText = document.getElementById('whimsy-val');
  const whimsyDescriptions = { '1': 'Practical', '2': 'Unusual', '3': 'Absurd' };
  
  whimsySlider.addEventListener('input', (e) => {
    const val = e.target.value;
    state.settings.whimsy = parseInt(val);
    whimsyValText.textContent = whimsyDescriptions[val];
    updatePrompt();
  });

  // Cost dropdown
  document.getElementById('target-cost').addEventListener('change', (e) => {
    state.settings.cost = e.target.value;
    updatePrompt();
  });

  // Custom Context
  document.getElementById('custom-context').addEventListener('input', (e) => {
    state.settings.customContext = e.target.value;
    updatePrompt();
  });

  // Target Goal
  document.getElementById('target-goal').addEventListener('input', (e) => {
    state.settings.goal = e.target.value;
    localStorage.setItem('synaptic_goal', state.settings.goal);
    updatePrompt();
  });

  // Reroll Buttons
  document.getElementById('btn-roll-all').addEventListener('click', rollAllSeeds);
  
  document.querySelectorAll('.btn-reroll-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.reroll;
      const icon = e.currentTarget.querySelector('i');
      if (icon) {
        icon.classList.add('spinning');
        setTimeout(() => icon.classList.remove('spinning'), 600);
      }
      rollSingleSeed(target);
    });
  });

  // Copy Prompt
  document.getElementById('btn-copy-prompt').addEventListener('click', copyPromptToClipboard);

  // Generate Ideas
  document.getElementById('btn-generate').addEventListener('click', generateIdeas);

  // Clear Results
  document.getElementById('btn-clear-results').addEventListener('click', () => {
    document.getElementById('results-panel').classList.add('hidden');
    document.getElementById('ideas-output').innerHTML = '';
  });

  // Save Current Output
  document.getElementById('btn-save-current').addEventListener('click', saveCurrentIdeaOutput);

  // Settings Modal controls
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    document.getElementById('gemini-api-key').value = state.settings.apiKey;
    document.getElementById('gemini-model').value = state.settings.model;
    document.getElementById('creative-temp').value = state.settings.temp;
    document.getElementById('temp-val').textContent = state.settings.temp;
    settingsModal.classList.remove('hidden');
  });

  document.getElementById('btn-close-settings-modal').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  document.getElementById('creative-temp').addEventListener('input', (e) => {
    document.getElementById('temp-val').textContent = e.target.value;
  });

  document.getElementById('btn-save-settings').addEventListener('click', () => {
    state.settings.apiKey = document.getElementById('gemini-api-key').value.trim();
    state.settings.model = document.getElementById('gemini-model').value;
    state.settings.temp = parseFloat(document.getElementById('creative-temp').value);
    
    // Save to localStorage
    localStorage.setItem('synaptic_api_key', state.settings.apiKey);
    localStorage.setItem('synaptic_model', state.settings.model);
    localStorage.setItem('synaptic_temp', state.settings.temp);
    
    settingsModal.classList.add('hidden');
  });

  // Saved Ideas sidebar toggling
  const savedSidebar = document.getElementById('saved-ideas-panel');
  document.getElementById('btn-toggle-saved').addEventListener('click', () => {
    savedSidebar.classList.remove('hidden');
  });

  document.getElementById('btn-close-saved').addEventListener('click', () => {
    savedSidebar.classList.add('hidden');
  });
}

// Settings & LocalStorage Loader
function loadSettings() {
  state.settings.apiKey = localStorage.getItem('synaptic_api_key') || '';
  state.settings.model = localStorage.getItem('synaptic_model') || 'gemini-2.5-flash';
  state.settings.temp = parseFloat(localStorage.getItem('synaptic_temp')) || 1.0;
  state.settings.goal = localStorage.getItem('synaptic_goal') || 'make money, starting at $2, in ethical ways that are net positive for humanity';
  document.getElementById('target-goal').value = state.settings.goal;
}

// Load Prompt Template
async function loadPromptTemplate() {
  try {
    const response = await fetch('prompt_template.txt');
    if (!response.ok) {
      throw new Error(`Failed to load prompt template: ${response.status}`);
    }
    state.promptTemplate = await response.text();
  } catch (err) {
    console.error("Failed to fetch prompt template, using local fallback", err);
    state.promptTemplate = `You are a Lateral Thinking Creativity Agent. Your task is to generate 3 highly detailed, non-obvious, creative business or project ideas designed to achieve this goal: "{{GOAL}}".

To inject lateral elements into your thinking, your ideas must be seeded by these random variables, although the use can be metaphorical:

- Wikipedia Seed Spark: "{{WIKI_TITLE}}"
  Context: "{{WIKI_EXTRACT}}"
- Spark Words: {{SPARK_WORDS}}
- Oblique Strategy Card: "{{STRATEGY}}"
- Physical Inspiration Sparks:
  - Object: "{{OBJECT}}"
  - Action: "{{ACTION}}"
- Sensory & Location Context:
  - Ambient Sensory Detail: "{{SENSORY_DETAIL}}"
  - Location: "{{LOCATION}}"
- Financial Limit: Budget must be {{COST}}.
- Core Theme/Style: Must focus on a {{STYLE}} delivery.
- Creativity Level: {{WHIMSY}}.
{{CUSTOM_BLOCK}}
Instructions & Rules for Idea Generation:
1. Ideas must be inspired by the random seeds to make them unique and non-obvious, but the incorporation can be purely metaphorical.
2. Directly incorporate the Wikipedia Seed as a metaphor, thematic anchor, or visual style.
3. Make sure the Oblique Strategy heuristic dictates the design ethos or operational flow.
4. The concepts should feel creative and engaging, linking the random seeds into a cohesive value proposition.
5. The ideas must realistically be achievable within the chosen budget.
6. The 3 ideas must be significantly different from one another 

Format the 3 ideas using the following structure:

### Idea 1: [Catchy, Creative Name]
- **The Concept**: [Detailed explanation of the product/service, how it works, and how it achieves the stated goal]

### Idea 2: Same format as idea 1, but use the inverse of the seed elements

### Idea 3: should begin with 'Just forget all that stuff and [the absolute simplest way you can think of to solve the problem, think replacing a remote with a long stick.]'`;
  }
}

// Seed Rollers
async function rollAllSeeds() {
  const rollPromises = [
    rollSingleSeed('wiki'),
    rollSingleSeed('oblique'),
    rollSingleSeed('physical'),
    rollSingleSeed('sensory')
  ];
  await Promise.all(rollPromises);
  updatePrompt();
}

async function rollSingleSeed(type) {
  switch(type) {
    case 'wiki':
      await fetchWikipediaSpark();
      break;
    case 'oblique':
      rollObliqueStrategy();
      break;
    case 'physical':
      rollPhysicalInteraction();
      break;
    case 'sensory':
      rollSensoryContext();
      break;
  }
}

// Spark Fetcher from Wikipedia
async function fetchWikipediaSpark() {
  const spinner = document.getElementById('wiki-loading');
  const content = document.getElementById('wiki-content');
  
  if (spinner) spinner.classList.remove('hidden');
  if (content) content.classList.add('hidden');
  
  try {
    // 1. Fetch random title (requires origin=* to avoid CORS locally)
    const randomUrl = 'https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&list=random&rnnamespace=0&rnlimit=1';
    const randomResponse = await fetch(randomUrl);
    const randomData = await randomResponse.json();
    
    if (!randomData.query || !randomData.query.random || randomData.query.random.length === 0) {
      throw new Error("Invalid Wiki API response");
    }
    
    const title = randomData.query.random[0].title;
    
    // 2. Fetch REST API summary for the title
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) {
      throw new Error("Failed to fetch wiki summary");
    }
    
    const summaryData = await summaryResponse.json();
    
    state.wiki.title = summaryData.title;
    state.wiki.extract = summaryData.extract || 'No summary available.';
    state.wiki.link = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    state.wiki.words = extractSparkWords(state.wiki.extract);
  } catch (err) {
    console.error("Wikipedia fetch failed, using fallback.", err);
    // Grab a random fallback
    const fallback = FALLBACK_SPARKS[Math.floor(Math.random() * FALLBACK_SPARKS.length)];
    state.wiki.title = fallback.title;
    state.wiki.extract = fallback.extract;
    state.wiki.link = fallback.link;
    state.wiki.words = extractSparkWords(state.wiki.extract);
  } finally {
    // Render
    document.getElementById('wiki-title').textContent = state.wiki.title;
    document.getElementById('wiki-extract').textContent = state.wiki.extract;
    document.getElementById('wiki-link').href = state.wiki.link;
    
    const wordsContainer = document.getElementById('wiki-words');
    wordsContainer.innerHTML = '';
    state.wiki.words.forEach(w => {
      const pill = document.createElement('span');
      pill.className = 'word-pill';
      pill.textContent = w;
      wordsContainer.appendChild(pill);
    });
    
    if (spinner) spinner.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    updatePrompt();
  }
}

// Word Extractor
function extractSparkWords(text) {
  if (!text) return [];
  // Tokenize, remove punctuation, downcase
  const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ");
  const rawWords = cleanText.split(/\s+/);
  
  // Filter out stop words, empty spaces, and words under 5 letters (to get meatier words)
  const candidateWords = rawWords.filter(w => w.length >= 5 && !STOP_WORDS.has(w));
  
  // Get unique candidates
  const uniqueCandidates = Array.from(new Set(candidateWords));
  
  if (uniqueCandidates.length === 0) {
    return ['spark', 'idea', 'create'];
  }
  
  // Pick up to 3 random words
  const selected = [];
  const count = Math.min(3, uniqueCandidates.length);
  const pool = [...uniqueCandidates];
  
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  
  return selected;
}

// Oblique Heuristic Roller
function rollObliqueStrategy() {
  const strategy = OBLIQUE_STRATEGIES[Math.floor(Math.random() * OBLIQUE_STRATEGIES.length)];
  state.oblique = strategy;
  document.getElementById('oblique-text').textContent = `"${strategy}"`;
  updatePrompt();
}

// Physical Spark Roller
function rollPhysicalInteraction() {
  const obj = PHYSICAL_OBJECTS[Math.floor(Math.random() * PHYSICAL_OBJECTS.length)];
  const act = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  
  state.physical.object = obj;
  state.physical.action = act;
  
  document.getElementById('physical-object').textContent = obj;
  document.getElementById('physical-action').textContent = act;
  updatePrompt();
}

// Sensory Context Roller
function rollSensoryContext() {
  const detail = SENSORY_DETAILS[Math.floor(Math.random() * SENSORY_DETAILS.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  
  state.sensory.detail = detail;
  state.sensory.location = location;
  
  document.getElementById('sensory-detail').textContent = detail;
  document.getElementById('sensory-location').textContent = location;
  updatePrompt();
}

// Synthesize Prompt Text
function updatePrompt() {
  const whimsyMap = { 1: 'Practical & Grounded', 2: 'Unusual & Creative', 3: 'Absurd & High-Whimsy' };
  const costMap = {
    'under2': 'under $2 (almost completely free, using trash/found objects/digital resources)',
    'under20': 'under $20 (low-cost, minimal physical materials)',
    'under100': 'under $100 (some budget for components/ads/hosting)',
    'any': 'flexible/infinite'
  };

  const styleText = state.settings.style.toUpperCase();
  const whimsyText = whimsyMap[state.settings.whimsy];
  const costText = costMap[state.settings.cost];
  
  let customContextBlock = '';
  if (state.settings.customContext.trim()) {
    customContextBlock = `- Additional Human Context/Environment: "${state.settings.customContext.trim()}"\n`;
  }

  if (!state.promptTemplate) {
    document.getElementById('prompt-output').textContent = 'Loading prompt template...';
    return;
  }

  let prompt = state.promptTemplate;
  prompt = prompt.replace("{{GOAL}}", state.settings.goal);
  prompt = prompt.replace("{{WIKI_TITLE}}", state.wiki.title);
  prompt = prompt.replace("{{WIKI_EXTRACT}}", state.wiki.extract);
  prompt = prompt.replace("{{SPARK_WORDS}}", state.wiki.words.join(', '));
  prompt = prompt.replace("{{STRATEGY}}", state.oblique);
  prompt = prompt.replace("{{OBJECT}}", state.physical.object);
  prompt = prompt.replace("{{ACTION}}", state.physical.action);
  prompt = prompt.replace("{{SENSORY_DETAIL}}", state.sensory.detail);
  prompt = prompt.replace("{{LOCATION}}", state.sensory.location);
  prompt = prompt.replace("{{COST}}", costText);
  prompt = prompt.replace("{{STYLE}}", styleText);
  prompt = prompt.replace("{{WHIMSY}}", whimsyText);
  prompt = prompt.replace("{{CUSTOM_BLOCK}}", customContextBlock);

  document.getElementById('prompt-output').textContent = prompt;
}

// Clipboard copier
function copyPromptToClipboard() {
  const promptText = document.getElementById('prompt-output').textContent;
  navigator.clipboard.writeText(promptText)
    .then(() => {
      const copyBtn = document.getElementById('btn-copy-prompt');
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i data-lucide="check"></i> Copied!';
      lucide.createIcons();
      setTimeout(() => {
        copyBtn.innerHTML = origText;
        lucide.createIcons();
      }, 1500);
    })
    .catch(err => {
      console.error("Clipboard copy failed", err);
    });
}

// Direct Call to Gemini API (Client-side)
async function generateIdeas() {
  const key = state.settings.apiKey;
  if (!key) {
    alert("Please enter a Gemini API Key in the Settings panel (top right) to generate ideas directly inside this app. Alternatively, you can copy the prompt below and paste it into any LLM client.");
    // Auto open settings modal
    document.getElementById('btn-open-settings').click();
    return;
  }

  const promptText = document.getElementById('prompt-output').textContent;
  const resultsPanel = document.getElementById('results-panel');
  const spinner = document.getElementById('ideas-loading');
  const output = document.getElementById('ideas-output');

  resultsPanel.classList.remove('hidden');
  spinner.classList.remove('hidden');
  output.innerHTML = '';
  
  // Scroll to results panel smoothly
  resultsPanel.scrollIntoView({ behavior: 'smooth' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.settings.model}:generateContent?key=${key}`;
    const payload = {
      contents: [{
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        temperature: state.settings.temp
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No response text returned from Gemini API.");
    }

    spinner.classList.add('hidden');
    output.innerHTML = parseMarkdown(resultText);
    
  } catch (err) {
    console.error("Gemini API generation failed", err);
    spinner.classList.add('hidden');
    output.innerHTML = `
      <div style="color: var(--accent-danger); padding: 1rem; border: 1px solid rgba(244,67,54,0.3); border-radius: 8px; background: rgba(244,67,54,0.05);">
        <h3><i data-lucide="alert-triangle"></i> Generation Failed</h3>
        <p>${err.message}</p>
        <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-dark);">Double check your API key and network connection. Make sure the model selected is active in your API key's region.</p>
      </div>
    `;
    lucide.createIcons();
  }
}

// Custom Markdown to HTML Parser
function parseMarkdown(text) {
  // Escape HTML to prevent injection
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers (Order is important)
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Blockquotes
  html = html.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Items in lists
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>');
  
  // Wrap list items
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

  // Paragraph processing: split by double newlines
  const blocks = html.split(/\n\n+/);
  const parsedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<block') || trimmed.startsWith('<ul') || trimmed.startsWith('<li>')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  
  return parsedBlocks.join('\n');
}

// LocalStorage Saved Ideas Manager
function saveCurrentIdeaOutput() {
  const content = document.getElementById('ideas-output').innerHTML;
  if (!content || content.trim() === '' || content.includes('Generation Failed')) {
    alert("There are no generated ideas to save yet.");
    return;
  }

  const newIdea = {
    id: 'idea_' + Date.now(),
    date: new Date().toLocaleString(),
    promptSummary: `${state.wiki.title} // ${state.oblique.substring(0, 30)}...`,
    contentHtml: content
  };

  state.savedIdeas.unshift(newIdea);
  localStorage.setItem('synaptic_saved_creations', JSON.stringify(state.savedIdeas));
  
  renderSavedIdeas();
  alert("Creations successfully saved to your bookmarks!");
}

function loadSavedIdeas() {
  const saved = localStorage.getItem('synaptic_saved_creations');
  if (saved) {
    try {
      state.savedIdeas = JSON.parse(saved);
    } catch(e) {
      state.savedIdeas = [];
    }
  }
  renderSavedIdeas();
}

function renderSavedIdeas() {
  const badge = document.getElementById('saved-badge');
  const emptyState = document.getElementById('saved-list-empty');
  const listContainer = document.getElementById('saved-ideas-list');
  
  // Update badge
  if (state.savedIdeas.length > 0) {
    badge.textContent = state.savedIdeas.length;
    badge.classList.remove('hidden');
    emptyState.classList.add('hidden');
  } else {
    badge.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }

  listContainer.innerHTML = '';
  
  state.savedIdeas.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'saved-item';
    card.innerHTML = `
      <div class="saved-item-header">
        <span class="saved-item-date">${idea.date}</span>
        <button class="btn-delete-saved" data-id="${idea.id}" title="Delete this saved copy">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <div class="saved-item-title" style="font-weight:700; font-size:0.9rem; color:var(--accent-blue); margin-bottom:0.5rem;">
        ${idea.promptSummary}
      </div>
      <div class="saved-item-body">
        ${idea.contentHtml}
      </div>
    `;
    
    // Bind delete event
    card.querySelector('.btn-delete-saved').addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      deleteSavedIdea(id);
    });

    listContainer.appendChild(card);
  });
  
  lucide.createIcons();
}

function deleteSavedIdea(id) {
  state.savedIdeas = state.savedIdeas.filter(idea => idea.id !== id);
  localStorage.setItem('synaptic_saved_creations', JSON.stringify(state.savedIdeas));
  renderSavedIdeas();
}
