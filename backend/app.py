from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

BASE = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE, '.env'))

# ── API Keys ──────────────────────────────────────────────────────────────────
GEMINI_API_KEY     = os.environ.get("GEMINI_API_KEY")
GOOGLE_MAPS_KEY    = os.environ.get("GOOGLE_MAPS_API_KEY")
OPENAI_API_KEY     = os.environ.get("OPENAI_API_KEY")   # kept as fallback

# ── Gemini client setup ────────────────────────────────────────────────────────
gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-pro")
        print("✅  Gemini AI configured successfully")
    except Exception as e:
        print(f"⚠️  Gemini setup failed: {e}")
        gemini_model = None

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── MongoDB setup ──────────────────────────────────────────────────────────────
MONGO_URI        = os.environ.get("MONGO_URI")
MONGO_DB_NAME    = os.environ.get("MONGO_DB", "sahayak")
MONGO_COLLECTION = os.environ.get("MONGO_COLLECTION", "schemes")

mongo_client    = None
mongo_available = False

if MONGO_URI:
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command("ping")
        mongo_available = True
        print("✅  Connected to MongoDB Atlas")
    except Exception as err:
        mongo_client    = None
        mongo_available = False
        print(f"⚠️  MongoDB connection failed: {err}")


# ── Helpers ────────────────────────────────────────────────────────────────────
def load_json(filename):
    with open(os.path.join(BASE, filename), encoding="utf-8") as f:
        return json.load(f)


def load_schemes():
    json_schemes = load_json("schemes.json")
    if not mongo_available:
        return json_schemes
    try:
        collection = mongo_client[MONGO_DB_NAME][MONGO_COLLECTION]
        schemes = list(collection.find({}, {"_id": False}))
        if len(schemes) >= len(json_schemes):
            return schemes
        print(f"MongoDB returned {len(schemes)} schemes, falling back to JSON ({len(json_schemes)} schemes).")
    except Exception as err:
        print(f"Failed to load schemes from MongoDB: {err}")
    return json_schemes


# ── GET /api/status ─────────────────────────────────────────────────────────────
@app.route("/api/status", methods=["GET"])
def get_status():
    return jsonify({
        "gemini_configured": bool(gemini_model),
        "google_maps_key_set": bool(GOOGLE_MAPS_KEY),
        "mongo_uri_set": bool(MONGO_URI),
        "mongo_available": mongo_available,
        "mongo_db": MONGO_DB_NAME,
        "mongo_collection": MONGO_COLLECTION,
        "scheme_source": "mongo" if mongo_available else "json",
    })


# ── GET /api/maps_key ──────────────────────────────────────────────────────────
@app.route("/api/maps_key", methods=["GET"])
def get_maps_key():
    """Safely expose the Google Maps JS key to the frontend."""
    if not GOOGLE_MAPS_KEY:
        return jsonify({"error": "GOOGLE_MAPS_API_KEY not configured"}), 500
    return jsonify({"key": GOOGLE_MAPS_KEY})


# ── GET /api/categories ─────────────────────────────────────────────────────────
@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = [
        {"id": "education",  "name": "Education / Scholarship",   "icon": "🎓", "color": "blue",   "description": "Scholarships & fellowships for students with disabilities"},
        {"id": "health",     "name": "Health Insurance",          "icon": "🏥", "color": "green",  "description": "Medical coverage & healthcare support schemes"},
        {"id": "housing",    "name": "Housing / Hostel",          "icon": "🏠", "color": "purple", "description": "Housing assistance & subsidised accommodation"},
        {"id": "financial",  "name": "Pension / Financial",       "icon": "💰", "color": "yellow", "description": "Disability pensions & financial aid programs"},
        {"id": "employment", "name": "Employment / Skills",       "icon": "💼", "color": "orange", "description": "Skill training, loans & employment support"},
        {"id": "other",      "name": "Other Schemes",             "icon": "📋", "color": "pink",   "description": "Assistive devices, ID cards & more"},
        {"id": "all",        "name": "All Schemes",               "icon": "🌐", "color": "indigo", "description": "Explore all 15+ government schemes at once"},
    ]
    return jsonify(categories)


# ── GET /api/schemes ────────────────────────────────────────────────────────────
@app.route("/api/schemes", methods=["GET"])
def get_schemes():
    return jsonify(load_schemes())


# ── POST /api/check_eligibility ─────────────────────────────────────────────────
@app.route("/api/check_eligibility", methods=["POST"])
def check_eligibility():
    from eligibility_engine import run_eligibility
    data = request.get_json(force=True)
    schemes = load_schemes()
    results = run_eligibility(data, schemes)
    return jsonify(results)


# ── GET /api/document_guidance/<doc_id> ─────────────────────────────────────────
@app.route("/api/document_guidance/<doc_id>", methods=["GET"])
def get_document_guidance(doc_id):
    guidance = load_json("document_guidance.json")
    if doc_id in guidance:
        return jsonify(guidance[doc_id])
    return jsonify({"error": "Guidance not found for this document"}), 404


# ── POST /api/chat  (Gemini-powered) ────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_message = data.get("message", "").strip()
    # chat_history is a list of {role, text} objects from the frontend
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    # ── Gemini path ──────────────────────────────────────────────────────────
    if gemini_model:
        try:
            # Build conversation history for multi-turn chat
            system_prompt = (
                "You are Sahayak, an expert AI assistant for disability-related government "
                "schemes in India. You ONLY answer questions related to: government disability "
                "schemes, eligibility criteria, required documents, application procedures, "
                "and physical centers (CSCs, hospitals, banks, post offices) for these matters. "
                "Be empathetic, concise and helpful. Format lists with bullet points. "
                "If a user asks about ANYTHING unrelated to disability schemes, documents or "
                "government services, you MUST reply ONLY with: "
                "'I can only help with disability schemes and related queries.'"
            )
            # gemini-pro requires alternating user/model roles. We fold the system prompt into the first user message.
            gemini_history = []
            
            # If there's an existing history, prepend the system prompt to the first user message
            if history and len(history) > 0:
                first_msg = history[0].get("text", "")
                gemini_history.append({"role": "user", "parts": [f"{system_prompt}\n\nUser Question: {first_msg}"]})
                
                # Append the rest of the history
                for msg in history[1:]:
                    role = "user" if msg.get("role") == "user" else "model"
                    gemini_history.append({"role": role, "parts": [msg.get("text", "")]})
            else:
                # If no history, prepend it to the current user message
                user_message = f"{system_prompt}\n\nUser Question: {user_message}"

            chat_session = gemini_model.start_chat(history=gemini_history)
            response = chat_session.send_message(user_message)
            reply = response.text
            return jsonify({"reply": reply, "engine": "gemini"})
        except Exception as e:
            print(f"Gemini error: {e}")
            return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

    return jsonify({"error": "Gemini AI model failed to initialize. Please check if 'google-generativeai' is installed."}), 500


# ── GET /api/nearby_centers  (Overpass API) ─────────────────────────────────────
@app.route("/api/nearby_centers", methods=["GET"])
def nearby_centers():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    center_type = request.args.get("type", "government_office")
    
    if not lat or not lng:
        return jsonify({"error": "Missing lat or lng"}), 400
        
    # Map center_type to OSM Overpass query elements
    if center_type == "hospital":
        query_node = 'node["amenity"="hospital"]'
    elif center_type == "bank":
        query_node = 'node["amenity"="bank"]'
    elif center_type in ["post_office", "school", "internet_cafe"]:
        query_node = f'node["amenity"="{center_type}"]'
    elif center_type == "studio":
        query_node = 'node["shop"="photo"]'
    elif center_type == "csc" or center_type == "government_office":
        query_node = 'node["office"="government"]'
    else:
        query_node = 'node["office"="government"]'
        
    # Overpass API query (approx 5km radius)
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      {query_node}(around:5000,{lat},{lng});
    );
    out center 10;
    """
    
    try:
        res = requests.post(overpass_url, data={"data": overpass_query}, timeout=10)
        data = res.json()
        centers = []
        for el in data.get("elements", []):
            name = el.get("tags", {}).get("name", f"Local {center_type.replace('_', ' ').title()}")
            addr = el.get("tags", {}).get("addr:full", "Address not specified.")
            centers.append({
                "id": el.get("id"),
                "name": name,
                "address": addr,
                "lat": el.get("lat"),
                "lng": el.get("lon"),
                "type": center_type
            })
        return jsonify(centers)
    except Exception as e:
        return jsonify({"error": "Map API failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
