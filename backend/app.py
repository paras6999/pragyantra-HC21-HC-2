from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

BASE = os.path.dirname(__file__)


def load_json(filename):
    with open(os.path.join(BASE, filename), encoding="utf-8") as f:
        return json.load(f)


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
    return jsonify(load_json("schemes.json"))


# ── POST /api/check_eligibility ────────────────────────────────────────────────
@app.route("/api/check_eligibility", methods=["POST"])
def check_eligibility():
    from eligibility_engine import run_eligibility
    data = request.get_json(force=True)
    schemes = load_json("schemes.json")
    results = run_eligibility(data, schemes)
    return jsonify(results)


# ── GET /api/document_guidance/<doc_id> ───────────────────────────────────────
@app.route("/api/document_guidance/<doc_id>", methods=["GET"])
def get_document_guidance(doc_id):
    guidance = load_json("document_guidance.json")
    if doc_id in guidance:
        return jsonify(guidance[doc_id])
    return jsonify({"error": "Guidance not found for this document"}), 404


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
