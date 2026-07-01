import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import google.generativeai as genai

# Load .env variables manually for local dev if python-dotenv is absent
def load_env():
    if os.path.exists('.env'):
        with open('.env') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    os.environ[key] = val

load_env()

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configure Database
basedir = os.path.abspath(os.path.dirname(__file__))
os.makedirs(os.path.join(basedir, 'data'), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data', 'smallest_step.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configure Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Configure Gemini API
google_api_key = os.environ.get("GOOGLE_API_KEY")
if google_api_key and google_api_key != 'your_api_key_here':
    genai.configure(api_key=google_api_key)

# ---------------------------------------------------------------------------
# Database Models
# ---------------------------------------------------------------------------

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    current_streak = db.Column(db.Integer, default=0)

class Goal(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Step(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id = db.Column(db.String(36), db.ForeignKey('goal.id'), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    level = db.Column(db.Integer, default=1)
    completed = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, default=0)

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.route('/api/generate-steps', methods=['POST'])
@limiter.limit("10 per minute")
def generate_steps():
    data = request.json
    goal_title = data.get('goal', '').strip()
    if not goal_title:
        return jsonify({"status": "error", "message": "Goal is required"}), 400

    try:
        if google_api_key and google_api_key != 'your_api_key_here':
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            The user has a massive, potentially overwhelming goal: "{goal_title}".
            Break this down into the first 3 absolutely microscopic, immediate, ultra-small daily micro-actions they can do to start.
            They must be trivial (e.g., "Create a folder", "Open a document").
            Return ONLY a valid JSON array of strings representing the steps. Do not include markdown formatting or comments.
            """
            response = model.generate_content(prompt)
            # Try to parse JSON from the response text
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.endswith('```'):
                text = text[:-3]

            generated_steps = json.loads(text.strip())
        else:
            # Fallback mock data if no API key
            generated_steps = [
                f"Create a new folder on your desktop for '{goal_title}'.",
                "Open a text editor and create a file named 'ideas.txt'.",
                "Write down 3 core features."
            ]

        # In a real app we'd save to DB here, but we return to client to match spec
        steps = [
            {"id": str(uuid.uuid4()), "title": generated_steps[0], "level": 1, "completed": False},
            {"id": str(uuid.uuid4()), "title": generated_steps[1], "level": 1, "completed": False},
            {"id": str(uuid.uuid4()), "title": generated_steps[2], "level": 2, "completed": False},
        ]

        return jsonify({
            "status": "success",
            "steps": steps
        })

    except Exception as e:
        print(f"Error generation steps: {e}")
        return jsonify({"status": "error", "message": "Failed to generate steps"}), 500

@app.route('/api/refine-step', methods=['POST'])
@limiter.limit("10 per minute")
def refine_step():
    data = request.json
    step_title = data.get('step_title', '').strip()
    if not step_title:
        return jsonify({"status": "error", "message": "step_title is required"}), 400

    try:
        if google_api_key and google_api_key != 'your_api_key_here':
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            The user has a step that feels too big: "{step_title}".
            Break this specific step down into 2 smaller, more immediate sub-steps.
            Return ONLY a valid JSON array of strings representing the sub-steps. Do not include markdown formatting or comments.
            """
            response = model.generate_content(prompt)

            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.endswith('```'):
                text = text[:-3]

            generated_substeps = json.loads(text.strip())
        else:
             # Fallback mock data if no API key
            generated_substeps = [
                f"Think of the main aspect of: {step_title}",
                f"Write down one sentence about it."
            ]

        sub_steps = [
            {"id": str(uuid.uuid4()), "title": generated_substeps[0], "level": 3, "completed": False},
            {"id": str(uuid.uuid4()), "title": generated_substeps[1], "level": 3, "completed": False}
        ]

        return jsonify({
            "status": "success",
            "sub_steps": sub_steps
        })
    except Exception as e:
        print(f"Error refining step: {e}")
        return jsonify({"status": "error", "message": "Failed to refine step"}), 500

@app.route('/api/assistant-chat', methods=['POST'])
@limiter.limit("20 per minute")
def assistant_chat():
    data = request.json
    step_title = data.get('step_title', '').strip()
    message = data.get('message', '').strip()

    if not step_title or not message:
         return jsonify({"status": "error", "message": "step_title and message are required"}), 400

    try:
        if google_api_key and google_api_key != 'your_api_key_here':
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            The user is trying to complete this micro-task: "{step_title}".
            They asked you, their assistant: "{message}".
            Respond with a brief, helpful, and encouraging answer to get them unstuck. Keep it under 2 sentences.
            """
            response = model.generate_content(prompt)
            reply = response.text.strip()
        else:
             # Fallback mock data if no API key
             reply = "No problem! Let's start with a simple brainstorm. What is the first thing that comes to mind?"

        return jsonify({
            "status": "success",
            "reply": reply
        })
    except Exception as e:
         print(f"Error in assistant chat: {e}")
         return jsonify({"status": "error", "message": "Failed to get assistant reply"}), 500


# ---------------------------------------------------------------------------
# Server Initialization
# ---------------------------------------------------------------------------

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)