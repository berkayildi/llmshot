import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import LandingPage from './components/LandingPage';
import DomainDashboard from './components/DomainDashboard';

const GLOBAL_SOURCES: Array<{ label: string; url: string }> = [
  { label: 'GitHub', url: 'https://github.com/berkayildi/llmshot' },
  {
    label: 'Data Sources',
    url: 'https://github.com/berkayildi/llm-benchmarks',
  },
];

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-300">
        <TopNav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/realtime" element={<DomainDashboard domainId="realtime" />} />
            <Route
              path="/text-generation"
              element={<DomainDashboard domainId="text-generation" />}
            />
          </Routes>
        </main>
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
    </BrowserRouter>
  );
}

export default App;
