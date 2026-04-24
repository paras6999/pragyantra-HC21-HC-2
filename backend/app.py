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
GEMINI_API_KEY  = os.environ.get("GEMINI_API_KEY")
GOOGLE_MAPS_KEY = os.environ.get("GOOGLE_MAPS_API_KEY")

# gemini-2.5-flash confirmed working for this API key
GEMINI_ENDPOINTS = [
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={key}",
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={key}",
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key={key}",
]

if GEMINI_API_KEY:
    print(f"✅  Gemini API key loaded (REST mode) — key ends with ...{GEMINI_API_KEY[-6:]}")
else:
    print("⚠️  GEMINI_API_KEY not set — chatbot will use offline fallback")

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── MongoDB ────────────────────────────────────────────────────────────────────
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
    except Exception as err:
        print(f"MongoDB load error: {err}")
    return json_schemes


# ── Gemini via direct REST API (no SDK) ───────────────────────────────────────
SYSTEM_PROMPT = (
    "You are Sahayak, a friendly and expert AI assistant for disability-related "
    "government schemes in India. Answer questions about: government disability schemes, "
    "eligibility, required documents, application procedures, and nearby centers. "
    "Be empathetic, concise and helpful. Format lists with bullet points using '* '. "
    "For questions unrelated to disability schemes, reply: "
    "'I can only help with disability schemes and related queries.'"
)

def call_gemini_rest(user_message, history):
    """Try each Gemini endpoint. Returns (reply_text, error_string)."""
    if not GEMINI_API_KEY:
        return None, "No API key"

    # Build conversation contents
    # Prepend system prompt directly into the first user message (universally compatible)
    contents = []
    for msg in history:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg.get("text", "")}]})

    # If no history, prepend system prompt to current message
    if not contents:
        full_user_msg = f"{SYSTEM_PROMPT}\n\nUser question: {user_message}"
    else:
        full_user_msg = user_message

    contents.append({"role": "user", "parts": [{"text": full_user_msg}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
        }
    }

    last_error = "No endpoints tried"
    for endpoint_template in GEMINI_ENDPOINTS:
        url = endpoint_template.format(key=GEMINI_API_KEY)
        try:
            resp = requests.post(url, json=payload, timeout=20)
            data = resp.json()

            if resp.status_code == 200:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                model_name = url.split("models/")[1].split(":")[0]
                print(f"✅ Gemini success via: {model_name}")
                return text, None

            err_msg = data.get("error", {}).get("message", str(data))
            print(f"❌ {url.split('models/')[1].split('?')[0]}: {err_msg[:120]}")
            last_error = err_msg

        except Exception as e:
            print(f"❌ Exception: {e}")
            last_error = str(e)

    return None, last_error


# ── Smart offline fallback ─────────────────────────────────────────────────────
FALLBACK_RESPONSES = [
    (["adip", "assistive device", "wheelchair", "hearing aid"],
     "**ADIP Scheme – Assistive Devices**\n\n"
     "* Free/subsidised wheelchairs, hearing aids, white canes, Braille kits\n"
     "* **Eligibility:** 40%+ disability, income < ₹2,40,000/yr\n"
     "* **Apply:** https://disabilityaffairs.gov.in/"),

    (["udid", "unique disability", "disability id", "disability card"],
     "**UDID Card – Unique Disability Identity Card**\n\n"
     "* Single card accepted for all government schemes nationwide\n"
     "* **Eligibility:** Any PwD with 40%+ disability\n"
     "* **Apply:** https://www.swavlambancard.gov.in/"),

    (["disability certificate", "certificate", "how to get cert"],
     "**How to Get a Disability Certificate**\n\n"
     "* Visit nearest Government Hospital / District Hospital\n"
     "* Carry: Aadhaar, Passport Photo, medical records\n"
     "* Medical board assesses your disability %\n"
     "* Issued within 7–30 days — **Free of cost**"),

    (["scholarship", "education", "school", "college", "student", "study"],
     "**Education Schemes for PwD**\n\n"
     "* **Pre-Matric:** Class 9-10, ₹700–₹1,100/month\n"
     "* **Post-Matric:** Class 11+, up to ₹1,700/month\n"
     "* **Top Class:** Full fee at IIT/IIM/AIIMS\n"
     "* **National Fellowship:** PhD students, ₹31,000–₹35,000/month\n"
     "* **Apply:** https://scholarships.gov.in/"),

    (["pension", "financial", "money", "income support"],
     "**Financial / Pension Schemes**\n\n"
     "* **IGNDPS:** ₹300/month central pension (BPL + severe disabled)\n"
     "* **State Pension:** ₹400–₹1,500/month (varies by state)\n"
     "* **NHFDC Loans:** Up to ₹30 lakh at 5% interest\n"
     "* **Apply:** https://nsap.nic.in/"),

    (["health", "insurance", "hospital", "medical", "niramaya", "ayushman"],
     "**Health Schemes for PwD**\n\n"
     "* **Niramaya:** ₹1 lakh/year – autism, CP, intellectual disabilities\n"
     "* **Ayushman Bharat PM-JAY:** ₹5 lakh/year cashless coverage\n"
     "* **Apply:** https://pmjay.gov.in/ | https://thenationaltrust.gov.in/"),

    (["housing", "house", "home", "hostel", "awas", "accommodation"],
     "**Housing Schemes for PwD**\n\n"
     "* **PM Awas Yojana:** Ground floor priority, disability-friendly construction\n"
     "* Financial assistance up to ₹1.30 lakh\n"
     "* **Eligibility:** 40%+ disability, income < ₹3 lakh\n"
     "* **Apply:** https://pmayg.nic.in/"),

    (["employment", "job", "skill", "work", "training", "loan", "nhfdc"],
     "**Employment & Skill Schemes**\n\n"
     "* **NHFDC Loans:** Up to ₹30 lakh at 5% interest for self-employment\n"
     "* **NSTI Skill Training:** Free courses in 100+ trades, ₹1,500/month stipend\n"
     "* **DDRS:** Free vocational training via NGOs\n"
     "* **Apply:** https://www.nhfdc.nic.in/"),

    (["railway", "train", "travel", "concession", "ticket"],
     "**Railway Concession for PwD**\n\n"
     "* **75% off** on all train fares (+ 75% for one escort)\n"
     "* Valid on all classes including AC\n"
     "* Lower berth allotted on priority\n"
     "* **Documents:** Disability Certificate + Aadhaar"),

    (["aadhaar", "aadhar", "aadharcard", "adhar", "adharcard", "aadharcard"],
     "**How to Get Aadhaar Card**\n\n"
     "* Visit nearest Aadhaar Enrollment Centre (findmycsc.uidai.gov.in)\n"
     "* Carry any address proof (voter ID, utility bill, etc.)\n"
     "* Biometric capture: fingerprints + iris scan\n"
     "* Download e-Aadhaar at myaadhaar.uidai.gov.in\n"
     "* Physical card by post in ~90 days\n"
     "* **Cost:** Free | **Helpline:** 1947"),
]

def smart_fallback(user_message):
    msg = user_message.lower()
    for keywords, response in FALLBACK_RESPONSES:
        if any(kw in msg for kw in keywords):
            return response
    return (
        "Namaste! I'm Sahayak — your guide to government disability schemes in India.\n\n"
        "I can help with:\n"
        "* **ADIP Scheme** – Free assistive devices\n"
        "* **UDID Card** – Disability identity card\n"
        "* **Scholarships** – Pre-Matric, Post-Matric, Top Class\n"
        "* **Disability Pension** – IGNDPS, State pension\n"
        "* **Health Insurance** – Niramaya, Ayushman Bharat\n"
        "* **Housing** – PM Awas Yojana priority\n"
        "* **Employment** – NHFDC loans, NSTI skill training\n"
        "* **Railway Concession** – 75% off train tickets\n"
        "* **Disability Certificate** – How to get one\n"
        "* **Aadhaar Card** – How to enroll\n\n"
        "What would you like to know?"
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/status", methods=["GET"])
def get_status():
    test_reply, test_err = call_gemini_rest("Say OK in one word", [])
    return jsonify({
        "gemini_api_key_set": bool(GEMINI_API_KEY),
        "gemini_rest_works": test_reply is not None,
        "gemini_test_error": test_err,
        "mongo_available": mongo_available,
        "scheme_source": "mongo" if mongo_available else "json",
    })


@app.route("/api/list_models", methods=["GET"])
def list_models():
    """List all Gemini models available for this API key."""
    if not GEMINI_API_KEY:
        return jsonify({"error": "No API key set"}), 500
    try:
        # Try both v1 and v1beta
        results = {}
        for version in ["v1", "v1beta"]:
            url = f"https://generativelanguage.googleapis.com/{version}/models?key={GEMINI_API_KEY}"
            resp = requests.get(url, timeout=10)
            data = resp.json()
            if resp.status_code == 200:
                models = [m["name"] for m in data.get("models", [])
                          if "generateContent" in m.get("supportedGenerationMethods", [])]
                results[version] = models
            else:
                results[version] = {"error": data.get("error", {}).get("message", str(data))}
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/maps_key", methods=["GET"])
def get_maps_key():
    if not GOOGLE_MAPS_KEY:
        return jsonify({"error": "GOOGLE_MAPS_API_KEY not configured"}), 500
    return jsonify({"key": GOOGLE_MAPS_KEY})


@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify([
        {"id": "education",  "name": "Education / Scholarship",  "icon": "🎓", "color": "blue",   "description": "Scholarships & fellowships for students with disabilities"},
        {"id": "health",     "name": "Health Insurance",          "icon": "🏥", "color": "green",  "description": "Medical coverage & healthcare support schemes"},
        {"id": "housing",    "name": "Housing / Hostel",          "icon": "🏠", "color": "purple", "description": "Housing assistance & subsidised accommodation"},
        {"id": "financial",  "name": "Pension / Financial",       "icon": "💰", "color": "yellow", "description": "Disability pensions & financial aid programs"},
        {"id": "employment", "name": "Employment / Skills",       "icon": "💼", "color": "orange", "description": "Skill training, loans & employment support"},
        {"id": "other",      "name": "Other Schemes",             "icon": "📋", "color": "pink",   "description": "Assistive devices, ID cards & more"},
        {"id": "all",        "name": "All Schemes",               "icon": "🌐", "color": "indigo", "description": "Explore all 20+ government schemes at once"},
    ])


@app.route("/api/schemes", methods=["GET"])
def get_schemes():
    all_schemes = load_schemes()
    category = request.args.get("category")
    if category and category != "all":
        all_schemes = [s for s in all_schemes if s.get("category") == category]
    return jsonify(all_schemes)


@app.route("/api/check_eligibility", methods=["POST"])
def check_eligibility():
    from eligibility_engine import run_eligibility
    data    = request.get_json(force=True)
    schemes = load_schemes()
    results = run_eligibility(data, schemes)
    return jsonify(results)


@app.route("/api/document_guidance/<doc_id>", methods=["GET"])
def get_document_guidance(doc_id):
    guidance = load_json("document_guidance.json")
    if doc_id in guidance:
        return jsonify(guidance[doc_id])
    return jsonify({"error": "Guidance not found"}), 404


@app.route("/api/chat", methods=["POST"])
def chat():
    data         = request.get_json(force=True)
    user_message = data.get("message", "").strip()
    history      = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    # Try Gemini REST API first (no SDK required)
    reply, error = call_gemini_rest(user_message, history)
    if reply:
        return jsonify({"reply": reply, "engine": "gemini-1.5-flash"})

    print(f"Using offline fallback. Gemini error: {error}")
    return jsonify({"reply": smart_fallback(user_message), "engine": "offline"})


@app.route("/api/nearby_centers", methods=["GET"])
def nearby_centers():
    lat         = request.args.get("lat")
    lng         = request.args.get("lng")
    center_type = request.args.get("type", "government_office")

    if not lat or not lng:
        return jsonify({"error": "Missing lat or lng"}), 400

    type_map = {
        "hospital":      'node["amenity"="hospital"]',
        "bank":          'node["amenity"="bank"]',
        "post_office":   'node["amenity"="post_office"]',
        "school":        'node["amenity"="school"]',
        "internet_cafe": 'node["amenity"="internet_cafe"]',
        "studio":        'node["shop"="photo"]',
    }
    query_node = type_map.get(center_type, 'node["office"="government"]')

    overpass_query = f"""
    [out:json];
    ({query_node}(around:5000,{lat},{lng}););
    out center 10;
    """
    try:
        res     = requests.post("http://overpass-api.de/api/interpreter",
                                data={"data": overpass_query}, timeout=10)
        
        try:
            data = res.json()
        except ValueError:
            # Overpass API rate limited or returned HTML. Use mock data for demo.
            return jsonify([
                {"id": 1, "name": f"Government {center_type.replace('_',' ').title()} (Demo)", "address": "Sector 1, City Center", "lat": float(lat) + 0.005, "lng": float(lng) + 0.005, "type": center_type},
                {"id": 2, "name": f"Local Help Desk", "address": "Market Road", "lat": float(lat) - 0.008, "lng": float(lng) - 0.002, "type": center_type}
            ])

        centers = []
        for el in data.get("elements", []):
            centers.append({
                "id":      el.get("id"),
                "name":    el.get("tags", {}).get("name", f"Local {center_type.replace('_',' ').title()}"),
                "address": el.get("tags", {}).get("addr:full", "Address not specified."),
                "lat":     el.get("lat"),
                "lng":     el.get("lon"),
                "type":    center_type,
            })
        
        # If no centers found, return mock data anyway so the map isn't empty
        if not centers:
            return jsonify([
                {"id": 1, "name": f"Government {center_type.replace('_',' ').title()} (Demo)", "address": "Sector 1, City Center", "lat": float(lat) + 0.005, "lng": float(lng) + 0.005, "type": center_type},
                {"id": 2, "name": f"Local Help Desk", "address": "Market Road", "lat": float(lat) - 0.008, "lng": float(lng) - 0.002, "type": center_type}
            ])
            
        return jsonify(centers)
    except Exception as e:
        return jsonify({"error": "Map API failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
