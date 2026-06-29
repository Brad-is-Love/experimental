import json
import urllib.request
import urllib.error
import urllib.parse
import argparse
import time
import os
import re

# Keywords to filter out coding/AI related discussions
EXCLUDE_KEYWORDS = ["coding", "programming", "python", "javascript", "developer", "software", "ai", "artificial intelligence", "machine learning", "chatgpt", "openai", "code", "devops", "html", "css", "api"]

def is_valid_post(title, selftext):
    """Checks if the post contains any excluded keywords using word boundaries."""
    content = (title + " " + selftext).lower()
    for keyword in EXCLUDE_KEYWORDS:
        # Use regex to match exact words, preventing "ai" from matching "said" or "pain"
        if re.search(rf'\b{re.escape(keyword)}\b', content):
            return False
    return True

def fetch_pullpush_json(url):
    """Fetches JSON data from the PullPush API (Reddit archive)."""
    try:
        # We add a slight delay to respect the public API rate limits
        time.sleep(1)
        req = urllib.request.Request(url, headers={'User-Agent': 'AutonomyProject-Research/1.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} while fetching {url}")
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def _process_posts(data, default_subreddit='unknown'):
    """Helper function to parse and filter posts from PullPush API response."""
    findings = []
    if data and 'data' in data:
        for post in data['data']:
            title = post.get('title', '')
            selftext = post.get('selftext', '')
            subreddit = post.get('subreddit', default_subreddit)
            score = post.get('score', 0)
            num_comments = post.get('num_comments', 0)
            url = post.get('url', '')
            author = post.get('author', '[deleted]')

            # Pullpush might return empty selftexts or "[removed]"
            if selftext in ["[removed]", "[deleted]"]:
                selftext = ""

            if is_valid_post(title, selftext):
                findings.append({
                    "subreddit": subreddit,
                    "title": title,
                    "score": score,
                    "comments": num_comments,
                    "url": url,
                    "author": author,
                    "content_snippet": selftext[:500] + "..." if len(selftext) > 500 else selftext
                })
    return findings

def analyze_subreddit(subreddit, limit=25):
    """Analyzes recent posts from a given subreddit using PullPush."""
    print(f"Analyzing r/{subreddit} using PullPush archive API...")
    # Using PullPush API to get recent submissions
    url = f"https://api.pullpush.io/reddit/search/submission/?subreddit={urllib.parse.quote(subreddit)}&size={limit}&sort=desc"
    data = fetch_pullpush_json(url)
    return _process_posts(data, default_subreddit=subreddit)

def search_keywords(query, limit=25):
    """Searches for specific keywords across all subreddits."""
    print(f"Searching for topics related to '{query}' across Reddit using PullPush...")
    url = f"https://api.pullpush.io/reddit/search/submission/?q={urllib.parse.quote(query)}&size={limit}&sort=desc"
    data = fetch_pullpush_json(url)
    return _process_posts(data)

def save_findings(findings):
    """Saves the structured findings to JSON and appends a summary to Markdown."""
    if not findings:
        print("No valid findings to save.")
        return

    os.makedirs('agent_memory', exist_ok=True)
    json_path = 'agent_memory/research_data.json'
    md_path = 'agent_memory/research_findings.md'

    # Save to JSON
    existing_data = []
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            try:
                existing_data = json.load(f)
            except json.JSONDecodeError:
                pass

    existing_data.extend(findings)
    with open(json_path, 'w') as f:
        json.dump(existing_data, f, indent=4)

    # Append to Markdown
    with open(md_path, 'a') as f:
        f.write(f"\n## Research Run: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Analyzed {len(findings)} relevant posts.\n\n")
        for item in findings:
            f.write(f"### {item['title']} (r/{item['subreddit']})\n")
            f.write(f"- **Engagement:** {item.get('score', 'N/A')} upvotes, {item.get('comments', 'N/A')} comments\n")
            f.write(f"- **Link:** {item['url']}\n")
            f.write(f"- **Snippet:** {item['content_snippet']}\n\n")

    print(f"Saved {len(findings)} findings to {json_path} and {md_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reddit Researcher Tool for Autonomous Agents (via PullPush)")
    parser.add_argument("--analyze", type=str, help="Analyze recent posts from a specific subreddit (e.g. 'Advice')")
    parser.add_argument("--search", type=str, help="Search for keywords across Reddit to discover subreddits (e.g. 'I am struggling with')")
    parser.add_argument("--limit", type=int, default=25, help="Limit number of posts to fetch")

    args = parser.parse_args()

    if args.analyze:
        findings = analyze_subreddit(args.analyze, args.limit)
        save_findings(findings)
    elif args.search:
        findings = search_keywords(args.search, args.limit)
        save_findings(findings)
    else:
        parser.print_help()
