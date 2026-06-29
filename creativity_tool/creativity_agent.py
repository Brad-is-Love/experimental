#!/usr/bin/env python3
import os
import sys
import json
import random
import urllib.request
import urllib.parse
import argparse

# Database Lists Loading
def load_database():
    for path in ['database.json', 'creativity_tool/database.json', '../creativity_tool/database.json']:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                data['STOP_WORDS'] = set(data['STOP_WORDS'])
                return data
    raise FileNotFoundError("Could not find database.json")

_db = load_database()
OBLIQUE_STRATEGIES = _db['OBLIQUE_STRATEGIES']
PHYSICAL_OBJECTS = _db['PHYSICAL_OBJECTS']
SENSORY_DETAILS = _db['SENSORY_DETAILS']
LOCATIONS = _db['LOCATIONS']
ACTIONS = _db['ACTIONS']
FALLBACK_SPARKS = _db['FALLBACK_SPARKS']
STOP_WORDS = _db['STOP_WORDS']

# Terminal Colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def _fetch_json(url):
    """Helper function to fetch and parse JSON from a given URL."""
    req = urllib.request.Request(url, headers={'User-Agent': 'SynapticSparks/1.0 (creativity tool)'})
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode('utf-8'))

def fetch_wikipedia_spark():
    """Fetches a random Wikipedia article title and its REST summary, returning a dictionary."""
    try:
        # 1. Fetch a random page title
        random_url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1'
        data = _fetch_json(random_url)
        
        title = data['query']['random'][0]['title']
        
        # 2. Fetch the summary for that page
        safe_title = urllib.parse.quote(title.replace(' ', '_'))
        summary_url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{safe_title}'
        summary_data = _fetch_json(summary_url)
            
        return {
            'title': summary_data.get('title', title),
            'extract': summary_data.get('extract', 'No summary available.')
        }
    except Exception as e:
        # Fallback to predefined lists if network error or exception
        return random.choice(FALLBACK_SPARKS)

def extract_spark_words(extract):
    """Parses text to extract 3 random, distinct words that are not stop words and are >= 5 chars."""
    if not extract:
        return ["spark", "ideas", "create"]
        
    # Standardize string
    clean_text = "".join(c.lower() if c.isalnum() or c.isspace() else " " for c in extract)
    raw_words = clean_text.split()
    
    candidates = [w for w in raw_words if len(w) >= 5 and w not in STOP_WORDS]
    unique_candidates = list(set(candidates))
    
    if not unique_candidates:
        return ["spark", "ideas", "create"]
        
    count = min(3, len(unique_candidates))
    return random.sample(unique_candidates, count)

def call_gemini(api_key, model, prompt, temp):
    """Sends prompt request to Google Gemini API using urllib."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": temp
        }
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            resp_data = json.loads(response.read().decode('utf-8'))
            
        return resp_data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"\n{Colors.RED}Gemini API Call Failed: {e}{Colors.END}")
        return None

def load_dotenv():
    """Loads environment variables from .env file if it exists, without external dependencies."""
    for path in ['.env', '../.env', 'creativity_tool/.env']:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            v = v.strip('\'"')
                            os.environ[k.strip()] = v.strip()
            except Exception:
                pass

def load_prompt_template():
    """Loads prompt template from prompt_template.txt if it exists, otherwise falls back to hardcoded template."""
    for path in ['prompt_template.txt', 'creativity_tool/prompt_template.txt', '../creativity_tool/prompt_template.txt']:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception:
                pass
    return """You are a Lateral Thinking Creativity Agent. Your task is to generate 3 highly detailed, non-obvious, creative business or project ideas designed to achieve this goal: "{{GOAL}}".

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

### Idea 3: should begin with 'Just forget all that stuff and [the absolute simplest way you can think of to solve the problem, think replacing a remote with a long stick.]'"""

def main():
    parser = argparse.ArgumentParser(description="Synaptic Sparks CLI // AI Lateral Creativity Engine")
    parser.add_argument("--style", choices=["physical", "digital", "hybrid"], default="physical", help="Creative delivery focus")
    parser.add_argument("--whimsy", choices=["practical", "unusual", "absurd"], default="absurd", help="Whimsy/Outrageousness level")
    parser.add_argument("--cost", choices=["under2", "under20", "under100", "any"], default="under20", help="Target validation budget limit")
    parser.add_argument("--context", default="", help="Additional human surroundings context")
    parser.add_argument("--api-key", default=None, help="Gemini API Key (overrides GEMINI_API_KEY environment variable)")
    parser.add_argument("--model", default="gemini-2.5-flash", help="Gemini model to use")
    parser.add_argument("--temp", type=float, default=1.0, help="Generation temperature (randomness)")
    parser.add_argument("--prompt-only", action="store_true", help="Print the generated prompt and exit (no API call)")
    parser.add_argument("--goal", default="", help="Creative goal to achieve")
    
    args = parser.parse_args()
    
    # 1. Fetch / Generate seeds
    print(f"{Colors.BLUE}Rolling creative variables...{Colors.END}")
    wiki = fetch_wikipedia_spark()
    words = extract_spark_words(wiki['extract'])
    strategy = random.choice(OBLIQUE_STRATEGIES)
    obj = random.choice(PHYSICAL_OBJECTS)
    act = random.choice(ACTIONS)
    detail = random.choice(SENSORY_DETAILS)
    loc = random.choice(LOCATIONS)
    
    # Cost descriptions mapping
    cost_map = {
        'under2': 'under $2 (almost completely free, using trash/found objects/digital resources)',
        'under20': 'under $20 (low-cost, minimal physical materials)',
        'under100': 'under $100 (some budget for components/ads/hosting)',
        'any': 'flexible/infinite'
    }
    whimsy_map = {
        'practical': 'Practical & Grounded',
        'unusual': 'Unusual & Creative',
        'absurd': 'Absurd & High-Whimsy'
    }
    
    # Print variables
    print(f"\n{Colors.BOLD}--- CREATIVE SEEDS ---{Colors.END}")
    print(f"{Colors.GREEN}Wikipedia Seed:{Colors.END} {wiki['title']}")
    print(f"{Colors.GREEN}Word Sparks:{Colors.END} {', '.join(words)}")
    print(f"{Colors.GREEN}Oblique Heuristic:{Colors.END} \"{strategy}\"")
    print(f"{Colors.GREEN}Physical Seed:{Colors.END} Use \"{obj}\" + Action: \"{act}\"")
    print(f"{Colors.GREEN}Sensory/Context:{Colors.END} Sense: \"{detail}\" @ Location: \"{loc}\"")
    print(f"----------------------\n")
    
    # Build Prompt
    custom_block = ""
    if args.context.strip():
        custom_block = f"- Additional Human Context/Environment: \"{args.context.strip()}\"\n"
        
    template = load_prompt_template()
    prompt = template
    prompt = prompt.replace("{{GOAL}}", args.goal)
    prompt = prompt.replace("{{WIKI_TITLE}}", wiki['title'])
    prompt = prompt.replace("{{WIKI_EXTRACT}}", wiki['extract'])
    prompt = prompt.replace("{{SPARK_WORDS}}", ', '.join(words))
    prompt = prompt.replace("{{STRATEGY}}", strategy)
    prompt = prompt.replace("{{OBJECT}}", obj)
    prompt = prompt.replace("{{ACTION}}", act)
    prompt = prompt.replace("{{SENSORY_DETAIL}}", detail)
    prompt = prompt.replace("{{LOCATION}}", loc)
    prompt = prompt.replace("{{COST}}", cost_map[args.cost])
    prompt = prompt.replace("{{STYLE}}", args.style.upper())
    prompt = prompt.replace("{{WHIMSY}}", whimsy_map[args.whimsy])
    prompt = prompt.replace("{{CUSTOM_BLOCK}}", custom_block)

    if args.prompt_only:
        print(f"{Colors.YELLOW}Prompt synthesized:{Colors.END}")
        print(prompt)
        sys.exit(0)
        
    # Get API key
    load_dotenv()
    api_key = args.api_key or os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        print(f"{Colors.YELLOW}GEMINI_API_KEY or GOOGLE_API_KEY env variable or --api-key argument not found.{Colors.END}")
        print(f"Here is your compiled creativity prompt. Copy and run it in your LLM:\n")
        print(prompt)
        sys.exit(0)
        
    print(f"{Colors.BLUE}Synthesizing ideas with Gemini ({args.model})...{Colors.END}")
    ideas = call_gemini(api_key, args.model, prompt, args.temp)
    
    if ideas:
        print(f"\n{Colors.BOLD}--- GENERATED IDEAS ---{Colors.END}\n")
        print(ideas)
        print(f"\n{Colors.BOLD}-----------------------{Colors.END}\n")

if __name__ == "__main__":
    main()
