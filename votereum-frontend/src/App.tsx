import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import DashboardLayout from "./layouts/DashboardLayout";

// Import pages (to be created)
const Dashboard = () => <div className="p-4">Dashboard Content</div>;
const Vote = () => <div className="p-4">Voting Page</div>;
const Candidates = () => <div className="p-4">Candidates List</div>;
const Results = () => <div className="p-4">Election Results</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/vote"
          element={
            <DashboardLayout>
              <Vote />
            </DashboardLayout>
          }
        />
        <Route
          path="/candidates"
          element={
            <DashboardLayout>
              <Candidates />
            </DashboardLayout>
          }
        />
        <Route
          path="/results"
          element={
            <DashboardLayout>
              <Results />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
