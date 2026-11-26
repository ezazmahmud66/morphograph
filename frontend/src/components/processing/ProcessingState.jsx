
function ProcessingState({ onCancel }) {
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
        <div className="text-center">
          <span className="block text-3xl font-semibold text-[#2463EB]">
            MRI
          </span>

          <div
            className="mx-auto mt-4 h-7 w-7 animate-spin
                       rounded-full border-[3px]
                       border-[#BFDBFE]
                       border-t-[#2463EB]"
          />
        </div>
      </div>

      {/* Actual request state */}
      <div
        className="mt-8 rounded-xl border border-[#C5D8FA]
                   bg-[#EEF5FF] px-4 py-5"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 h-5 w-5 shrink-0
                       animate-spin rounded-full
                       border-2 border-[#BFDBFE]
                       border-t-[#2463EB]"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-semibold text-[#12233D]">
              Analyzing your MRI
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#526782]">
              Your image has been submitted to the
              analysis workflow. The server response
              is pending.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow description without fake progress */}
      <div className="mt-8 space-y-5">
        <div className="flex items-start gap-3">
          <span
            className="text-lg text-emerald-600"
            aria-hidden="true"
          >
            ✓
          </span>

          <div>
            <p className="text-sm font-semibold text-[#12233D]">
              Image validation
            </p>

            <p className="mt-1 text-xs text-[#71829A]">
              Client-side validation completed.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span
            className="text-lg text-[#2463EB]"
            aria-hidden="true"
          >
            ◌
          </span>

          <div>
            <p className="text-sm font-semibold text-[#12233D]">
              Backend analysis
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[#71829A]">
              Awaiting the classification, segmentation,
              and feature analysis response.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel request */}
      <button
        type="button"
        onClick={onCancel}
        className="mt-8 min-h-12 w-full rounded-xl
                   border border-[#C5D8FA]
                   bg-white px-6 py-3
                   font-semibold text-[#2463EB]
                   transition-colors hover:bg-[#EEF5FF]
                   focus-visible:outline-2
                   focus-visible:outline-offset-2
                   focus-visible:outline-[#2463EB]"
      >
        Cancel analysis
      </button>

      <p className="mt-5 text-center text-xs leading-relaxed text-[#71829A]">
        Cancelling stops the browser request.
        Server-side processing may continue.
      </p>

      <p className="mt-3 text-center text-xs text-[#71829A]">
        Research prototype • Not intended for clinical use
      </p>
    </section>
  );
}

export default ProcessingState;
