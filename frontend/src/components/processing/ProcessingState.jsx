
const processingSteps = [
  { label: "Image uploaded", completed: true },
  { label: "Preprocessing complete", completed: true },
  { label: "Running model inference...", completed: false },
];

function ProcessingState() {
  return (
    <section
      className="mx-auto w-full max-w-[760px]
                 rounded-[22px] border border-[#E0E8F3]
                 bg-white p-5 sm:p-[25px]"
      aria-labelledby="processing-title"
      aria-busy="true"
    >
      <h2
        id="processing-title"
        className="text-xl font-semibold text-[#12233D] sm:text-2xl"
      >
        Analyzing your MRI
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-[#71829A]">
        Processing your image with the selected model.
      </p>

      {/* Processing illustration */}
      <div
        className="mx-auto mt-8 flex h-[185px]
                   w-full max-w-[210px] items-center
                   justify-center rounded-2xl
                   bg-[#EEF5FF] sm:mt-10 sm:max-w-[250px]"
      >
        <span className="text-3xl font-semibold text-[#2463EB]">
          MRI
        </span>
      </div>

      {/* Processing steps */}
      <div className="mt-8 space-y-4 sm:mt-10" role="status">
        {processingSteps.map((step) => (
          <div key={step.label} className="flex items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 ${
                step.completed
                  ? "text-emerald-600"
                  : "animate-pulse text-[#2463EB]"
              }`}
              aria-hidden="true"
            >
              {step.completed ? "●" : "◌"}
            </span>

            <span
              className={`text-sm leading-relaxed font-medium ${
                step.completed
                  ? "text-emerald-700"
                  : "text-[#2463EB]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Illustrative loading indicator */}
      <div
        className="mt-7 h-2.5 w-full overflow-hidden
                   rounded-full bg-[#EEF5FF]"
        role="progressbar"
        aria-label="Illustrative processing progress"
        aria-valuenow={65}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full w-[65%] rounded-full bg-[#2463EB]" />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#71829A]">
        Processing interface preview — progress is illustrative.
      </p>
    </section>
  );
}

export default ProcessingState;
