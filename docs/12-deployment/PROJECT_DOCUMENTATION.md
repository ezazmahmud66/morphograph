# MorphoGraph
## Project Documentation

### 1. Project Overview
MorphoGraph is an AI-powered web application for brain tumor
MRI classification and segmentation using deep learning and
graph-based feature learning.

### 2. Key Features
- MRI image upload (JPG/PNG)
- Four-class classification: Glioma, Meningioma,
  Pituitary, and No Tumor
- Tumor segmentation visualization
- Region of Interest (ROI) visualization
- Prediction confidence scores
- Responsive user interface

### 3. Technology Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Python, FastAPI
- AI Framework: PyTorch
- Image Processing: OpenCV, Scikit-image
- Graph Learning: GAT with GRACE pretraining
- Classification: Adaptive Feature Fusion
- Version Control: Git and GitHub

### 4. System Workflow
MRI Upload
    |
Image Preprocessing
    |
Tumor Segmentation and ROI
    |
Feature Extraction
    |
Graph Learning and Adaptive Fusion
    |
Classification and Result Visualization

### 5. Installation
Requirements:
- Python and required backend dependencies
- Node.js and npm
- Trained model weights and graph artifacts

Install frontend dependencies:

    npm --prefix frontend install

Install backend dependencies using the configured
Python virtual environment:

    backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt

Model weights, scalers, and reference graph files
must be available in their expected local directories.

### 6. Running the Application
On the configured Windows development machine,
double-click:

    start-defense.bat

Alternatively, run the servers separately.

Backend:

    backend/.venv/Scripts/python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

Frontend:

    npm --prefix frontend run dev

Local Website:
http://localhost:5173

### 7. Testing Results
- Four-Class API Regression: 4/4 Passed
- Frontend Lint and Build: Passed
- Frontend-Backend Connectivity: Passed
- Browser End-to-End Test: Passed
- Research Artifact Integrity: 7/7 SHA-256 Matched
- Average API Response Time: 0.770 seconds

Performance results are based on four selected
MRI samples tested on the local CPU backend.

### 8. Deployment
Frontend:
https://ezazmahmud66.github.io/morphograph/

Backend:
http://127.0.0.1:8000

The GitHub Pages website hosts the frontend only.
AI predictions currently require the local backend.

### 9. Limitations
- Research prototype; not intended for clinical diagnosis
- Public backend deployment not implemented
- Full Kaggle-to-local numerical equivalence pending
- Production security and load testing pending
- Model weights and graph artifacts excluded from Git

### 10. Conclusion
MorphoGraph integrates deep learning, graph learning,
and adaptive feature fusion into a user-friendly
MRI analysis website.

The local application has passed its selected
functional and integration tests and is prepared
for capstone defense demonstration.
