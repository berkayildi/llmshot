import { useHashRoute } from './hooks/useHashRoute';
import TopNav from './components/TopNav';
import LandingPage from './components/LandingPage';
import DomainDashboard from './components/DomainDashboard';
import { DOMAINS } from './services/benchmarkLoader';

const GLOBAL_SOURCES: Array<{ label: string; url: string }> = [
  { label: 'GitHub', url: 'https://github.com/berkayildi/llmshot' },
  {
    label: 'Data Sources',
    url: 'https://github.com/berkayildi/llm-benchmarks',
  },
];

function App() {
  const route = useHashRoute();
  const domainEntry = Object.values(DOMAINS).find(
    (d) => d.route === `#${route}`,
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <TopNav route={route} />
      {domainEntry ? (
        <DomainDashboard domainId={domainEntry.id} />
      ) : (
        <LandingPage />
      )}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {GLOBAL_SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 no-underline hover:underline hover:text-gray-400 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
