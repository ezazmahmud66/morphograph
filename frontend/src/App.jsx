
import { useState } from "react";

import Header from "./components/layout/Header";
import Hero from "./components/layout/Hero";
import MRIUpload from "./components/upload/MRIUpload";
import ProcessingState from "./components/processing/ProcessingState";
import ResearchOverview from "./components/research/ResearchOverview";
import { siteConfig } from "./config/site";

const WORKFLOW_STATES = {
  UPLOAD: "upload",
  PROCESSING: "processing",
  ERROR: "error",
};

function App() {
  const [workflowState, setWorkflowState] = useState(
    WORKFLOW_STATES.UPLOAD
  );

  // Start the frontend workflow after image validation
  function handleAnalyzeRequest() {
    setWorkflowState(WORKFLOW_STATES.PROCESSING);
  }

  // Show backend availability details
  function handleShowServiceError() {
    setWorkflowState(WORKFLOW_STATES.ERROR);
  }

  // Reset the workflow and return to upload
  function handleBackToUpload() {
    setWorkflowState(WORKFLOW_STATES.UPLOAD);
  }

  function renderActiveView() {
    switch (workflowState) {
      case WORKFLOW_STATES.PROCESSING:
        return (
          <ProcessingState
            onCancel={handleBackToUpload}
            onShowError={handleShowServiceError}
          />
        );

      case WORKFLOW_STATES.ERROR:
        return (
          <section
            className="mx-auto w-full max-w-[760px]
                       rounded-[22px] border border-red-200
                       bg-white p-5 sm:p-[25px]"
            aria-labelledby="error-title"
          >
            <div
              className="mx-auto flex h-14 w-14
                         items-center justify-center
                         rounded-full bg-red-50
                         text-2xl font-bold text-red-600"
              aria-hidden="true"
            >
              !
            </div>

            <h2
              id="error-title"
              className="mt-5 text-center text-xl
                         font-semibold text-[#12233D]
                         sm:text-2xl"
            >
              Analysis service unavailable
            </h2>

            <p
              className="mt-3 text-center text-sm
                         leading-relaxed text-[#71829A]"
            >
              The MRI analysis backend has not been
              configured yet. Your image passed
              client-side validation, but no model
              inference or segmentation was performed.
            </p>

            <div
              className="mt-6 rounded-xl border
                         border-amber-200 bg-amber-50
                         px-4 py-4"
              role="status"
            >
              <p className="text-sm font-semibold text-amber-900">
                Service status: Not configured
              </p>

              <p
                className="mt-2 text-sm leading-relaxed
                           text-amber-800"
              >
                Backend integration is planned for a
                later development phase. This is not
                an image validation failure.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackToUpload}
              className="mt-7 min-h-12 w-full
                         rounded-xl bg-[#2463EB]
                         px-6 py-3 font-semibold
                         text-white transition-colors
                         hover:bg-[#1D4ED8]
                         focus-visible:outline-2
                         focus-visible:outline-offset-2
                         focus-visible:outline-[#2463EB]"
            >
              Back to upload
            </button>

            <p
              className="mt-5 text-center text-xs
                         leading-relaxed text-[#71829A]"
            >
              Research prototype • Not intended for clinical use
            </p>
          </section>
        );

      case WORKFLOW_STATES.UPLOAD:
      default:
        return (
          <MRIUpload onAnalyze={handleAnalyzeRequest} />
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FE]">
      <Header />

      <main className="px-6 pb-12 sm:px-8">
        <Hero />

        {renderActiveView()}

        <ResearchOverview />
      </main>

      <footer className="px-6 pb-8 text-center">
        <p className="text-xs text-[#71829A]">
          {siteConfig.disclaimer}
        </p>
      </footer>
    </div>
  );
}

export default App;
