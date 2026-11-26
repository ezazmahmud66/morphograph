
import base64
import io
import tempfile
import threading
from pathlib import Path
from functools import lru_cache

import cv2
from PIL import Image, UnidentifiedImageError

from fastapi import (
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware

from backend.app.services.mri_inference import (
    MorphoGRAFInference,
)


# ---------------------------------------
# Application Configuration
# ---------------------------------------

app = FastAPI(
    title="MorphoGraph API",
    description="Brain MRI Analysis Research Framework",
    version="0.2.0",
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_FORMATS = {
    "JPEG": ".jpg",
    "PNG": ".png",
}

inference_lock = threading.Lock()


# ---------------------------------------
# Model Loading
# ---------------------------------------

@lru_cache(maxsize=1)
def get_inference_model():
    """
    Load trained models once and reuse them.
    """
    return MorphoGRAFInference()


# ---------------------------------------
# Image Encoding
# ---------------------------------------

def encode_png_base64(image):
    """
    Convert a NumPy image into Base64 PNG.
    """
    success, encoded = cv2.imencode(
        ".png",
        image,
    )

    if not success:
        raise ValueError("Image encoding failed")

    return base64.b64encode(
        encoded.tobytes()
    ).decode("utf-8")


# ---------------------------------------
# Root Endpoint
# ---------------------------------------

@app.get("/")
def root():
    return {
        "application": "MorphoGraph",
        "message": "MorphoGraph API is running",
        "version": "0.2.0",
    }


# ---------------------------------------
# Health Endpoint
# ---------------------------------------

@app.get("/health")
def health_check():

    model_loaded = (
        get_inference_model.cache_info().currsize > 0
    )

    return {
        "status": "healthy",
        "service": "MorphoGraph Backend",
        "model_loaded": model_loaded,
        "inference_available": model_loaded,
    }


# ---------------------------------------
# MRI Prediction Endpoint
# ---------------------------------------

@app.post("/predict")
def predict_mri(
    file: UploadFile = File(...)
):
    """
    Upload an MRI and run MorphoGraph inference.
    """

    temporary_path = None

    try:
        # Validate declared content type.
        if file.content_type not in {
            "image/jpeg",
            "image/png",
        }:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG and PNG images are allowed",
            )

        # Read only up to the maximum size + 1 byte.
        content = file.file.read(
            MAX_FILE_SIZE + 1
        )

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty",
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Maximum file size is 10 MB",
            )

        # Verify actual image format.
        try:
            with Image.open(
                io.BytesIO(content)
            ) as image:

                actual_format = image.format
                image.verify()

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid or unreadable MRI image",
            )

        if actual_format not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail="Unsupported image format",
            )

        # Save the verified image temporarily.
        with tempfile.NamedTemporaryFile(
            suffix=ALLOWED_FORMATS[actual_format],
            delete=False,
        ) as temporary_file:

            temporary_file.write(content)

            temporary_path = Path(
                temporary_file.name
            )

        # Run the complete trained inference pipeline.
        # Serialize inference to avoid concurrent
        # memory-heavy graph operations.
        with inference_lock:

            model = get_inference_model()

            result = model.predict(
                temporary_path
            )

        # Encode mask and ROI for the frontend.
        mask_base64 = encode_png_base64(
            result["predicted_mask"]
        )

        roi_base64 = encode_png_base64(
            result["roi_image"]
        )

        return {
            "status": "success",
            "filename": file.filename,
            "prediction": {
                "class_id": result["predicted_class"],
                "class_name": result["predicted_label"],
                "confidence": result["confidence"],
                "probabilities": result["class_probabilities"],
            },
            "segmentation": {
                "mask": mask_base64,
                "format": "png",
                "width": 256,
                "height": 256,
            },
            "roi": {
                "image": roi_base64,
                "format": "png",
                "metadata": result["roi_metadata"],
            },
            "graph": {
                "embedding_shape": list(
                    result["graph_embedding_shape"]
                ),
            },
            "fusion": {
                "weights": result["fusion_weights"],
            },
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "MorphoGraph prediction error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="MRI prediction failed",
        ) from error

    finally:

        if temporary_path is not None:
            temporary_path.unlink(
                missing_ok=True
            )

        file.file.close()
