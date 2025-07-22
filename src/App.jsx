
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MedicationSearch from './components/MedicationSearch/MedicationSearch';
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PharmacyDashboard from './components/Dashboard/PharmacyDashboard';
import { LogIn } from "lucide-react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MedicationSearch />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PharmacyDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    //<div className="App">
      //<PharmacyDashboard />
    //</div>
  );
}
export default App;