
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "")
).replace(/\/+$/, "");

export async function analyzeMRI(file, signal) {
  if (!(file instanceof File)) {
    throw new Error("Please select a valid MRI image.");
  }

  if (!API_BASE_URL) {
    throw new Error(
      "MRI analysis backend is not configured for this deployment."
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Cannot connect to the MRI analysis server.",
      { cause: error }
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;

    throw new Error(
      typeof detail === "string"
        ? detail
        : "MRI analysis failed. Please try again."
    );
  }

  if (
    data?.status !== "success" ||
    !data.prediction ||
    !data.segmentation?.mask ||
    !data.roi?.image
  ) {
    throw new Error(
      "The server returned an incomplete analysis result."
    );
  }

  return {
    predictedClass: data.prediction.class_name,
    confidence: data.prediction.confidence,
    probabilities: data.prediction.probabilities,

    segmentationImage:
      `data:image/png;base64,${data.segmentation.mask}`,

    roiImage:
      `data:image/png;base64,${data.roi.image}`,

    roiMetadata: data.roi.metadata,
    graph: data.graph,
    fusion: data.fusion,
  };
}
