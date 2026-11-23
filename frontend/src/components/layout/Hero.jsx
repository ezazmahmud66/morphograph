
import { siteConfig } from "../../config/site";

function Hero() {
  return (
    <section
      id="home"
      className="mx-auto w-full max-w-4xl scroll-mt-20
                 px-4 pt-12 pb-9 text-center
                 sm:px-6 sm:pt-16 sm:pb-12"
      aria-labelledby="hero-title"
    >
      <h1
        id="hero-title"
        className="text-[clamp(1.75rem,5vw,2.6875rem)]
                   leading-tight font-semibold tracking-tight
                   text-[#12233D]"
      >
        {siteConfig.title}
      </h1>

      <p
        className="mx-auto mt-4 max-w-2xl
                   text-sm leading-relaxed text-[#71829A]
                   sm:text-base"
      >
        A simple research tool for MRI classification and segmentation
      </p>
    </section>
  );
}

export default Hero;
