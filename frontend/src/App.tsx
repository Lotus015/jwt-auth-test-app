import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard } from './pages/Dashboard';
import { AuthFlow } from './pages/AuthFlow';
import { HeaderStorage } from './pages/HeaderStorage';
import { CookieStorage } from './pages/CookieStorage';
import { Guards } from './pages/Guards';

function Algorithms() {
  return <div className="text-gray-500">Algorithms Tests - Coming Soon</div>;
}

function ErrorScenarios() {
  return <div className="text-gray-500">Error Scenarios Tests - Coming Soon</div>;
}

function TokenPlayground() {
  return <div className="text-gray-500">Token Playground - Coming Soon</div>;
}

function AllTests() {
  return <div className="text-gray-500">Run All Tests - Coming Soon</div>;
}

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
          <Route path="/error-scenarios" element={<ErrorScenarios />} />
          <Route path="/token-playground" element={<TokenPlayground />} />
          <Route path="/all-tests" element={<AllTests />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
