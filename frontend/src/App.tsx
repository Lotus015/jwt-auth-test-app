import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard } from './pages/Dashboard';

// Placeholder pages for future stories
function AuthFlow() {
  return <div className="text-gray-500">Auth Flow Tests - Coming Soon</div>;
}

function HeaderStorage() {
  return <div className="text-gray-500">Header Storage Tests - Coming Soon</div>;
}

function CookieStorage() {
  return <div className="text-gray-500">Cookie Storage Tests - Coming Soon</div>;
}

function Guards() {
  return <div className="text-gray-500">Guards Tests - Coming Soon</div>;
}

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
