
import { useState } from "react";
import { useMRIUpload } from "../../hooks/useMRIUpload";

function MRIUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");

  const {
    selectedFile,
    previewUrl,
    error,
    isValidating,
    fileInputRef,
    handleFileSelect,
    openFilePicker,
    removeFile,
  } = useMRIUpload();

  const canAnalyze = Boolean(
    selectedFile && previewUrl && !isValidating && !error
  );

  function selectMRIFile(file) {
    setAnalysisMessage("");
    return handleFileSelect(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;

    if (files?.length > 0) {
      selectMRIFile(files[0]);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleAnalyze() {
    if (!canAnalyze) return;

    setAnalysisMessage(
      "MRI image is ready. Model analysis will become available after backend integration."
    );
  }

  function handleRemove() {
    removeFile();
    setAnalysisMessage("");
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <section
      className="mx-auto w-full max-w-[760px]
                 rounded-[22px] border border-[#E0E8F3]
                 bg-white p-5 sm:p-[25px]"
      aria-labelledby="upload-title"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        aria-label="Select brain MRI image"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            selectMRIFile(file);
          }

          event.target.value = "";
        }}
      />

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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mt-8 flex min-h-[230px]
                   flex-col items-center justify-center
                   rounded-2xl border border-dashed
                   px-3 py-6 text-center
                   transition-colors sm:mt-10 sm:px-4
                   ${
                     isDragging
                       ? "border-[#2463EB] bg-[#DBEAFE]"
                       : "border-[#AFC7F9] bg-[#EEF5FF]"
                   }`}
      >
        {previewUrl && selectedFile ? (
          <div className="flex w-full flex-col items-center">
            <img
              src={previewUrl}
              alt="Preview of selected MRI image"
              className="max-h-[260px] max-w-full
                         rounded-xl border border-[#DCE6F5]
                         bg-white object-contain shadow-sm"
            />

            <p
              className="mt-4 max-w-full break-all
                         text-sm font-semibold text-[#12233D]"
            >
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-[#71829A]">
              {formatFileSize(selectedFile.size)}
            </p>

            <p
              className="mt-3 text-xs font-medium
                         text-green-700"
              role="status"
            >
              Image uploaded successfully
            </p>
          </div>
        ) : (
          <>
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
              {isDragging
                ? "Drop your MRI image here"
                : "Drag & drop your MRI image"}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-[#71829A]">
              PNG, JPG or JPEG • Max 10 MB
            </p>
          </>
        )}

        {/* Image actions */}
        <div className="mt-5 flex flex-wrap
                        items-center justify-center gap-3">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isValidating}
            className="min-h-11 rounded-lg
                       border border-[#C5D8FA]
                       bg-white px-6 py-3 text-sm
                       font-semibold text-[#2463EB]
                       transition-colors hover:bg-blue-50
                       focus-visible:outline-2
                       focus-visible:outline-offset-2
                       focus-visible:outline-[#2463EB]
                       disabled:cursor-wait
                       disabled:opacity-60"
          >
            {isValidating
              ? "Validating..."
              : selectedFile
                ? "Replace image"
                : "Browse image"}
          </button>

          {selectedFile && !isValidating && (
            <button
              type="button"
              onClick={handleRemove}
              className="min-h-11 rounded-lg
                         border border-red-200
                         bg-white px-6 py-3 text-sm
                         font-semibold text-red-600
                         transition-colors hover:bg-red-50
                         focus-visible:outline-2
                         focus-visible:outline-offset-2
                         focus-visible:outline-red-500"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      {/* Validation feedback */}
      <div aria-live="polite" aria-atomic="true">
        {isValidating && (
          <p
            className="mt-4 text-sm font-medium text-[#2463EB]"
            role="status"
          >
            Validating your MRI image...
          </p>
        )}

        {error && !isValidating && (
          <div
            role="alert"
            className="mt-4 rounded-xl border
                       border-red-200 bg-red-50
                       px-4 py-3 text-sm text-red-700"
          >
            <p className="font-semibold">Upload failed</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        type="button"
        disabled={!canAnalyze}
        onClick={handleAnalyze}
        className="mt-8 min-h-12 w-full rounded-xl
                   bg-[#2463EB] px-6 py-3
                   font-semibold text-white
                   transition-colors hover:bg-[#1D4ED8]
                   focus-visible:outline-2
                   focus-visible:outline-offset-2
                   focus-visible:outline-[#2463EB]
                   disabled:cursor-not-allowed
                   disabled:opacity-60 sm:mt-9"
      >
        Analyze MRI →
      </button>

      {/* Analysis placeholder feedback */}
      {analysisMessage && (
        <div
          role="status"
          className="mt-4 rounded-xl border
                     border-blue-200 bg-blue-50
                     px-4 py-3 text-sm text-[#1D4ED8]"
        >
          {analysisMessage}
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-[#71829A]">
        Your image stays in this research workflow.
      </p>
    </section>
  );
}

export default MRIUpload;
