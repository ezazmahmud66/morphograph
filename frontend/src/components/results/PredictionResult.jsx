
const demoResult = {
  predictedClass: "Glioma",
  confidence: 0.946,
  originalImage: null,
  segmentationImage: null,
};

function PredictionResult({ result = demoResult }) {
  const confidence = Math.max(
    0,
    Math.min(100, Number(result.confidence) * 100 || 0)
  );

  const isDemo = result === demoResult;

  return (
    <section
      className="mx-auto w-full max-w-[760px]
                 rounded-[22px] border border-[#E0E8F3]
                 bg-white p-5 sm:p-[25px]"
      aria-labelledby="result-title"
    >
      <h2
        id="result-title"
        className="text-xl font-semibold text-[#12233D] sm:text-2xl"
      >
        Analysis results
      </h2>

      {isDemo && (
        <p className="mt-2 text-xs text-[#71829A]">
          Sample output — illustrative values only
        </p>
      )}

      {/* MRI visualization */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
        <div className="min-w-0">
          <div
            className="flex aspect-square items-center
                       justify-center overflow-hidden
                       rounded-xl bg-[#172940]
                       sm:aspect-auto sm:h-[185px]"
          >
            {result.originalImage ? (
              <img
                src={result.originalImage}
                alt="Original brain MRI scan"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xl font-semibold text-[#ADC8E6]">
                MRI
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-[#71829A]">
            Original scan
          </p>
        </div>

        <div className="min-w-0">
          <div
            className="flex aspect-square items-center
                       justify-center overflow-hidden
                       rounded-xl bg-[#172940]
                       sm:aspect-auto sm:h-[185px]"
          >
            {result.segmentationImage ? (
              <img
                src={result.segmentationImage}
                alt="Predicted tumor segmentation"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xl font-semibold text-[#75D5CA]">
                MASK
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-[#71829A]">
            Segmentation
          </p>
        </div>
      </div>

      {/* Classification */}
      <div className="mt-8">
        <p className="text-sm text-[#71829A]">
          Predicted class
        </p>

        <p className="mt-1 break-words text-2xl font-semibold text-[#12233D]">
          {result.predictedClass}
        </p>
      </div>

      {/* Confidence score */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-[#71829A]">
            Confidence
          </p>

          <span className="text-sm font-semibold text-[#2463EB]">
            {confidence.toFixed(1)}%
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

      <p className="mt-5 text-xs leading-relaxed text-[#71829A]">
        Research demonstration only — not for diagnosis.
      </p>
    </section>
  );
}

export default PredictionResult;
