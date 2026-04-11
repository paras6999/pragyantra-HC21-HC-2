from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder=".")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/api/check_eligibility", methods=["POST"])
def check_eligibility():
    data = request.get_json()

    # Extract input fields (for future use in logic layer)
    age = data.get("age")
    income = data.get("income")
    disability_type = data.get("disability_type")
    disability_percent = data.get("disability_percent")

    # Hardcoded dummy response — logic to be implemented in next iteration
    response = {
        "eligible": [],
        "ineligible": [],
        "grey_zone": []
    }

    return jsonify(response), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
