"""
seed_mongo.py – Run once to load all schemes from schemes.json into MongoDB.
Usage:  python seed_mongo.py
"""
import json, os, sys
from pymongo import MongoClient
from dotenv import load_dotenv

BASE = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE, ".env"))

MONGO_URI = os.environ.get("MONGO_URI")
DB_NAME   = os.environ.get("MONGO_DB", "sahayak")
COL_NAME  = os.environ.get("MONGO_COLLECTION", "schemes")

if not MONGO_URI:
    print("ERROR: MONGO_URI not set in .env file")
    sys.exit(1)

try:
    mc  = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
    mc.admin.command("ping")
    print("✅  Connected to MongoDB Atlas!")
except Exception as e:
    print(f"❌  Connection failed: {e}")
    sys.exit(1)

col = mc[DB_NAME][COL_NAME]

with open(os.path.join(BASE, "schemes.json"), encoding="utf-8") as f:
    schemes = json.load(f)

col.delete_many({})           # clear old data
col.insert_many(schemes)      # insert fresh
print(f"✅  Seeded {len(schemes)} schemes into {DB_NAME}.{COL_NAME}")
mc.close()
