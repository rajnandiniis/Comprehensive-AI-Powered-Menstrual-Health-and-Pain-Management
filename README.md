
# 🩸 MenstruAI: Intelligent Menstrual Health System

> Moving beyond simple tracking — predicting, understanding, and improving menstrual health using AI.

![License](https://img.shields.io/badge/license-MIT-green)
![Built With](https://img.shields.io/badge/Built%20With-AI%20%7C%20ML-blue)
![Focus](https://img.shields.io/badge/Focus-Privacy--First-orange)

---

## 🌟 Why This Project Exists

Most menstrual apps only answer one question:

👉 *“When is my next period?”*

**MenstruAI goes deeper:**

- How is your body responding?  
- Are there early signs of health issues?  
- What actions can improve your health?  

This project treats menstrual health as a **data-driven health problem**, not just a calendar reminder.

---

## 🎯 Real-World Impact

This system can help:

- 📅 Users predict irregular cycles more accurately  
- 🧠 Detect early patterns related to PCOS or hormonal imbalance  
- 💊 Provide basic guidance for pain and symptom management  
- 🔒 Keep sensitive health data private (local-first design)  

👉 Useful for students, working professionals, and anyone tracking menstrual health.

---

## 🚀 Features

### 🔮 Cycle Prediction
- Predicts future cycles using historical data  
- Considers stress, sleep, and activity levels  
- Uses ML models (regression + sequence-based approaches)  

---

### 🔬 Health Risk Detection
- Identifies potential risks like:
  - PCOS  
  - Diabetes  
  - Cardiovascular patterns  
- Combines structured data with basic analysis  

---

### 💬 AI Health Assistant
- Provides personalized suggestions for:
  - Pain management  
  - Lifestyle improvement  
- Uses NLP + retrieval-based responses (FAISS)  

---

## 🧠 Key Design Decisions

### ⚡ Edge / Local Optimization
- Runs without heavy cloud dependency  
- Faster and cost-efficient  

### 🔒 Privacy-First Approach
- User health data stored locally or securely  
- Minimal external exposure  

### 🧪 Experiment-Driven Development
- Built through iterative testing  
- Focus on practical usability  

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| UI / App | Streamlit |
| Frontend | React.js (optional modules) |
| Backend | Flask / Node.js |
| ML/AI | Scikit-learn, TensorFlow |
| Computer Vision | OpenCV |
| Data | Pandas, NumPy |
| Storage | Local storage / MongoDB |
| Search | FAISS |

---

## 🧩 System Overview

```mermaid
graph TD
    A[User Input / Health Data] --> B[Preprocessing]
    B --> C[Cycle Prediction Model]
    B --> D[Health Risk Detection]
    B --> E[AI Assistant]
    C --> F[Streamlit Dashboard]
    D --> F
    E --> F
    F --> G[Local Storage / Database]
````

---

## ⚙️ Running the Project

### 1. Clone Repository

```bash
git clone https://github.com/rajnandiniis/Comprehensive-AI-Powered-Menstrual-Health-and-Pain-Management
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Streamlit App

```bash
streamlit run app.py
```

---

## 📊 Results & Observations

* Improved cycle prediction consistency
* Built working disease prediction models
* Fast response time with local execution
* Demonstrated privacy-first health AI approach

---

## 🧠 What I Learned

* Data quality matters more than complex models
* Small design decisions impact results heavily
* Integrating multiple AI modules is challenging
* Privacy is critical in health applications

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## ⭐ Final Note

This project explores how AI can move from

**prediction → understanding → guidance**

in personal health systems.

If you found this interesting, consider giving it a ⭐
