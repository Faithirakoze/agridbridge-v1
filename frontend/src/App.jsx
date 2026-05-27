import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import LoginPage  from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmingTypePage from './pages/FarmingTypePage';
import HomePage   from './pages/HomePage';
import FarmsPage  from './pages/FarmsPage';
import CropsPage  from './pages/CropsPage';
import LivestockPage from './pages/LivestockPage';
import MarketPage from './pages/MarketPage';
import RecordPage from './pages/RecordPage';
import Layout     from './components/Layout';

function Protected({ children }) {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function FarmingTypeGate({ children }) {
  const farmingType = useStore((s) => s.farmingType);
  return farmingType ? children : <Navigate to="/choose-farming" replace />;
}

function FarmingHome() {
  const farmingType = useStore((s) => s.farmingType);
  return farmingType === 'livestock' ? <LivestockPage type="dashboard" /> : <HomePage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/choose-farming" element={
        <Protected>
          <FarmingTypePage />
        </Protected>
      } />
      <Route path="/" element={
        <Protected>
          <FarmingTypeGate>
            <Layout />
          </FarmingTypeGate>
        </Protected>
      }>
        <Route index          element={<FarmingHome />} />
        <Route path="farms"   element={<FarmsPage />}  />
        <Route path="crops"   element={<CropsPage />}  />
        <Route path="market"  element={<MarketPage />} />
        <Route path="record"  element={<RecordPage />} />
        <Route path="livestock-dashboard" element={<LivestockPage type="dashboard" />} />
        <Route path="health-vaccination" element={<LivestockPage type="health" />} />
        <Route path="feed-water" element={<LivestockPage type="feed" />} />
        <Route path="breeding-reproduction" element={<LivestockPage type="breeding" />} />
        <Route path="livestock-finances" element={<LivestockPage type="finances" />} />
        <Route path="inventory-equipment" element={<LivestockPage type="inventory" />} />
        <Route path="production-yield" element={<LivestockPage type="production" />} />
        <Route path="livestock-alerts" element={<LivestockPage type="alerts" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
