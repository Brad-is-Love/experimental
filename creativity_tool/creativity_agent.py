#!/usr/bin/env python3
import os
import sys
import json
import random
import urllib.request
import urllib.parse
import argparse

# Database Lists
OBLIQUE_STRATEGIES = [
    "Honor thy error as a hidden intention",
    "Look closely at the most embarrassing details and amplify them",
    "Use an old idea",
    "State the problem in words as clearly as possible",
    "Only one element of each kind",
    "What is the simplest solution?",
    "Turn it upside down",
    "Work at a different speed",
    "Ask your body",
    "Emphasize differences",
    "Discover the recipes you are using and abandon them",
    "Remove specifics and convert to ambiguities",
    "Disconnect from desire",
    "Breathe more deeply",
    "Make a sudden, destructive unpredictable action; incorporate",
    "Do the words need changing?",
    "Change instrument roles",
    "Accept advice",
    "Define an area as 'safe' and use it as an anchor",
    "Repetition is a form of change",
    "Go slowly all the way round the outside",
    "Take away the elements in order of apparent non-importance",
    "Don't avoid what is easy",
    "Decorate, decorate",
    "What are you really thinking about just now? Incorporate",
    "Look at the order in which you do things",
    "Destructive patterns",
    "Use filters",
    "It is quite possible to work alone",
    "Into the impossible",
    "Is the tuning appropriate?",
    "Courage!",
    "Always first steps",
    "Revaluation (a warm feeling)",
    "Faced with a choice, do both",
    "Give way to your worst impulse",
    "Make a blank valuable by putting it in an exquisite frame",
    "Slow preparation, fast execution",
    "Fill every beat with something",
    "List the qualities it has. List the qualities it lacks",
    "Is there something missing?",
    "Overtly resist change",
    "Do the dirty work",
    "Put in gridlock",
    "Allow an easement (an easement is the right to trespass or use another's land)",
    "Listen to the quiet voice",
    "You don't have to be ashamed of using your own ideas",
    "Look at a very small object, look at its limit",
    "Retrace your steps",
    "Ask your pocket",
    "Destroy the most important thing",
    "Make it more simple",
    "Is it finished?",
    "What would your closest friend do?",
    "Use an unacceptable color",
    "Faced with a wall, build a window",
    "Subtract one digit from all values",
    "Look at the project through the eyes of an amateur",
    "Make a list of things you will not do under any circumstances",
    "Translate it into a different medium",
    "Focus on the gaps, not the solid objects",
    "Do something boring",
    "Invert the priority list",
    "Make a map of the mistakes",
    "Introduce a slow leak",
    "Let the text sleep for a night",
    "Only write in the margins",
    "Magnify the smallest sound",
    "Do not commit to the first draft",
    "Make the system fragile",
    "Let the crowd decide the first parameter",
    "Hide a secret code inside",
    "Build a bridge to an unrelated field",
    "Use only materials found within arm's reach",
    "What if the project failed? Make that the goal",
    "Simplify the transition points",
    "Slow down the intake of new information",
    "Change the rules of engagement mid-way",
    "Make it look like something else entirely",
    "Abandon the current canvas",
    "Do the opposite of what is expected",
    "Work with a constraint that makes you angry",
    "Find the quietest frequency",
    "Emphasize the seams and joints",
    "What is the background noise saying?",
    "Make the interface require two hands",
    "Remove the central feature",
    "Is it too comfortable?",
    "Describe it to a child",
    "Let it rust",
    "Make it float",
    "Reframe the target audience as a single person",
    "Trade a feature for a constraint",
    "Use only black, white, and a single neon color",
    "Multiply the scale by ten",
    "Divide the budget in half",
    "Change the language of operation",
    "Incorporate the weather outside",
    "Think of the project as a physical space",
    "Make the entry point hidden",
    "Make the exit point rewarding",
    "Introduce an element of deliberate friction",
    "Ask: What would a medieval guild do?",
    "Draw a circle around the main issue, then ignore the circle",
    "Use an element from a project you abandoned"
]

PHYSICAL_OBJECTS = [
    "dried leaves", "gold coins", "smooth stones", "rusty keys", "cotton string",
    "glass jars", "colored chalk", "wax candles", "wooden buttons", "folded paper",
    "seashells", "cork stoppers", "clay pots", "iron nails", "dried lavender",
    "copper wire", "linen scraps", "pinecones", "bamboo sticks", "pebbles",
    "old maps", "feather quill", "beeswax", "willow twigs", "hand-woven baskets",
    "old postcards", "brass bells", "wax paper", "glass marbles", "magnifying glass",
    "pocket watch", "burlap sacks", "rubber stamps", "lead pencils", "graph paper",
    "pressed flowers", "matchsticks", "wooden rulers", "copper pennies", "velvet ribbons",
    "tin cans", "seasalt crystals", "cinnamon sticks", "cotton fabric", "steel washers",
    "feather duster", "bamboo charcoal", "wool yarn", "leather scraps", "clay marbles",
    "seashell fragments", "parchment paper", "old dictionary", "inkwell", "typewriter keys",
    "driftwood", "porcelain shards", "vintage skeleton keys", "balsa wood", "magnets",
    "hemp rope", "cardboard tubes", "foil wrappers", "safety pins", "paperclips",
    "glass vials", "dried orange slices", "origami cranes", "spools of thread",
    "cigar boxes", "mirror fragments", "ceramic tiles", "wooden dowels", "wine corks",
    "chalkboard pieces"
]

SENSORY_DETAILS = [
    "a damp, mossy smell", "rough, weathered textures", "the sound of wind through pines",
    "flickering, warm candlelight", "a sharp, metallic chime", "the earthy scent of rain (petrichor)",
    "cool, running water", "the gritty feel of sand", "creaking old wood",
    "the faint aroma of woodsmoke", "a soft, brushed finish", "the low hum of a distant crowd",
    "sun-warmed leather", "the rustle of dry leaves", "polished, cold marble",
    "the smell of old paper and dust", "the crisp chill of morning air", "the scent of fresh cut grass",
    "a low, rhythmic tapping", "warm, textured wool", "the bright glare of neon signs",
    "the clean scent of peppermint", "a soft, velvety touch", "the smell of sea salt and ozone",
    "the crunch of dry gravel", "a gentle, cool breeze", "the taste of bitter chocolate",
    "the high-pitched buzz of a CRT screen", "the smell of roasted coffee beans",
    "the smooth glide of polished glass", "the crackle of static electricity", "the damp chill of a cellar",
    "warm, dry sand underfoot", "the scent of jasmine in the evening", "a soft, repetitive whisper",
    "the smell of new rain on dry asphalt", "the vibrant hue of sunset orange",
    "the feel of cold running stream water", "the scent of cedar wood", "the muffled echo of footsteps",
    "a faint, sweet honey aroma", "the sound of distant church bells", "rough, coarse sandpaper texture",
    "the smell of fresh pine needles", "the tickle of grass blades"
]

LOCATIONS = [
    "a bustling school fair", "a quiet corner of a public park", "a sleepy village square",
    "the steps of an old library", "a community garden plot", "a local farmers market",
    "beside a slow-moving river", "a flea market stall", "under a large weeping willow",
    "a dusty second-hand bookstore", "a neighborhood street corner", "the edge of a forest trail",
    "a local community hall", "a busy subway platform", "a quiet rooftop garden",
    "an old antique shop", "an airport terminal lounge", "a botanical conservatory",
    "a local community pool", "a cozy coffee shop corner", "a dim parking garage",
    "a neighborhood block party", "an empty beach at dusk", "a local thrift store",
    "a university lecture hall", "a public greenhouse", "a plant nursery",
    "a dock on a quiet lake", "a historic museum lobby", "a quiet church courtyard",
    "a virtual Discord server room", "a high-school basketball court", "a local post office lobby",
    "a busy street food alley", "a quiet harbor pier", "a weekend craft market",
    "a community workshop", "a local bakery porch", "a mountain trail rest stop",
    "a city train station waiting room"
]

ACTIONS = [
    "paint or dye them", "carve intricate patterns", "tie with organic twine",
    "melt or fuse together", "stamp with a custom emblem", "write short poems or words upon",
    "arrange in geometric grids", "press or flatten", "weave or braid",
    "polish until shiny", "bury and retrieve", "gift or trade secretly", "stack or balance",
    "stamp or print on them", "wrap in linen cloth", "seal with red wax",
    "etch a unique code", "soak in fragrant water", "glue into a mosaic",
    "engrave a name", "stitch with bright thread", "heat until they change color",
    "coat in clear varnish", "bind into a booklet", "dip in colored wax",
    "perfume with essential oils", "decorate with gold foil", "scrub until weathered",
    "arrange in concentric circles", "label with hand-written tags", "weave into a mesh",
    "sand until completely smooth", "group by color gradient", "drizzle with beeswax",
    "mount on small wooden boards", "drill a small hole through", "suspend from a string",
    "braid or knot tightly", "dust with mineral powders", "wrap with copper wire"
]

FALLBACK_SPARKS = [
    {
        "title": "Svalbard Global Seed Vault",
        "extract": "A secure backup facility for the world's crop diversity on the Norwegian island of Spitsbergen in the remote Arctic Svalbard archipelago. It is designed to withstand natural and human disasters."
    },
    {
        "title": "Voyager 1",
        "extract": "A space probe launched by NASA in 1977 to study the outer Solar System and interstellar space. It is the most distant artificial object from Earth, continuing to transmit scientific data."
    },
    {
        "title": "Antikythera mechanism",
        "extract": "An ancient Greek hand-powered orrery, described as the oldest example of an analogue computer, used to predict astronomical positions and eclipses decades in advance."
    },
    {
        "title": "Tulip mania",
        "extract": "A period during the Dutch Golden Age when contract prices for some bulbs of the recently introduced and fashionable tulip reached extraordinarily high levels, and then dramatically collapsed."
    },
    {
        "title": "Kintsugi",
        "extract": "The Japanese art of repairing broken pottery by mending the areas of breakage with lacquer dusted or mixed with powdered gold, silver, or platinum. It treats breakage as part of the object's history."
    }
]

STOP_WORDS = {
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
}

# Terminal Colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def fetch_wikipedia_spark():
    """Fetches a random Wikipedia article title and its REST summary, returning a dictionary."""
    try:
        # 1. Fetch a random page title
        random_url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1'
        req = urllib.request.Request(random_url, headers={'User-Agent': 'SynapticSparks/1.0 (creativity tool)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        title = data['query']['random'][0]['title']
        
        # 2. Fetch the summary for that page
        safe_title = urllib.parse.quote(title.replace(' ', '_'))
        summary_url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{safe_title}'
        req = urllib.request.Request(summary_url, headers={'User-Agent': 'SynapticSparks/1.0 (creativity tool)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            summary_data = json.loads(response.read().decode('utf-8'))
            
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
    parser.add_argument("--goal", default="make money, starting at $2, in ethical ways that are net positive for humanity", help="Creative goal to achieve")
    
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
        
    prompt = f"""You are a Lateral Thinking Creativity Agent. Your task is to generate 3 highly detailed, non-obvious, creative business or project ideas designed to achieve this goal: "{args.goal}".

To inject lateral elements into your thinking, your ideas must be seeded by these random variables, although the use can be metaphorical:

- Wikipedia Seed Spark: "{wiki['title']}"
  Context: "{wiki['extract']}"
- Spark Words: {', '.join(words)}
- Oblique Strategy Card: "{strategy}"
- Physical Inspiration Sparks:
  - Object: "{obj}"
  - Action: "{act}"
- Sensory & Location Context:
  - Ambient Sensory Detail: "{detail}"
  - Location: "{loc}"
- Financial Limit: Budget must be {cost_map[args.cost]}.
- Core Theme/Style: Must focus on a {args.style.upper()} delivery.
- Creativity Level: {whimsy_map[args.whimsy]}.
{custom_block}
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

[Repeat for Idea 2 and 3]"""

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
