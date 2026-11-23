
const processingSteps = [
  { label: "Image uploaded", completed: true },
  { label: "Preprocessing complete", completed: true },
  { label: "Running model inference...", completed: false },
];

function ProcessingState() {
  return (
    <section
      className="mx-auto w-full max-w-[760px] rounded-[22px]
                 border border-[#E0E8F3] bg-white p-6 sm:p-[25px]"
      aria-labelledby="processing-title"
      aria-busy="true"
    >
      <h2
        id="processing-title"
        className="text-xl font-semibold text-[#12233D] sm:text-2xl"
      >
        Analyzing your MRI
      </h2>

      <p className="mt-2 text-sm text-[#71829A]">
        Processing your image with the selected model.
      </p>

      {/* MRI processing illustration */}
      <div
        className="mx-auto mt-10 flex h-[185px] w-[210px]
                   items-center justify-center rounded-2xl
                   bg-[#EEF5FF] sm:w-[250px]"
      >
        <span className="text-3xl font-semibold text-[#2463EB]">
          MRI
        </span>
      </div>

      {/* Processing status */}
      <div
        className="mt-10 space-y-4"
        role="status"
        aria-live="polite"
      >
        {processingSteps.map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-3"
          >
            <span
              className={
                step.completed
                  ? "text-emerald-600"
                  : "animate-pulse text-[#2463EB]"
              }
              aria-hidden="true"
            >
              {step.completed ? "●" : "◌"}
            </span>

            <span
              className={
                step.completed
                  ? "text-sm font-medium text-emerald-700"
                  : "text-sm font-medium text-[#2463EB]"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Illustrative progress indicator */}
      <div
        className="mt-7 h-2.5 w-full overflow-hidden
                   rounded-full bg-[#EEF5FF]"
        role="progressbar"
        aria-label="Illustrative processing progress"
        aria-valuenow={65}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full w-[65%] rounded-full
                     bg-[#2463EB] transition-all"
        />
      </div>

      <p className="mt-3 text-xs text-[#71829A]">
        Processing interface preview — progress is illustrative.
      </p>
    </section>
  );
}

export default ProcessingState;
