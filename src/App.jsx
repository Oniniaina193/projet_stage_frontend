
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MedicationSearch from './components/MedicationSearch/MedicationSearch';
import Login from "./components/auth/Login";
import PharmacyDashboard from './components/Dashboard/PharmacyDashboard';

function App() {
  return (
    //<Router>
      //<Routes>
        //<Route path="/" element={<MedicationSearch />} />
        //<Route path="/login" element={<Login />} />
      //</Routes>
    //</Router>
    <div className="App">
      <PharmacyDashboard />
    </div>
  );
}
export default App;