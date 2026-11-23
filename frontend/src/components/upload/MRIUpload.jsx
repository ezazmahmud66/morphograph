
function MRIUpload() {
  return (
    <section
      className="mx-auto w-full max-w-[760px]
                 rounded-[22px] border border-[#E0E8F3]
                 bg-white p-5 sm:p-[25px]"
      aria-labelledby="upload-title"
    >
      <h2
        id="upload-title"
        className="text-xl font-semibold text-[#12233D]
                   sm:text-[22px]"
      >
        Upload MRI image
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-[#71829A]">
        Choose a brain MRI image to begin.
      </p>

      {/* MRI upload area */}
      <div
        className="mt-8 flex min-h-[230px]
                   flex-col items-center justify-center
                   rounded-2xl border border-dashed
                   border-[#AFC7F9] bg-[#EEF5FF]
                   px-3 py-6 text-center sm:mt-10 sm:px-4"
      >
        <div
          className="text-4xl font-semibold text-[#2463EB]"
          aria-hidden="true"
        >
          ↑
        </div>

        <p
          className="mt-4 text-sm font-semibold
                     leading-relaxed text-[#12233D]
                     sm:text-base"
        >
          Drag &amp; drop your MRI image
        </p>

        <p className="mt-2 text-xs leading-relaxed text-[#71829A]">
          PNG, JPG or JPEG • Max 10 MB
        </p>

        <button
          type="button"
          className="mt-5 min-h-11 rounded-lg
                     border border-[#C5D8FA]
                     bg-white px-6 py-3 text-sm
                     font-semibold text-[#2463EB]
                     transition-colors hover:bg-blue-50
                     focus-visible:outline-2
                     focus-visible:outline-offset-2
                     focus-visible:outline-[#2463EB]"
        >
          Browse image
        </button>
      </div>

      {/* Analyze button */}
      <button
        type="button"
        disabled
        className="mt-8 min-h-12 w-full rounded-xl
                   bg-[#2463EB] px-6 py-3
                   font-semibold text-white
                   disabled:cursor-not-allowed
                   disabled:opacity-60 sm:mt-9"
      >
        Analyze MRI →
      </button>

      <p className="mt-5 text-xs leading-relaxed text-[#71829A]">
        Your image stays in this research workflow.
      </p>
    </section>
  );
}

export default MRIUpload;
