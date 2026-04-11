"""
Sahayak – Eligibility Engine
Rule-based decision system that maps user profile + documents → scheme status.

Status types:
  eligible    – meets all criteria AND has all required documents
  grey_zone   – meets all criteria BUT is missing some documents
  not_eligible – fails at least one hard eligibility rule
"""

from typing import Any


def run_eligibility(user: dict, schemes: list) -> dict:
    """
    Parameters
    ----------
    user : dict
        Keys: age (int), income (int), disability_percent (int),
              documents (dict of str → bool)
    schemes : list
        Loaded from schemes.json
    Returns
    -------
    dict with keys: eligible, grey_zone, not_eligible, total,
                    eligible_count, grey_zone_count, score
    """
    age = int(user.get("age", 0))
    income = int(user.get("income", 0))
    disability_pct = int(user.get("disability_percent", 0))
    docs: dict[str, bool] = user.get("documents", {})

    results = []

    for scheme in schemes:
        rules: dict[str, Any] = scheme.get("eligibility_rules", {})
        required_doc_keys: list[str] = scheme.get("required_documents_keys", [])

        not_eligible_reason = None

        # ── 1. Disability percentage check ──────────────────────────────────
        min_disability = rules.get("min_disability_percent", 0)
        if disability_pct < min_disability:
            not_eligible_reason = (
                f"Your disability ({disability_pct}%) is below the "
                f"minimum required {min_disability}% for this scheme."
            )

        # ── 2. Income check ─────────────────────────────────────────────────
        max_income = rules.get("max_income")
        if not not_eligible_reason and max_income is not None:
            if income > max_income:
                not_eligible_reason = (
                    f"Your annual income ₹{income:,} exceeds the "
                    f"scheme limit of ₹{max_income:,}."
                )

        # ── 3. Age check ─────────────────────────────────────────────────────
        age_range = rules.get("age_range", [0, 100])
        if not not_eligible_reason:
            if not (age_range[0] <= age <= age_range[1]):
                not_eligible_reason = (
                    f"Your age ({age}) is outside the eligible range "
                    f"{age_range[0]}–{age_range[1]} years."
                )

        # ── Build result ─────────────────────────────────────────────────────
        if not_eligible_reason:
            results.append({
                "scheme_id":   scheme["id"],
                "scheme_name": scheme["name"],
                "category":    scheme.get("category", "other"),
                "description": scheme.get("description", ""),
                "benefits":    scheme.get("benefits", []),
                "apply_url":   scheme.get("apply_url", ""),
                "status":      "not_eligible",
                "reason":      not_eligible_reason,
                "missing_docs": [],
            })
            continue

        # ── 4. Document check ─────────────────────────────────────────────
        missing_docs = [
            key for key in required_doc_keys
            if not docs.get(key, False)
        ]

        status = "grey_zone" if missing_docs else "eligible"

        results.append({
            "scheme_id":   scheme["id"],
            "scheme_name": scheme["name"],
            "category":    scheme.get("category", "other"),
            "description": scheme.get("description", ""),
            "benefits":    scheme.get("benefits", []),
            "apply_url":   scheme.get("apply_url", ""),
            "status":      status,
            "reason":      None,
            "missing_docs": missing_docs,
        })

    eligible    = [r for r in results if r["status"] == "eligible"]
    grey_zone   = [r for r in results if r["status"] == "grey_zone"]
    not_eligible = [r for r in results if r["status"] == "not_eligible"]

    return {
        "eligible":        eligible,
        "grey_zone":       grey_zone,
        "not_eligible":    not_eligible,
        "total":           len(results),
        "eligible_count":  len(eligible),
        "grey_zone_count": len(grey_zone),
        "score": {
            "eligible": len(eligible),
            "total":    len(results),
        },
    }
