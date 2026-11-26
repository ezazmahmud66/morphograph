
import math

import cv2
import numpy as np

from skimage.measure import (
    label,
    regionprops,
    perimeter_crofton
)


# Original Phase 06 Configuration
IMAGE_SIZE = 256
ROI_MARGIN_RATIO = 0.20
ROI_MIN_SIZE = 64
ROI_OUTPUT_SIZE = 256
EMPTY_MASK_POLICY = "full_mri"


# Original Phase 09 Feature Ordering
MORPH_FEATURE_NAMES = [
    "area",
    "area_ratio",
    "perimeter",
    "equivalent_diameter",
    "circularity",
    "eccentricity",
    "solidity",
    "extent",
    "bbox_width",
    "bbox_height",
    "aspect_ratio",
    "major_axis_length",
    "minor_axis_length",
    "axis_ratio",
    "centroid_x",
    "centroid_y",
    "component_count",
    "largest_component_ratio",
    "empty_mask",
]

MORPH_FEATURE_DIM = len(MORPH_FEATURE_NAMES)


def validate_mask(mask):
    """Validate an original 256x256 binary mask."""

    if not isinstance(mask, np.ndarray):
        raise TypeError("Mask must be a NumPy array")

    if mask.shape != (IMAGE_SIZE, IMAGE_SIZE):
        raise ValueError("Invalid mask dimensions")

    if mask.dtype != np.uint8:
        raise ValueError("Mask must be uint8")

    if not np.isin(mask, [0, 255]).all():
        raise ValueError("Mask must contain only 0 and 255")


def get_predicted_bbox(mask):
    """Bounding box covering all foreground pixels."""

    validate_mask(mask)

    if cv2.countNonZero(mask) == 0:
        return None

    x, y, width, height = cv2.boundingRect(mask)

    return {
        "bbox_x0": int(x),
        "bbox_y0": int(y),
        "bbox_x1": int(x + width),
        "bbox_y1": int(y + height),
        "bbox_width": int(width),
        "bbox_height": int(height),
    }


def get_expanded_roi_bbox(bbox):
    """Expand bounding box using original Phase 06 rules."""

    width = bbox["bbox_width"]
    height = bbox["bbox_height"]

    center_x = (
        bbox["bbox_x0"] + bbox["bbox_x1"]
    ) / 2.0

    center_y = (
        bbox["bbox_y0"] + bbox["bbox_y1"]
    ) / 2.0

    longest_side = max(width, height)

    expanded_side = math.ceil(
        longest_side * (1 + 2 * ROI_MARGIN_RATIO)
    )

    crop_size = min(
        IMAGE_SIZE,
        max(ROI_MIN_SIZE, expanded_side)
    )

    x0 = math.floor(center_x - crop_size / 2)
    y0 = math.floor(center_y - crop_size / 2)

    x0 = max(
        0,
        min(x0, IMAGE_SIZE - crop_size)
    )

    y0 = max(
        0,
        min(y0, IMAGE_SIZE - crop_size)
    )

    x1 = x0 + crop_size
    y1 = y0 + crop_size

    if not (
        x0 <= bbox["bbox_x0"]
        and y0 <= bbox["bbox_y0"]
        and x1 >= bbox["bbox_x1"]
        and y1 >= bbox["bbox_y1"]
    ):
        raise ValueError("ROI excludes predicted foreground")

    return {
        "roi_x0": int(x0),
        "roi_y0": int(y0),
        "roi_x1": int(x1),
        "roi_y1": int(y1),
        "roi_crop_size": int(crop_size),
    }


def extract_mask_guided_roi(image, mask):
    """Extract ROI using original Phase 06 algorithm."""

    if image.shape != (IMAGE_SIZE, IMAGE_SIZE):
        raise ValueError("Invalid MRI dimensions")

    if image.dtype != np.uint8:
        raise ValueError("MRI must be uint8")

    validate_mask(mask)

    predicted_pixels = int(cv2.countNonZero(mask))

    bbox = get_predicted_bbox(mask)

    # Empty mask: use original full MRI.
    if bbox is None:
        roi_image = image.copy()

        metadata = {
            "roi_mode": "full_mri_empty_mask",
            "bbox_x0": -1,
            "bbox_y0": -1,
            "bbox_x1": -1,
            "bbox_y1": -1,
            "bbox_width": 0,
            "bbox_height": 0,
            "roi_x0": 0,
            "roi_y0": 0,
            "roi_x1": IMAGE_SIZE,
            "roi_y1": IMAGE_SIZE,
            "roi_crop_size": IMAGE_SIZE,
            "predicted_foreground_pixels": 0,
            "roi_area_fraction": 1.0,
            "fallback_used": 1,
            "resize_applied": 0,
        }

        return roi_image, metadata

    # Non-empty mask: square bounding-box ROI.
    roi_bbox = get_expanded_roi_bbox(bbox)

    x0 = roi_bbox["roi_x0"]
    y0 = roi_bbox["roi_y0"]
    x1 = roi_bbox["roi_x1"]
    y1 = roi_bbox["roi_y1"]

    cropped_image = image[y0:y1, x0:x1].copy()
    cropped_mask = mask[y0:y1, x0:x1]

    if cv2.countNonZero(cropped_mask) != predicted_pixels:
        raise ValueError("Some foreground pixels were lost")

    resize_applied = int(
        cropped_image.shape != (
            ROI_OUTPUT_SIZE, ROI_OUTPUT_SIZE
        )
    )

    if resize_applied:
        roi_image = cv2.resize(
            cropped_image,
            (ROI_OUTPUT_SIZE, ROI_OUTPUT_SIZE),
            interpolation=cv2.INTER_LINEAR,
        )
    else:
        roi_image = cropped_image.copy()

    metadata = {
        "roi_mode": "predicted_mask_bbox",
        **bbox,
        **roi_bbox,
        "predicted_foreground_pixels": predicted_pixels,
        "roi_area_fraction": (
            cropped_image.size / image.size
        ),
        "fallback_used": 0,
        "resize_applied": resize_applied,
    }

    return roi_image, metadata


def extract_morphological_features(raw_mask):
    """Return the original Phase 09 19-D feature vector."""

    # Phase 09 accepts binary masks containing 0/1 or 0/255.
    if not isinstance(raw_mask, np.ndarray):
        raise TypeError("Mask must be a NumPy array")

    if raw_mask.shape != (IMAGE_SIZE, IMAGE_SIZE):
        raise ValueError("Invalid mask dimensions")

    if not np.isin(raw_mask, [0, 1, 255]).all():
        raise ValueError("Non-binary mask detected")

    mask = (raw_mask > 0).astype(np.uint8)

    height, width = mask.shape
    area = float(mask.sum())

    # Original empty-mask policy.
    if area == 0:
        features = np.zeros(
            MORPH_FEATURE_DIM,
            dtype=np.float32
        )
        features[-1] = 1.0
        return features

    # All foreground pixels form one aggregate region.
    region = regionprops(mask)[0]

    perimeter = float(
        perimeter_crofton(mask, directions=4)
    )

    area_ratio = area / (height * width)

    equivalent_diameter = np.sqrt(
        4.0 * area / np.pi
    )

    circularity = (
        4.0 * np.pi * area / perimeter**2
        if perimeter > 0 else 0.0
    )

    eccentricity = float(region.eccentricity)
    solidity = float(region.solidity)
    extent = float(region.extent)

    min_row, min_col, max_row, max_col = region.bbox

    bbox_width = float(max_col - min_col)
    bbox_height = float(max_row - min_row)

    aspect_ratio = (
        bbox_width / bbox_height
        if bbox_height > 0 else 0.0
    )

    major_axis = float(region.axis_major_length)
    minor_axis = float(region.axis_minor_length)

    axis_ratio = (
        minor_axis / major_axis
        if major_axis > 0 else 0.0
    )

    centroid_y, centroid_x = region.centroid

    centroid_x = float(centroid_x / (width - 1))
    centroid_y = float(centroid_y / (height - 1))

    connected_labels = label(
        mask,
        connectivity=2
    )

    component_sizes = np.bincount(
        connected_labels.ravel()
    )[1:]

    component_count = len(component_sizes)

    largest_component_ratio = (
        float(component_sizes.max() / area)
        if component_count > 0 else 0.0
    )

    features = np.asarray([
        area,
        area_ratio,
        perimeter,
        equivalent_diameter,
        circularity,
        eccentricity,
        solidity,
        extent,
        bbox_width,
        bbox_height,
        aspect_ratio,
        major_axis,
        minor_axis,
        axis_ratio,
        centroid_x,
        centroid_y,
        component_count,
        largest_component_ratio,
        0.0,
    ], dtype=np.float32)

    if not np.isfinite(features).all():
        raise ValueError("Non-finite morphological features")

    return features
