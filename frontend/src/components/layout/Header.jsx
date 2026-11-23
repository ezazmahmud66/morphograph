
import { siteConfig } from "../../config/site";

function Header() {
  return (
    <header className="w-full border-b border-slate-100 bg-white">
      <nav
        className="mx-auto flex h-[86px] max-w-[1240px]
                   items-center justify-between px-6
                   sm:px-8 lg:px-0"
        aria-label="Main navigation"
      >
        {/* Website branding */}
        <a
          href="#home"
          className="flex items-center gap-3"
        >
          <div
            className="flex h-10 w-10 items-center
                       justify-center rounded-xl bg-blue-50
                       text-xl font-bold text-blue-600"
            aria-hidden="true"
          >
            ◉
          </div>

          <span className="text-xl font-semibold text-slate-900">
            {siteConfig.name}
          </span>
        </a>

        {/* Navigation links */}
        <div className="flex items-center gap-5 sm:gap-9">
          {siteConfig.navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-medium text-slate-600
                         transition-colors hover:text-blue-600
                         sm:text-sm"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;
