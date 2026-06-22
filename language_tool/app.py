import os
import zipfile
import tempfile
import sqlite3
import json
import urllib.request
import urllib.parse
import shutil
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.apkg'):
        filename = secure_filename(file.filename)
        extract_dir = tempfile.mkdtemp()
        filepath = os.path.join(extract_dir, filename)
        file.save(filepath)

        try:
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

            # Prioritize collection.anki21 (the real database in modern exports) over collection.anki2 (often a dummy compatibility file)
            db_path = os.path.join(extract_dir, 'collection.anki21')
            if not os.path.exists(db_path):
                db_path = os.path.join(extract_dir, 'collection.anki2')
            
            if not os.path.exists(db_path):
                return jsonify({'error': 'Invalid anki deck, collection.anki2 or collection.anki21 not found'}), 400

            conn = sqlite3.connect(db_path)
            c = conn.cursor()

            # Try query for young/learning cards first
            query = """
            SELECT n.flds
            FROM cards c
            JOIN notes n ON c.nid = n.id
            WHERE c.type IN (1, 2) AND c.ivl < 21
            ORDER BY RANDOM()
            LIMIT 20
            """

            c.execute(query)
            rows = c.fetchall()

            vocabulary = []
            for row in rows:
                flds = row[0]
                parts = flds.split('\x1f')
                if len(parts) >= 2:
                    vocabulary.append({
                        'front': parts[0],
                        'back': parts[1]
                    })

            # Fallback: if no young cards match, select any random cards from the deck
            if not vocabulary:
                fallback_query = """
                SELECT n.flds
                FROM cards c
                JOIN notes n ON c.nid = n.id
                ORDER BY RANDOM()
                LIMIT 20
                """
                c.execute(fallback_query)
                rows = c.fetchall()
                for row in rows:
                    flds = row[0]
                    parts = flds.split('\x1f')
                    if len(parts) >= 2:
                        vocabulary.append({
                            'front': parts[0],
                            'back': parts[1]
                        })

            conn.close()

            if not vocabulary:
                return jsonify({'error': 'No suitable vocabulary cards found in the deck'}), 400

            # Generate Story using Gemini API
            api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
            if not api_key:
                return jsonify({'error': 'API key not configured'}), 500

            vocab_text = ", ".join([f"{v['front']} ({v['back']})" for v in vocabulary])
            prompt = f"Write a short, engaging story incorporating the following vocabulary words: {vocab_text}. Highlight the vocabulary words in the story."

            model = "gemini-2.5-flash"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.7
                }
            }

            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                url,
                data=data,
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                resp_data = json.loads(response.read().decode('utf-8'))

            story = resp_data['candidates'][0]['content']['parts'][0]['text']

            return jsonify({'message': 'Success', 'vocabulary': vocabulary, 'story': story})

        except urllib.error.URLError as e:
            return jsonify({'error': f"API Error: {str(e)}"}), 502
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
            if os.path.exists(extract_dir):
                shutil.rmtree(extract_dir)

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8080)
