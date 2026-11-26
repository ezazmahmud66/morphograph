
const CLASS_LABELS = {
  glioma: "Glioma",
  meningioma: "Meningioma",
  pituitary: "Pituitary",
  no_tumor: "No Tumor",
};

function PredictionResult({ result }) {
  if (!result) {
    return null;
  }

  const confidence = Math.max(
    0,
    Math.min(100, Number(result.confidence) * 100 || 0)
  );

  const predictedClass =
    CLASS_LABELS[result.predictedClass] ||
    result.predictedClass;

  const probabilities = Object.entries(
    result.probabilities || {}
  );

  const images = [
    {
      id: "original",
      label: "Original MRI",
      alt: "Uploaded brain MRI scan",
      src: result.originalImage,
    },
    {
      id: "segmentation",
      label: "Segmentation Mask",
      alt: "Predicted binary tumor segmentation mask",
      src: result.segmentationImage,
    },
    {
      id: "roi",
      label: "Extracted ROI",
      alt: "Mask-guided region of interest",
      src: result.roiImage,
    },
  ];

  return (
    <section
      className="mx-auto w-full max-w-[760px]
                 rounded-[22px] border border-[#E0E8F3]
                 bg-white p-5 sm:p-[25px]"
      aria-labelledby="result-title"
    >
      <h2
        id="result-title"
        className="text-xl font-semibold
                   text-[#12233D] sm:text-2xl"
      >
        Analysis results
      </h2>

      <p className="mt-2 text-sm text-[#71829A]">
        Analysis completed using the MorphoGraph
        research inference pipeline.
      </p>

      {/* MRI Images */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
        {images.map((image) => (
          <div key={image.id} className="min-w-0">
            <div
              className="flex aspect-square items-center
                         justify-center overflow-hidden
                         rounded-xl bg-[#172940]"
            >
              {image.src ? (
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm text-[#ADC8E6]">
                  Unavailable
                </span>
              )}
            </div>

            <p className="mt-2 text-center text-xs text-[#71829A]">
              {image.label}
            </p>
          </div>
        ))}
      </div>

      {/* Predicted Class */}
      <div className="mt-8 rounded-xl bg-[#EEF5FF] px-5 py-5">
        <p className="text-sm text-[#71829A]">
          Predicted class
        </p>

        <p
          className="mt-2 text-2xl font-semibold
                     text-[#12233D]"
        >
          {predictedClass}
        </p>

        <p className="mt-2 text-sm text-[#526782]">
          Model confidence: {confidence.toFixed(2)}%
        </p>
      </div>

      {/* Confidence Bar */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-[#71829A]">
            Prediction confidence
          </p>

          <span className="text-sm font-semibold text-[#2463EB]">
            {confidence.toFixed(2)}%
          </span>
        </div>

        <div
          className="h-2.5 w-full overflow-hidden
                     rounded-full bg-[#EEF5FF]"
          role="progressbar"
          aria-label="Prediction confidence"
          aria-valuenow={confidence}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#2463EB]"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Four-Class Probabilities */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-[#12233D]">
          Class probabilities
        </h3>

        <div className="mt-5 space-y-5">
          {probabilities.map(([name, probability]) => {
            const percentage = Math.max(
              0,
              Math.min(
                100,
                Number(probability) * 100 || 0
              )
            );

            return (
              <div key={name}>
                <div
                  className="mb-2 flex items-center
                             justify-between gap-3"
                >
                  <span className="text-sm text-[#526782]">
                    {CLASS_LABELS[name] || name}
                  </span>

                  <span
                    className="text-sm font-semibold
                               text-[#12233D]"
                  >
                    {percentage.toFixed(2)}%
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden
                             rounded-full bg-[#EEF5FF]"
                >
                  <div
                    className="h-full rounded-full bg-[#2463EB]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROI Information */}
      {result.roiMetadata?.roi_mode && (
        <div
          className="mt-8 rounded-xl border
                     border-[#E0E8F3] bg-[#F8FAFD]
                     px-4 py-4"
        >
          <h3 className="text-sm font-semibold text-[#12233D]">
            Region of interest
          </h3>

          <p className="mt-2 text-xs text-[#71829A]">
            Extraction mode: {result.roiMetadata.roi_mode}
          </p>
        </div>
      )}

      {/* Research Disclaimer */}
      <p
        className="mt-8 text-xs leading-relaxed
                   text-[#71829A]"
      >
        Research prototype only. Model confidence is
        not a clinical probability. Results are not
        intended for medical diagnosis or treatment.
      </p>
    </section>
  );
}

export default PredictionResult;
