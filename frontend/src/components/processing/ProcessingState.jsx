
const processingSteps = [
  {
    id: "validation",
    label: "Image validation",
    description: "Completed — Client-side validation only",
    status: "completed",
  },
  {
    id: "backend",
    label: "Backend connection",
    description: "Not configured",
    status: "pending",
  },
  {
    id: "inference",
    label: "Model inference",
    description: "Not started",
    status: "pending",
  },
];

function ProcessingState({ onCancel, onShowError }) {
  return (
    <section
      className="mx-auto w-full max-w-[760px]
                 rounded-[22px] border border-[#E0E8F3]
                 bg-white p-5 sm:p-[25px]"
      aria-labelledby="processing-title"
    >
      <h2
        id="processing-title"
        className="text-xl font-semibold
                   text-[#12233D] sm:text-2xl"
      >
        MRI Analysis
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-[#71829A]">
        Your MRI image has passed client-side validation.
      </p>

      {/* MRI illustration */}
      <div
        className="mx-auto mt-8 flex h-[185px]
                   w-full max-w-[210px] items-center
                   justify-center rounded-2xl
                   bg-[#EEF5FF] sm:mt-10 sm:max-w-[250px]"
        aria-hidden="true"
      >
        <span className="text-3xl font-semibold text-[#2463EB]">
          MRI
        </span>
      </div>

      {/* Explicit workflow statuses */}
      <div className="mt-8 space-y-5 sm:mt-10">
        {processingSteps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 text-lg ${
                step.status === "completed"
                  ? "text-emerald-600"
                  : "text-[#94A3B8]"
              }`}
              aria-hidden="true"
            >
              {step.status === "completed" ? "✓" : "○"}
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#12233D]">
                {step.label}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-[#71829A]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Backend availability notice */}
      <div
        className="mt-8 rounded-xl border border-amber-200
                   bg-amber-50 px-4 py-4"
        role="status"
      >
        <p className="text-sm font-semibold text-amber-900">
          Analysis is not available yet
        </p>

        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Your image is ready for analysis. The backend
          service and model inference are not connected.
          No MRI prediction or segmentation has been performed.
        </p>

        {/* Navigate to service details */}
        <button
          type="button"
          onClick={onShowError}
          className="mt-4 min-h-11 rounded-lg
                     border border-amber-300 bg-white
                     px-5 py-2.5 text-sm font-semibold
                     text-amber-900 transition-colors
                     hover:bg-amber-100
                     focus-visible:outline-2
                     focus-visible:outline-offset-2
                     focus-visible:outline-amber-600"
        >
          View service details
        </button>
      </div>

      {/* Back to upload */}
      <button
        type="button"
        onClick={onCancel}
        className="mt-8 min-h-12 w-full rounded-xl
                   bg-[#2463EB] px-6 py-3
                   font-semibold text-white
                   transition-colors hover:bg-[#1D4ED8]
                   focus-visible:outline-2
                   focus-visible:outline-offset-2
                   focus-visible:outline-[#2463EB]"
      >
        Back to upload
      </button>

      <p className="mt-5 text-xs leading-relaxed text-[#71829A]">
        Research prototype • Not intended for clinical use
      </p>
    </section>
  );
}

export default ProcessingState;
