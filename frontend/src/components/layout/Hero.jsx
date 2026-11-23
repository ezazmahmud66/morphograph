
import { siteConfig } from "../../config/site";

function Hero() {
  return (
    <section
      id="home"
      className="mx-auto w-full max-w-4xl px-6 pt-14 pb-10 text-center sm:pt-16 sm:pb-12"
      aria-labelledby="hero-title"
    >
      {/* Main heading */}
      <h1
        id="hero-title"
        className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[43px]"
      >
        {siteConfig.title}
      </h1>

      {/* Research description */}
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
        A simple research tool for MRI classification and segmentation
      </p>
    </section>
  );
}

export default Hero;
