# MorphoGraph

### A Graph-Based Deep Learning Framework for Brain Tumor MRI Segmentation and Classification

MorphoGraph is a research-oriented web application designed for brain tumor MRI analysis using deep learning and graph-based learning techniques.

The application provides a simple and responsive interface where users can upload brain MRI scans, run model inference, and visualize classification and tumor segmentation results.

> **Project Status:** Under Development — Phase 01: GitHub Repository Setup

---

## Project Overview

Brain tumor analysis from magnetic resonance imaging (MRI) is an important application of medical image processing and deep learning.

MorphoGraph aims to provide an accessible research interface for evaluating trained brain MRI analysis models through an integrated web application.

The system is designed to support image preprocessing, tumor classification, segmentation visualization, and prediction confidence reporting.

## Key Features

The following features are planned for the web application:

- **MRI Image Upload:** Upload brain MRI images in supported formats.
- **Image Preview:** Preview selected MRI images before analysis.
- **Tumor Classification:** Predict among four classes: Glioma, Meningioma, Pituitary, and No Tumor.
- **Tumor Segmentation:** Visualize predicted tumor regions through segmentation masks.
- **Confidence Visualization:** Display model-generated class probabilities.
- **Processing Feedback:** Show loading indicators and processing status.
- **Responsive Interface:** Support desktop and mobile browsers.
- **Model Integration:** Connect trained deep learning and graph-based models to the application.

## System Workflow

```text
Brain MRI Image Upload
          |
          v
Image Validation
          |
          v
Image Preprocessing
          |
          v
Trained Model Inference
          |
          +---------------------+
          |                     |
          v                     v
Tumor Classification    Tumor Segmentation
          |                     |
          +----------+----------+
                     |
                     v
             Result Visualization
```

## Technology Stack

| Layer | Technology |
|---|---|
| UI/UX Design | Figma |
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Deep Learning | PyTorch |
| Graph Learning | PyTorch Geometric |
| Image Processing | OpenCV, NumPy |
| Version Control | Git, GitHub |

## Project Structure

```text
morphograph/
|
|-- frontend/
|-- backend/
|-- docs/
|   |-- architecture/
|   |-- screenshots/
|-- tests/
|-- .github/
|-- .gitignore
|-- README.md
```

The frontend and backend directories will contain application source code as development progresses.

## Development Roadmap

| Phase | Development Task | Status |
|---|---|---|
| 00 | Figma UI/UX Design | Completed |
| 01 | GitHub Repository Setup | In Progress |
| 02 | React + Vite + Tailwind Setup | Pending |
| 03 | Figma to React Implementation | Pending |
| 04 | Responsive Design | Pending |
| 05 | MRI Image Upload & Validation | Pending |
| 06 | Processing & Error States | Pending |
| 07 | FastAPI Backend Development | Pending |
| 08 | ML Model Integration | Pending |
| 09 | Classification & Segmentation Results | Pending |
| 10 | Frontend–Backend Integration | Pending |
| 11 | Testing & Optimization | Pending |
| 12 | Deployment & Documentation | Pending |

## Getting Started

Installation and execution instructions will be added after the frontend and backend setup phases are completed.

## Research and Development

MorphoGraph is developed as an academic capstone research project focusing on brain MRI classification and segmentation.

The application will serve as a web-based demonstration interface for the trained research models.

## Disclaimer

MorphoGraph is intended for academic research and educational demonstration only.

It is not a certified medical device and must not be used as a substitute for professional medical diagnosis, clinical interpretation, or treatment decisions.

## License

A project license has not yet been selected.

---

**MorphoGraph — Brain MRI Analysis Research Application**