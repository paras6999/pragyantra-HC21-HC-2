# Sahayak – Disability Scheme Assistant

> **"Our system doesn't just tell users what they qualify for — it tells them exactly what is stopping them and how to fix it."**

An AI-powered, multilingual web platform that helps **Persons with Disabilities (PwD)** in India navigate government welfare schemes — discover eligibility, identify missing documents, and get step-by-step guidance to apply.

---

## 🏆 Built At

**Pragyantra Hackathon – HC21-HC-2**

| Role | Contribution |
|---|---|
| Frontend Developer | React UI, Wizard, Results Dashboard, Voice, i18n |
| Backend Developer | Flask API, Eligibility Engine, REST Endpoints |
| Data / Logic | schemes.json (15 schemes), document_guidance.json |
| Documentation & Testing | README, Test Scenarios, QA |

---

## 🎯 Problem Statement

In India, there are **30+ government schemes** for Persons with Disabilities. Yet most PwDs:
- Don't know which schemes they qualify for
- Miss out due to **missing documents** (not ineligibility)
- Find the process confusing, intimidating, and inaccessible

**Sahayak solves this** with a guided, conversational eligibility checker that categorises outcomes and provides actionable document guidance.

---

## ✨ Key Features

### 🔍 Eligibility Discovery Engine
- 4-step wizard collects name, age, income, disability %, and documents
- Rule-based engine evaluates user against **15 real government schemes**
- 3 outcome states: **Eligible ✅ · Grey Zone 🟡 · Not Eligible ❌**

### 📂 Document Guidance System
- For each missing document: **where to go, what to bring, how long it takes, cost**
- Covers 15 document types (Aadhaar, Income Certificate, Disability Certificate, etc.)

### 🔓 Document Unlock Engine
- Tells users: *"Get your Income Certificate → unlock 4 more schemes"*
- Prioritises the single document that unlocks the most schemes

### 🎤 Voice Assistant
- Accept Yes/No answers by voice (Web Speech API)
- Navigate category cards by saying the category name
- Works in English, Hindi, and Marathi

### 🌐 Multilingual Support
- Full UI available in **English · Hindi (हिन्दी) · Marathi (मराठी)**

### ♿ Accessibility
- Large tap targets (min 44×44px)
- Keyboard navigation with focus rings
- Screen reader friendly `aria-label` on all interactive elements
- High contrast dark UI

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python, Flask, Flask-CORS |
| Data | JSON (schemes.json, document_guidance.json) |
| Voice | Web Speech API (browser-native) |
| Routing | React Router DOM v6 |

---

## 📁 Project Structure

```
pragyantra-HC21-HC-2/
├── backend/
│   ├── app.py                  # Flask API server (4 endpoints)
│   ├── eligibility_engine.py   # Rule-based eligibility logic
│   ├── schemes.json            # 15 real PwD government schemes
│   ├── document_guidance.json  # Step-by-step doc guidance (15 docs)
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Hero + category cards
│   │   │   ├── WizardPage.jsx      # 4-step eligibility wizard
│   │   │   └── ResultsPage.jsx     # Eligibility results dashboard
│   │   ├── components/
│   │   │   ├── Wizard/             # Step1–Step4 components
│   │   │   ├── Results/            # SchemeCard, EligibilityBadge, Score
│   │   │   ├── Guidance/           # DocumentGuidancePanel
│   │   │   ├── Hero/               # CategoryCard
│   │   │   ├── Voice/              # VoiceButton
│   │   │   └── shared/             # ToggleSwitch, ProgressBar, LanguageSwitcher
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global state (wizard, lang, results)
│   │   ├── i18n/
│   │   │   ├── en.json             # English translations
│   │   │   ├── hi.json             # Hindi translations
│   │   │   └── mr.json             # Marathi translations
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Glassmorphism, animations, utilities
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pragyantra-HC21-HC-2.git
cd pragyantra-HC21-HC-2
```

---

### 2. Start the Backend

```bash
cd backend
pip install flask flask-cors
python app.py
```

Backend runs at: `http://localhost:5000`

---

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Returns 7 scheme categories |
| `GET` | `/api/schemes` | Returns all 15 schemes |
| `POST` | `/api/check_eligibility` | Runs eligibility engine on user data |
| `GET` | `/api/document_guidance/<doc_id>` | Returns guidance for a specific document |

### Sample POST `/api/check_eligibility`

**Request:**
```json
{
  "age": 22,
  "income": 120000,
  "disability_percent": 50,
  "documents": {
    "aadhaar_card": true,
    "disability_certificate": true,
    "passport_photo": true,
    "bank_account": false,
    "income_certificate": false,
    "residence_proof": true
  }
}
```

**Response:**
```json
{
  "eligible": [...],
  "grey_zone": [...],
  "not_eligible": [...],
  "eligible_count": 4,
  "grey_zone_count": 6,
  "total": 15,
  "score": { "eligible": 4, "total": 15 }
}
```

---

## 📊 Schemes Covered

| Category | Schemes |
|---|---|
| 🎓 Education | Pre-Matric Scholarship, Post-Matric Scholarship, National Fellowship, Top Class Education Scholarship |
| 🏥 Health | Niramaya Health Insurance, Early Intervention (National Trust) |
| 🏠 Housing | PM Awas Yojana (PwD Priority) |
| 💰 Financial | IGNDPS Pension, State Disability Pension |
| 💼 Employment | NHFDC Concessional Loans, DDRS, NSTI Skill Training |
| 📋 Other | UDID Card, ADIP Scheme, Railway Concession Pass |

---

## 🧪 Test Scenarios

| Scenario | Expected Result |
|---|---|
| Age 22, Income ₹1,20,000, Disability 50%, All docs | Mostly **Eligible** |
| Age 16, Income ₹80,000, Disability 45%, Missing bank account | **Grey Zone** for education schemes |
| Age 30, Income ₹9,00,000, Disability 60% | Education scholarships **Not Eligible** (income too high) |
| Disability 25% | All major schemes **Not Eligible** |
| No disability certificate | All schemes **Not Eligible** (disability = 0%) |

---

## 🌐 Multilingual Testing

| Language | How to Switch |
|---|---|
| English | Click **EN** in the top nav |
| Hindi | Click **हि** |
| Marathi | Click **म** |

Voice input automatically adjusts to the selected language.

---

## 📌 Important Note

> Voice input requires **Google Chrome** (uses `webkitSpeechRecognition`). It will not work in Firefox or Safari.

---

## 📄 License

Built for the **Pragyantra Hackathon 2025**. For educational and demonstration purposes.

---

*Sahayak — सहायक — meaning "Helper" in Hindi and Marathi.*
