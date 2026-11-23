
function ResearchOverview() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto mt-20 w-full max-w-[760px]
                 scroll-mt-24 rounded-[22px]
                 border border-[#E0E8F3] bg-white
                 p-6 sm:p-8"
    >
      <h2
        id="about-title"
        className="text-xl font-semibold text-[#12233D] sm:text-2xl"
      >
        About MorphoGraph
      </h2>

      <p className="mt-4 text-sm leading-7 text-[#71829A]">
        MorphoGraph is an academic research project focused on
        brain tumor MRI classification and segmentation using
        deep learning and graph-based learning techniques.
      </p>

      <p className="mt-3 text-sm leading-7 text-[#71829A]">
        This web application is designed to demonstrate
        MRI image analysis through a simple interface,
        including tumor classification, segmentation
        visualization, and model-generated confidence scores.
      </p>
    </section>
  );
}

export default ResearchOverview;
