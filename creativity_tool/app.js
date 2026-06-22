// Global DB
let DB = {
  OBLIQUE_STRATEGIES: [],
  PHYSICAL_OBJECTS: [],
  SENSORY_DETAILS: [],
  LOCATIONS: [],
  ACTIONS: [],
  FALLBACK_SPARKS: [],
  STOP_WORDS: new Set()
};

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
    cost: 'under $20',
    customContext: '',
    goal: ''
  },
  savedIdeas: [],
  promptTemplate: ''
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Load Database
  try {
    const dbRes = await fetch('database.json');
    if (dbRes.ok) {
      const dbData = await dbRes.json();
      DB.OBLIQUE_STRATEGIES = dbData.OBLIQUE_STRATEGIES || [];
      DB.PHYSICAL_OBJECTS = dbData.PHYSICAL_OBJECTS || [];
      DB.SENSORY_DETAILS = dbData.SENSORY_DETAILS || [];
      DB.LOCATIONS = dbData.LOCATIONS || [];
      DB.ACTIONS = dbData.ACTIONS || [];
      DB.FALLBACK_SPARKS = dbData.FALLBACK_SPARKS || [];
      DB.STOP_WORDS = new Set(dbData.STOP_WORDS || []);
    }
  } catch (err) {
    console.error("Failed to load database.json", err);
  }

  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Load State from LocalStorage
  loadSettings();
  loadSavedIdeas();
  
  // Load Prompt Template
  await loadPromptTemplate();
  
  // Bind Event Listeners
  bindEvents();
  
  // Initialize Tipping Modal
  initTipping();
  
  // Initial Seeds Generation
  rollAllSeeds();
});

// Helper Function for Random Element Selection
function getRandomItem(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

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

  // Budget input
  document.getElementById('target-cost').addEventListener('input', (e) => {
    state.settings.cost = e.target.value;
    localStorage.setItem('synaptic_cost', state.settings.cost);
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
  state.settings.goal = localStorage.getItem('synaptic_goal') || '';
  document.getElementById('target-goal').value = state.settings.goal;
  state.settings.cost = localStorage.getItem('synaptic_cost') || 'under $20';
  document.getElementById('target-cost').value = state.settings.cost;
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
    if (DB.FALLBACK_SPARKS.length > 0) {
      const fallback = getRandomItem(DB.FALLBACK_SPARKS);
      state.wiki.title = fallback.title;
      state.wiki.extract = fallback.extract;
      state.wiki.link = fallback.link;
      state.wiki.words = extractSparkWords(state.wiki.extract);
    }
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
  const candidateWords = rawWords.filter(w => w.length >= 5 && !DB.STOP_WORDS.has(w));
  
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
  if (DB.OBLIQUE_STRATEGIES.length === 0) return;
  const strategy = getRandomItem(DB.OBLIQUE_STRATEGIES);
  state.oblique = strategy;
  document.getElementById('oblique-text').textContent = `"${strategy}"`;
  updatePrompt();
}

// Physical Spark Roller
function rollPhysicalInteraction() {
  if (DB.PHYSICAL_OBJECTS.length === 0 || DB.ACTIONS.length === 0) return;
  const obj = getRandomItem(DB.PHYSICAL_OBJECTS);
  const act = getRandomItem(DB.ACTIONS);
  
  state.physical.object = obj;
  state.physical.action = act;
  
  document.getElementById('physical-object').textContent = obj;
  document.getElementById('physical-action').textContent = act;
  updatePrompt();
}

// Sensory Context Roller
function rollSensoryContext() {
  if (DB.SENSORY_DETAILS.length === 0 || DB.LOCATIONS.length === 0) return;
  const detail = getRandomItem(DB.SENSORY_DETAILS);
  const location = getRandomItem(DB.LOCATIONS);
  
  state.sensory.detail = detail;
  state.sensory.location = location;
  
  document.getElementById('sensory-detail').textContent = detail;
  document.getElementById('sensory-location').textContent = location;
  updatePrompt();
}

// Synthesize Prompt Text
function updatePrompt() {
  const whimsyMap = { 1: 'Practical & Grounded', 2: 'Unusual & Creative', 3: 'Absurd & High-Whimsy' };

  const styleText = state.settings.style.toUpperCase();
  const whimsyText = whimsyMap[state.settings.whimsy];
  const costText = state.settings.cost || 'under $20';
  
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

// Tipping Jar Module
async function initTipping() {
  const tippingModal = document.getElementById('tipping-modal');
  const openBtn = document.getElementById('btn-open-tipping');
  const closeBtn = document.getElementById('btn-close-tipping-modal');
  
  if (!tippingModal || !openBtn || !closeBtn) return;
  
  // Open Tipping Modal
  openBtn.addEventListener('click', () => {
    tippingModal.classList.remove('hidden');
  });
  
  // Close Tipping Modal
  closeBtn.addEventListener('click', () => {
    tippingModal.classList.add('hidden');
  });
  
  // Close modal when clicking on backdrop
  tippingModal.addEventListener('click', (e) => {
    if (e.target === tippingModal) {
      tippingModal.classList.add('hidden');
    }
  });

  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tipping-tab-btn');
  const panels = document.querySelectorAll('.tipping-panel');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active from all tab buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      // Add active to current button
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      
      // Remove active from all panels
      panels.forEach(p => p.classList.remove('active'));
      // Find target panel and show it
      const targetTab = targetBtn.dataset.tab;
      const targetPanel = document.getElementById(`tip-panel-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Click-to-copy address action
  const copyBtns = document.querySelectorAll('.btn-copy-addr');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const targetId = e.currentTarget.dataset.target;
      const addressText = document.getElementById(targetId).textContent;
      
      try {
        await navigator.clipboard.writeText(addressText);
        
        // Show success animation/label
        const isHarmony = targetId.includes('harmony');
        const successLabelId = isHarmony ? 'harmony-copied-msg' : 'ethereum-copied-msg';
        const label = document.getElementById(successLabelId);
        
        if (label) {
          label.classList.remove('hidden');
          // Update icon to checkmark temporarily
          const copyIcon = e.currentTarget.querySelector('i');
          const originalIcon = copyIcon ? copyIcon.getAttribute('data-lucide') : 'copy';
          
          if (copyIcon) {
            copyIcon.setAttribute('data-lucide', 'check');
            copyIcon.style.color = '#69f0ae';
            lucide.createIcons();
          }
          
          setTimeout(() => {
            label.classList.add('hidden');
            if (copyIcon) {
              copyIcon.setAttribute('data-lucide', originalIcon);
              copyIcon.style.color = '';
              lucide.createIcons();
            }
          }, 2000);
        }
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    });
  });

  // Fetch tipping configuration addresses dynamically
  try {
    const response = await fetch('tipping.json');
    if (response.ok) {
      const config = await response.json();
      
      // Update Buy Me A Coffee link
      if (config.buymeacoffee) {
        const coffeeLink = document.getElementById('btn-coffee-link');
        if (coffeeLink) coffeeLink.href = config.buymeacoffee;
      }
      
      // Update Harmony address
      if (config.harmony) {
        const harmAddress = document.getElementById('harmony-address');
        if (harmAddress) harmAddress.textContent = config.harmony;
      }
      
      // Update Ethereum address
      if (config.ethereum) {
        const ethAddress = document.getElementById('ethereum-address');
        if (ethAddress) ethAddress.textContent = config.ethereum;
      }
    }
  } catch (err) {
    console.error("Failed to load tipping configuration:", err);
    // Use fallback hardcoded values in case of fetch error (safeguard)
    const fallbackHarmony = "0x18f001a1c22dFA6065D5CD6265eE007CDAc97f33";
    const fallbackEthereum = "0x18f001a1c22dFA6065D5CD6265eE007CDAc97f33";
    
    const harmAddress = document.getElementById('harmony-address');
    if (harmAddress) harmAddress.textContent = fallbackHarmony;
    
    const ethAddress = document.getElementById('ethereum-address');
    if (ethAddress) ethAddress.textContent = fallbackEthereum;
  }
}
