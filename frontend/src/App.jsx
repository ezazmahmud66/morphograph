
import { useEffect, useRef, useState } from "react";

import Header from "./components/layout/Header";
import Hero from "./components/layout/Hero";
import MRIUpload from "./components/upload/MRIUpload";
import ProcessingState from "./components/processing/ProcessingState";
import PredictionResult from "./components/results/PredictionResult";
import ResearchOverview from "./components/research/ResearchOverview";

import { siteConfig } from "./config/site";
import { analyzeMRI } from "./services/mriApi";

const WORKFLOW_STATES = {
  UPLOAD: "upload",
  PROCESSING: "processing",
  RESULT: "result",
  ERROR: "error",
};

function App() {
  const [workflowState, setWorkflowState] = useState(
    WORKFLOW_STATES.UPLOAD
  );

  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const abortControllerRef = useRef(null);
  const imageUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  function clearPreviousImage() {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }
  }

  function handleBackToUpload() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    clearPreviousImage();

    setAnalysisResult(null);
    setErrorMessage("");
    setWorkflowState(WORKFLOW_STATES.UPLOAD);
  }

  async function handleAnalyzeRequest(file) {
    if (!(file instanceof File)) {
      setErrorMessage("Please select a valid MRI image.");
      setWorkflowState(WORKFLOW_STATES.ERROR);
      return;
    }

    abortControllerRef.current?.abort();
    clearPreviousImage();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const originalImageUrl = URL.createObjectURL(file);
    imageUrlRef.current = originalImageUrl;

    setAnalysisResult(null);
    setErrorMessage("");
    setWorkflowState(WORKFLOW_STATES.PROCESSING);

    try {
      const result = await analyzeMRI(file, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      setAnalysisResult({
        ...result,
        originalImage: originalImageUrl,
      });

      setWorkflowState(WORKFLOW_STATES.RESULT);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "MRI analysis failed. Please try again."
      );

      setWorkflowState(WORKFLOW_STATES.ERROR);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }

  function renderActiveView() {
    switch (workflowState) {
      case WORKFLOW_STATES.PROCESSING:
        return (
          <ProcessingState
            onCancel={handleBackToUpload}
          />
        );

      case WORKFLOW_STATES.RESULT:
        return analysisResult ? (
          <div>
            <PredictionResult result={analysisResult} />

            <div className="mx-auto mt-5 max-w-[760px]">
              <button
                type="button"
                onClick={handleBackToUpload}
                className="min-h-12 w-full rounded-xl
                           bg-[#2463EB] px-6 py-3
                           font-semibold text-white
                           hover:bg-[#1D4ED8]"
              >
                Analyze another MRI
              </button>
            </div>
          </div>
        ) : null;

      case WORKFLOW_STATES.ERROR:
        return (
          <section
            className="mx-auto w-full max-w-[760px]
                       rounded-[22px] border border-red-200
                       bg-white p-5 sm:p-[25px]"
            role="alert"
          >
            <h2 className="text-xl font-semibold text-[#12233D]">
              MRI analysis failed
            </h2>

            <p className="mt-4 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={handleBackToUpload}
              className="mt-7 min-h-12 w-full rounded-xl
                         bg-[#2463EB] px-6 py-3
                         font-semibold text-white"
            >
              Back to upload
            </button>
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
