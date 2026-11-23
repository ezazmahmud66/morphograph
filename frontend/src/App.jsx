
import { useState } from "react";

import Header from "./components/layout/Header";
import Hero from "./components/layout/Hero";
import MRIUpload from "./components/upload/MRIUpload";
import ProcessingState from "./components/processing/ProcessingState";
import PredictionResult from "./components/results/PredictionResult";
import ResearchOverview from "./components/research/ResearchOverview";
import { siteConfig } from "./config/site";


const previewOptions = [
  { label: "Upload", value: "upload" },
  { label: "Processing", value: "processing" },
  { label: "Result", value: "result" },
];

function App() {
  const [activeView, setActiveView] = useState("upload");

  function renderActiveView() {
    switch (activeView) {
      case "processing":
        return <ProcessingState />;

      case "result":
        return <PredictionResult />;

      case "upload":
      default:
        return <MRIUpload />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FE]">
      <Header />

      <main className="px-6 pb-12 sm:px-8">
        <Hero />

        {/* Temporary design preview controls */}
        <div className="mx-auto mb-6 flex max-w-[760px] flex-col items-center gap-3">
          <p className="text-xs font-medium text-[#71829A]">
            Design Preview — Select UI State
          </p>

          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Preview interface state"
          >
            {previewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveView(option.value)}
                aria-pressed={activeView === option.value}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  activeView === option.value
                    ? "border-[#2463EB] bg-[#2463EB] text-white"
                    : "border-[#E0E8F3] bg-white text-[#71829A] hover:border-[#2463EB]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

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
