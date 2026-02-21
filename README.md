# StudyTracker - Full Stack GPA Calculator

StudyTracker is a web-based grade and GPA tracking application optimized for Atlas University’s grading system. It is designed to handle university-specific grading edge cases, such as retaking failed courses without duplicating credit weights and calculating the minimum required score for final exams based on institutional passing thresholds.

## Features
* **Atlas University Integration:** Pre-configured with the university's specific letter grade coefficients and 40-point final exam barrier rule.
* **Dynamic GPA/CGPA Calculation:** Real-time updates based on user inputs for each semester.
* **Retake Course Logic:** Replaces old F/D grades in the CGPA calculation without adding extra credits to the total denominator, ensuring an accurate cumulative average.
* **Target Score Predictor:** Calculates the exact score needed on remaining exams (e.g., Finals) to pass the course with at least a 50 average.
* **Secure User Sessions:** Isolated data management for individual users via a FastAPI backend.

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
