import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
