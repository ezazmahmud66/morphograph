
from pathlib import Path
import base64
import io
import math
import sys

import numpy as np
import requests
from PIL import Image


API_URL = "http://127.0.0.1:8000/predict"

TEST_DIR = Path(__file__).resolve().parent / "sample_mri"

TEST_CASES = {
    "glioma": "glioma_test.jpg",
    "meningioma": "meningioma_test.jpg",
    "pituitary": "pituitary_test.jpg",
    "no_tumor": "no_tumor.jpg",
}

CLASS_NAMES = list(TEST_CASES.keys())


def decode_png(encoded_image):
    image_bytes = base64.b64decode(
        encoded_image,
        validate=True
    )

    with Image.open(io.BytesIO(image_bytes)) as image:
        if image.format != "PNG":
            raise ValueError("Expected PNG image")

        if image.size != (256, 256):
            raise ValueError("Incorrect image dimensions")

        return np.array(image.convert("L"))


def run_test(expected_class, filename):
    image_path = TEST_DIR / filename

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Missing test image: {image_path}"
        )

    with image_path.open("rb") as image_file:
        response = requests.post(
            API_URL,
            files={
                "file": (
                    filename,
                    image_file,
                    "image/jpeg"
                )
            },
            timeout=300
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"HTTP {response.status_code}: "
            f"{response.text[:300]}"
        )

    data = response.json()

    prediction = data["prediction"]

    predicted_class = prediction["class_name"]
    confidence = float(prediction["confidence"])
    probabilities = prediction["probabilities"]

    mask = decode_png(
        data["segmentation"]["mask"]
    )

    roi = decode_png(
        data["roi"]["image"]
    )

    foreground_pixels = int(
        np.count_nonzero(mask)
    )

    roi_mode = data["roi"]["metadata"]["roi_mode"]

    weights = data["fusion"]["weights"]

    checks = {
        "api_success": data["status"] == "success",
        "correct_class": predicted_class == expected_class,
        "confidence_valid": (
            math.isfinite(confidence)
            and 0.0 <= confidence <= 1.0
        ),
        "probability_keys": (
            set(probabilities) == set(CLASS_NAMES)
        ),
        "probability_sum": (
            all(
                math.isfinite(float(value))
                and 0.0 <= float(value) <= 1.0
                for value in probabilities.values()
            )
            and abs(
                sum(probabilities.values()) - 1.0
            ) < 1e-5
        ),
        "mask_shape": mask.shape == (256, 256),
        "roi_shape": roi.shape == (256, 256),
        "graph_embedding": (
            data["graph"]["embedding_shape"] == [1, 128]
        ),
        "fusion_weights": (
            len(weights) == 3
            and all(
                math.isfinite(float(w))
                and 0.0 <= float(w) <= 1.0
                for w in weights
            )
            and abs(sum(weights) - 1.0) < 1e-5
        ),
        "roi_mode_valid": roi_mode in {
            "predicted_mask_bbox",
            "full_mri_empty_mask"
        },
    }

    if expected_class == "no_tumor":
        checks["empty_mask"] = foreground_pixels == 0
        checks["full_mri_fallback"] = (
            roi_mode == "full_mri_empty_mask"
        )

    print(f"\n=== {expected_class.upper()} ===")
    print("Expected:", expected_class)
    print("Predicted:", predicted_class)
    print("Confidence:", f"{confidence * 100:.2f}%")
    print("Mask pixels:", foreground_pixels)
    print("ROI mode:", roi_mode)

    for name, passed in checks.items():
        print(
            f"  {name}: "
            f"{'PASS' if passed else 'FAIL'}"
        )

    return all(checks.values())


def main():
    print("=" * 55)
    print("MORPHOGRAPH — FOUR-CLASS API REGRESSION TEST")
    print("=" * 55)

    results = {}

    for expected_class, filename in TEST_CASES.items():
        try:
            results[expected_class] = run_test(
                expected_class,
                filename
            )

        except Exception as error:
            print(
                f"\n{expected_class.upper()} ERROR: "
                f"{type(error).__name__}: {error}"
            )

            results[expected_class] = False

    print("\n" + "=" * 55)
    print("FINAL TEST SUMMARY")
    print("=" * 55)

    for name, passed in results.items():
        print(
            f"{name}: "
            f"{'PASS' if passed else 'FAIL'}"
        )

    total_passed = sum(results.values())
    total_tests = len(results)

    print(
        f"\nPassed: {total_passed}/{total_tests}"
    )

    overall = all(results.values())

    print(
        "STATUS:",
        "PASSED" if overall else "FAILED"
    )

    sys.exit(0 if overall else 1)


if __name__ == "__main__":
    main()
