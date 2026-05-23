import { HashRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ArchitecturePage from './pages/ArchitecturePage';
import PipelinePage from './pages/PipelinePage';
import OutagePage from './pages/OutagePage';
import RenewablesPage from './pages/RenewablesPage';
import AssetsPage from './pages/AssetsPage';
import CustomerPage from './pages/CustomerPage';
import ESGPage from './pages/ESGPage';
import PolicyPage from './pages/PolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import DbtWizardPage from './pages/DbtWizardPage';
import GridScenarioPage from './pages/GridScenarioPage';
import WizardLivePage from './pages/WizardLivePage';
import GridOutcomePage from './pages/GridOutcomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/outages" element={<OutagePage />} />
            <Route path="/renewables" element={<RenewablesPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/esg" element={<ESGPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dbt-wizard" element={<DbtWizardPage />} />
            <Route path="/grid-scenario" element={<GridScenarioPage />} />
            <Route path="/wizard-live" element={<WizardLivePage />} />
            <Route path="/grid-outcome" element={<GridOutcomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
