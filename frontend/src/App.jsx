import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import LoginPage  from './pages/LoginPage';
import HomePage   from './pages/HomePage';
import CropsPage  from './pages/CropsPage';
import MarketPage from './pages/MarketPage';
import RecordPage from './pages/RecordPage';
import Layout     from './components/Layout';

function Protected({ children }) {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <Protected>
          <Layout />
        </Protected>
      }>
        <Route index          element={<HomePage />}   />
        <Route path="crops"   element={<CropsPage />}  />
        <Route path="market"  element={<MarketPage />} />
        <Route path="record"  element={<RecordPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
