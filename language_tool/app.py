import os
import zipfile
import tempfile
import sqlite3
import json
import urllib.request
import urllib.error
import urllib.parse
import shutil
import re
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

def clean_html(raw_html):
    """Remove HTML tags and entities from raw Anki note text to prevent rendering clutter."""
    if not raw_html:
        return ""
    # Simple regex-based HTML tag cleaning
    clean_r = re.compile('<.*?>')
    clean_text = re.sub(clean_r, '', raw_html)
    # Basic html entities replacement
    clean_text = clean_text.replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    return clean_text.strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400
    if not file.filename.endswith('.apkg'):
        return jsonify({'status': 'error', 'message': 'Invalid file type. Only .apkg files are supported.'}), 400

    filename = secure_filename(file.filename)
    extract_dir = tempfile.mkdtemp()
    filepath = os.path.join(extract_dir, filename)
    file.save(filepath)

    try:
        # Extract files from ZIP archive
        with zipfile.ZipFile(filepath, 'r') as zip_ref:
            app.logger.info(f"Files in uploaded zip: {zip_ref.namelist()}")
            for member in zip_ref.infolist():
                if 'collection.anki2' in member.filename:
                    zip_ref.extract(member, extract_dir)

        # Decompress collection.anki21b if present
        zstd_path = os.path.join(extract_dir, 'collection.anki21b')
        if os.path.exists(zstd_path):
            try:
                import zstandard as zstd
                decompressed_path = os.path.join(extract_dir, 'collection.anki21')
                dctx = zstd.ZstdDecompressor()
                with open(zstd_path, 'rb') as compressed, open(decompressed_path, 'wb') as destination:
                    dctx.copy_stream(compressed, destination)
                app.logger.info("Successfully decompressed collection.anki21b")
            except Exception as decompress_err:
                app.logger.error(f"Failed to decompress collection.anki21b: {decompress_err}")

        # Prioritize collection.anki21 (modern) over collection.anki2 (legacy/compatibility)
        db_path = os.path.join(extract_dir, 'collection.anki21')
        if not os.path.exists(db_path):
            db_path = os.path.join(extract_dir, 'collection.anki2')
        
        if not os.path.exists(db_path):
            return jsonify({'status': 'error', 'message': 'Invalid anki deck, collection database not found'}), 400

        conn = sqlite3.connect(db_path)
        c = conn.cursor()

        def extract_vocabulary_from_rows(rows):
            vocab = []
            for row in rows:
                note_id = str(row[0])
                flds = row[1]
                parts = flds.split('\x1f')
                if len(parts) >= 2:
                    vocab.append({
                        'id': note_id,
                        'front': clean_html(parts[0]),
                        'back': clean_html(parts[1])
                    })
            return vocab

        # Query to extract "learning" or "young" cards (interval < 21 days)
        query = """
        SELECT n.id, n.flds
        FROM cards c
        JOIN notes n ON c.nid = n.id
        WHERE c.type IN (1, 2) AND c.ivl < 21
        ORDER BY RANDOM()
        LIMIT 250
        """

        try:
            c.execute(query)
            rows = c.fetchall()
        except sqlite3.OperationalError as db_err:
            app.logger.error(f"Database query failed, trying fallback: {db_err}")
            rows = []

        vocabulary = extract_vocabulary_from_rows(rows)

        # Fallback: if no young cards match or query failed, select any random cards from the deck
        if not vocabulary:
            fallback_query = """
            SELECT n.id, n.flds
            FROM cards c
            JOIN notes n ON c.nid = n.id
            ORDER BY RANDOM()
            LIMIT 250
            """
            try:
                c.execute(fallback_query)
                rows = c.fetchall()
                vocabulary = extract_vocabulary_from_rows(rows)
            except Exception as fallback_err:
                app.logger.error(f"Fallback database query failed: {fallback_err}")

        conn.close()

        if not vocabulary:
            return jsonify({'status': 'error', 'message': 'No suitable vocabulary cards found in the deck'}), 400

        return jsonify({
            'status': 'success',
            'vocabulary': vocabulary
        })

    except Exception as e:
        app.logger.error(f"Error handling deck upload: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        # Secure cleanup
        if os.path.exists(filepath):
            try: os.remove(filepath)
            except Exception: pass
        if os.path.exists(extract_dir):
            try: shutil.rmtree(extract_dir)
            except Exception: pass

@app.route('/api/generate-story', methods=['POST'])
def generate_story():
    data = request.json or {}
    genre = data.get('genre', 'Daily Life')
    difficulty = data.get('difficulty', 'Novice')
    language_level = (data.get('language_level') or '').strip()
    vocabulary = data.get('vocabulary', [])

    if not vocabulary and not language_level:
        return jsonify({'status': 'error', 'message': 'Please provide either vocabulary cards or a description of your target language and current level.'}), 400

    # Resolve API Key
    api_key = data.get('apiKey') or os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        return jsonify({
            'status': 'error',
            'message': 'API key not configured. Please enter a Gemini API Key in Settings (top right gear icon) or configure it on the server.'
        }), 400

    vocab_json_str = json.dumps(vocabulary, ensure_ascii=False)

    if language_level:
        level_instruction = f"precisely adapted to the student's level and target language description: {language_level}"
    else:
        level_instruction = f"precisely adapted to the difficulty level: {difficulty} (where Novice means short sentences and simple vocabulary, Apprentice means moderate structure and complexity, and Master means advanced structures and rich vocabulary)"

    prompt = f"""You are an expert language teacher and writer. Write an engaging story matching the genre: {genre}.
The story and comprehension exercises must be written in the target language of the student (inferred from the vocabulary list or target language description).
The story structure, complexity, and vocabulary must be {level_instruction}.

If the target vocabulary list below is not empty:
Choose and incorporate a maximum of 7 target vocabulary items from the list below into the story. Do not use more than 7 words. Choose the words that best fit a natural, engaging narrative.
Target vocabulary list (choose at most 7):
{vocab_json_str}

If the target vocabulary list is empty:
You must select 5 to 7 suitable vocabulary words in the target language at the student's level, incorporate them into the story, and return them with generated unique IDs (e.g. 'v1', 'v2', etc.) in the `vocabulary` list response field.

Strict Formatting Rules:
1. Divide the story into 2 to 4 paragraphs.
2. For each target vocabulary word incorporated in the story, wrap it in a custom tag like: <vocab id="card_id">inflected_word_in_story</vocab>. The 'id' attribute must match the exact 'id' from the vocabulary list (or the generated unique IDs if no vocabulary was input). For example, if the card has id "123" and front "ferrocarril", and the story uses "ferrocarriles", write: <vocab id="123">ferrocarriles</vocab>.
3. Generate exactly 3 multiple-choice comprehension questions in the target language based on the story. Each question must have exactly 4 options, a correct answer that matches one of the options verbatim, and a brief explanation in the target language.
4. You must list all vocabulary items actually used in the story in the `vocabulary` response field, providing their ID, front (word in target language), and back (English translation).

Return the result as a JSON object matching the defined schema.
"""

    model = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
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
                    },
                    "vocabulary": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": { "type": "string" },
                                "front": { "type": "string" },
                                "back": { "type": "string" }
                            },
                            "required": ["id", "front", "back"]
                        },
                        "description": "Vocabulary items used in the story."
                    }
                },
                "required": ["paragraphs", "questions", "vocabulary"]
            }
        }
    }

    try:
        req_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={'Content-Type': 'application/json'}
        )

        with urllib.request.urlopen(req, timeout=45) as response:
            resp_data = json.loads(response.read().decode('utf-8'))

        text_output = resp_data['candidates'][0]['content']['parts'][0]['text']
        app.logger.info(f"Gemini raw output: {text_output}")
        story_json = json.loads(text_output)
        app.logger.info(f"Parsed story_json: {story_json}")

        return jsonify({
            'status': 'success',
            'paragraphs': story_json.get('paragraphs', []),
            'questions': story_json.get('questions', []),
            'vocabulary': story_json.get('vocabulary', [])
        })

    except urllib.error.HTTPError as http_err:
        try:
            err_details = json.loads(http_err.read().decode('utf-8'))
            err_msg = err_details.get('error', {}).get('message', str(http_err))
        except Exception:
            err_msg = str(http_err)
        app.logger.error(f"Gemini API HTTP Error: {err_msg}")
        return jsonify({'status': 'error', 'message': f"Gemini API Error: {err_msg}"}), http_err.code
    except urllib.error.URLError as url_err:
        app.logger.error(f"Gemini API Connection Error: {url_err}")
        return jsonify({'status': 'error', 'message': f"Connection Error: {str(url_err)}"}), 502
    except Exception as err:
        app.logger.error(f"Unexpected error during story generation: {err}")
        return jsonify({'status': 'error', 'message': f"Failed to generate story: {str(err)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
