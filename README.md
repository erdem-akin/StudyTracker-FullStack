# StudyTracker - Full Stack GPA Calculator

StudyTracker is a web-based grade and GPA tracking application. It is designed to handle specific university grading edge cases, such as retaking failed courses without duplicating credit weights, and calculating the minimum required score for final exams based on university-specific passing thresholds.

## Features
* **Dynamic GPA/CGPA Calculation:** Real-time updates based on user inputs.
* **Retake Course Logic:** Replaces old F/D grades in the CGPA calculation without adding extra credits to the total denominator.
* **Target Score Predictor:** Calculates the exact score needed on remaining exams (e.g., Finals) to pass the course, including minimum bar limits (e.g., min 40 rule).
* **Secure User Sessions:** Isolated data management for individual users.

## Tech Stack
* **Frontend:** React.js, Vite
* **Backend:** Python, FastAPI
* **Database:** SQLite, SQLAlchemy (ORM)

## How to Run Locally

1. **Backend (API):**
   ```bash
   cd study-tracker-api
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8001
   ```
2.  **Frontend (Client):**
   ```bash
   cd study-tracker-frontend
   npm install
   npm run dev
   ```
