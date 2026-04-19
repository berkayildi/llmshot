import { DOMAINS } from "../services/benchmarkLoader";

interface TopNavProps {
  route: string;
}

export default function TopNav({ route }: TopNavProps) {
  const activeId = Object.values(DOMAINS).find((d) => d.route === `#${route}`)?.id;

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <a
          href="#/"
          className="flex items-center text-base font-semibold text-gray-100 tracking-tight hover:text-white"
        >
          LLMShot
          <span className="text-[10px] text-gray-600 font-mono ml-2">
            v{__APP_VERSION__}
          </span>
        </a>
        <nav className="flex items-center gap-1 flex-wrap">
          {Object.values(DOMAINS).map((d) => {
            const isActive = activeId === d.id;
            return (
              <a
                key={d.id}
                href={d.route}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isActive
                    ? "text-gray-100 bg-gray-800/60"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {d.name}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
