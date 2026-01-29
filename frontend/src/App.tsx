import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard } from './pages/Dashboard';
import { AuthFlow } from './pages/AuthFlow';
import { HeaderStorage } from './pages/HeaderStorage';
import { CookieStorage } from './pages/CookieStorage';
import { Guards } from './pages/Guards';
import { Algorithms } from './pages/Algorithms';
import { EdgeCases } from './pages/EdgeCases';
import { TokenPlayground } from './pages/TokenPlayground';
import { AllTests } from './pages/AllTests';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth-flow" element={<AuthFlow />} />
          <Route path="/header-storage" element={<HeaderStorage />} />
          <Route path="/cookie-storage" element={<CookieStorage />} />
          <Route path="/guards" element={<Guards />} />
          <Route path="/algorithms" element={<Algorithms />} />
          <Route path="/edge-cases" element={<EdgeCases />} />
          <Route path="/token-playground" element={<TokenPlayground />} />
          <Route path="/all-tests" element={<AllTests />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
