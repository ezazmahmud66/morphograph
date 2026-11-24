
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize MorphoGraph backend application
app = FastAPI(
    title="MorphoGraph API",
    description="Backend API for Brain MRI Analysis Research Framework",
    version="0.1.0",
)

# Allowed React development origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Configure Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)


# Root endpoint
@app.get("/")
def root():
    return {
        "application": "MorphoGraph",
        "message": "MorphoGraph API is running",
        "version": "0.1.0",
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MorphoGraph Backend",
        "model_loaded": False,
        "inference_available": False,
    }
