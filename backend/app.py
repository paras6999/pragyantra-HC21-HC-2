from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests
from openai import OpenAI
from pymongo import MongoClient

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

app = Flask(__name__)
CORS(app)

BASE = os.path.dirname(__file__)
MONGO_URI = os.environ.get("MONGO_URI")
MONGO_DB_NAME = os.environ.get("MONGO_DB", "sahayak")
MONGO_COLLECTION = os.environ.get("MONGO_COLLECTION", "schemes")

mongo_client = None
mongo_available = False

if MONGO_URI:
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command("ping")
        mongo_available = True
        print("Connected to MongoDB")
    except Exception as err:
        mongo_client = None
        mongo_available = False
        print(f"MongoDB connection failed: {err}")


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
        print(
            f"MongoDB returned {len(schemes)} schemes, falling back to JSON dataset ({len(json_schemes)} schemes)."
        )
    except Exception as err:
        print(f"Failed to load schemes from MongoDB: {err}")

    return json_schemes


# ── GET /api/categories ────────────────────────────────────────────────────────
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


# ── GET /api/schemes ───────────────────────────────────────────────────────────
@app.route("/api/schemes", methods=["GET"])
def get_schemes():
    return jsonify(load_schemes())


# ── POST /api/check_eligibility ───────────────────────────────────────────────
@app.route("/api/check_eligibility", methods=["POST"])
def check_eligibility():
    from eligibility_engine import run_eligibility
    data = request.get_json(force=True)
    schemes = load_schemes()
    results = run_eligibility(data, schemes)
    return jsonify(results)


# ── GET /api/document_guidance/<doc_id> ───────────────────────────────────────
@app.route("/api/document_guidance/<doc_id>", methods=["GET"])
def get_document_guidance(doc_id):
    guidance = load_json("document_guidance.json")
    if doc_id in guidance:
        return jsonify(guidance[doc_id])
    return jsonify({"error": "Guidance not found for this document"}), 404


# ── POST /api/chat ─────────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_message = data.get("message", "")
    
    # System prompt strictly restricts to disability schemes
    system_prompt = (
        "You are Sahayak, an AI assistant for disability schemes in India. "
        "You ONLY answer questions related to government disability schemes, eligibility, required documents, "
        "and physical centers (like CSCs or hospitals) for these matters. "
        "If a user asks about anything unrelated (e.g., weather, coding, general knowledge), "
        "you MUST reply ONLY with: 'I can only help with disability schemes and related queries.'"
    )
    
    if not client:
        return jsonify({"error": "OPENAI_API_KEY is not configured."}), 500

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3
        )
        return jsonify({"reply": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── GET /api/nearby_centers ─────────────────────────────────────────────────────────────
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
            addr = el.get("tags", {}).get("addr:full", "Address not specified, please refer to map.")
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
