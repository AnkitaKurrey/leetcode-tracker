import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProblemList from './components/ProblemList';
import DueProblems from './components/DueProblems';
import ProgressChart from './components/ProgressChart';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/due" element={<DueProblems />} />
          <Route path="/progress" element={<ProgressChart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
